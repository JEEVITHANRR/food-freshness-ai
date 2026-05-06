"""
storage.py — SQLite-backed user auth and prediction storage.

Drop-in replacement for the original Flask storage module.
All functions are identical in signature so the AI pipeline needs zero changes.
"""

import sqlite3
import hashlib
import os
from datetime import datetime
from typing import Optional

DB_PATH = "freshness_ai.db"


# ── DB initialisation ─────────────────────────────────────────────────────────

def _get_conn() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn


def _init_db():
    conn = _get_conn()
    c    = conn.cursor()
    c.executescript(
        """
        CREATE TABLE IF NOT EXISTS users (
            username   TEXT PRIMARY KEY,
            password   TEXT NOT NULL,
            name       TEXT NOT NULL,
            role       TEXT NOT NULL DEFAULT 'user',
            created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS predictions (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id     TEXT NOT NULL,
            filename    TEXT NOT NULL,
            item_name   TEXT NOT NULL,
            category    TEXT,
            freshness   TEXT,
            status      TEXT,
            confidence  REAL,
            expiry_date TEXT,
            created_at  TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(username)
        );
        """
    )
    conn.commit()

    # Seed a default admin account if no users exist yet
    if not c.execute("SELECT 1 FROM users LIMIT 1").fetchone():
        create_user("admin", "admin123", "Administrator", role="admin")
    conn.close()


# ── Password hashing ──────────────────────────────────────────────────────────

def _hash(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


# ── Auth ──────────────────────────────────────────────────────────────────────

def verify_user(username: str, password: str) -> Optional[dict]:
    """Returns user dict on success, None on failure."""
    conn = _get_conn()
    row  = conn.execute(
        "SELECT * FROM users WHERE username = ? AND password = ?",
        (username, _hash(password)),
    ).fetchone()
    conn.close()
    return dict(row) if row else None


def create_user(
    username: str,
    password: str,
    name:     str,
    role:     str = "user",
) -> bool:
    """Returns True on success, False if username already exists."""
    conn = _get_conn()
    try:
        conn.execute(
            "INSERT INTO users (username, password, name, role, created_at) "
            "VALUES (?, ?, ?, ?, ?)",
            (username, _hash(password), name, role, datetime.now().isoformat()),
        )
        conn.commit()
        return True
    except sqlite3.IntegrityError:
        return False
    finally:
        conn.close()


def update_password(username: str, old_password: str, new_password: str) -> bool:
    """Returns True on success."""
    conn    = _get_conn()
    user    = conn.execute(
        "SELECT 1 FROM users WHERE username = ? AND password = ?",
        (username, _hash(old_password)),
    ).fetchone()
    if not user:
        conn.close()
        return False
    conn.execute(
        "UPDATE users SET password = ? WHERE username = ?",
        (_hash(new_password), username),
    )
    conn.commit()
    conn.close()
    return True


# ── Predictions ───────────────────────────────────────────────────────────────

def save_prediction(
    user_id:     str,
    filename:    str,
    item_name:   str,
    category:    str,
    freshness:   str,
    status:      str,
    confidence:  float,
    expiry_date: str,
) -> int:
    """Inserts a prediction row and returns the new row id."""
    conn = _get_conn()
    cur  = conn.execute(
        """
        INSERT INTO predictions
            (user_id, filename, item_name, category, freshness,
             status, confidence, expiry_date, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            user_id, filename, item_name, category, freshness,
            status, confidence, expiry_date, datetime.now().isoformat(),
        ),
    )
    conn.commit()
    row_id = cur.lastrowid
    conn.close()
    return row_id


def get_user_history(user_id: str) -> list[dict]:
    """Returns all predictions for the given user, oldest first."""
    conn = _get_conn()
    rows = conn.execute(
        "SELECT * FROM predictions WHERE user_id = ? ORDER BY created_at ASC",
        (user_id,),
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


# ── Module bootstrap (called after all functions are defined) ─────────────────
_init_db()


def get_all_stats() -> dict:
    """Returns aggregate statistics across all users."""
    conn = _get_conn()
    c    = conn.cursor()

    total   = c.execute("SELECT COUNT(*) FROM predictions").fetchone()[0]
    fresh   = c.execute(
        "SELECT COUNT(*) FROM predictions WHERE freshness LIKE '%Fresh%'"
    ).fetchone()[0]
    rotten  = c.execute(
        "SELECT COUNT(*) FROM predictions WHERE freshness LIKE '%Rotten%'"
    ).fetchone()[0]

    today   = datetime.now().date()
    expiring = c.execute(
        """
        SELECT COUNT(*) FROM predictions
        WHERE date(expiry_date) BETWEEN date('now') AND date('now', '+3 days')
        """
    ).fetchone()[0]

    users_count = c.execute("SELECT COUNT(*) FROM users").fetchone()[0]
    conn.close()

    return {
        "total_predictions": total,
        "fresh_count":       fresh,
        "rotten_count":      rotten,
        "expiring_soon":     expiring,
        "total_users":       users_count,
    }
