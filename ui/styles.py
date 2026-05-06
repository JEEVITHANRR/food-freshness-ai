"""ui/styles.py — Inject global CSS into the Streamlit app."""

import streamlit as st

_CSS = """
<style>
/* ── Google Fonts ─────────────────────────────────────────────────────────── */
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Syne:wght@700;800&display=swap');

/* ── Design tokens ────────────────────────────────────────────────────────── */
:root {
    --green-900: #0d2b1a;
    --green-800: #143d25;
    --green-600: #1e6b3a;
    --green-500: #28a745;
    --green-400: #3dd268;
    --green-100: #d4f5df;
    --amber:     #f5a623;
    --red:       #e63946;
    --neutral-50:#f8faf9;
    --neutral-100:#eef2ee;
    --neutral-200:#d8e2d8;
    --neutral-700:#374437;
    --neutral-900:#111c11;
    --card-bg:   #ffffff;
    --shadow-sm: 0 1px 3px rgba(0,0,0,.08);
    --shadow-md: 0 4px 16px rgba(0,0,0,.10);
    --radius:    12px;
}

/* ── App shell ────────────────────────────────────────────────────────────── */
html, body, [data-testid="stAppViewContainer"] {
    font-family: 'DM Sans', sans-serif;
    background: var(--neutral-50);
    color: var(--neutral-900);
}

/* ── Hide default Streamlit chrome ───────────────────────────────────────── */
#MainMenu, footer, header { visibility: hidden; }
[data-testid="stDeployButton"] { display: none; }

/* ── Sidebar ──────────────────────────────────────────────────────────────── */
[data-testid="stSidebar"] {
    background: var(--green-900) !important;
    border-right: 1px solid var(--green-800);
}
[data-testid="stSidebar"] * { color: #c8e6c9 !important; }

.sidebar-brand {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 0 4px;
}
.brand-icon { font-size: 2rem; }
.brand-name {
    font-family: 'Syne', sans-serif;
    font-size: 1.4rem;
    font-weight: 800;
    color: #ffffff !important;
    letter-spacing: -0.5px;
}
.sidebar-user {
    font-size: 0.95rem;
    padding: 4px 0;
    color: #a5d6a7 !important;
}

/* Sidebar buttons */
[data-testid="stSidebar"] .stButton > button {
    background: transparent;
    border: none;
    color: #c8e6c9 !important;
    text-align: left;
    font-size: 0.95rem;
    padding: 10px 14px;
    border-radius: 8px;
    transition: background 0.18s, color 0.18s;
    width: 100%;
}
[data-testid="stSidebar"] .stButton > button:hover {
    background: var(--green-800);
    color: #ffffff !important;
}

/* ── Cards ────────────────────────────────────────────────────────────────── */
.card {
    background: var(--card-bg);
    border-radius: var(--radius);
    box-shadow: var(--shadow-sm);
    padding: 1.5rem;
    border: 1px solid var(--neutral-200);
}
.card-metric {
    text-align: center;
}
.metric-value {
    font-family: 'Syne', sans-serif;
    font-size: 2.8rem;
    font-weight: 800;
    color: var(--green-600);
    line-height: 1;
}
.metric-label {
    font-size: 0.85rem;
    color: var(--neutral-700);
    margin-top: 4px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

/* ── Page headings ────────────────────────────────────────────────────────── */
.page-title {
    font-family: 'Syne', sans-serif;
    font-size: 2rem;
    font-weight: 800;
    color: var(--green-900);
    letter-spacing: -0.5px;
    margin-bottom: 0.2rem;
}
.page-sub {
    color: var(--neutral-700);
    font-size: 0.95rem;
    margin-bottom: 1.5rem;
}

/* ── Freshness badges ────────────────────────────────────────────────────── */
.badge {
    display: inline-block;
    padding: 3px 12px;
    border-radius: 999px;
    font-size: 0.8rem;
    font-weight: 600;
}
.badge-fresh   { background: var(--green-100); color: var(--green-600); }
.badge-rotten  { background: #fde8e8;          color: var(--red);       }
.badge-warning { background: #fff4e0;          color: #b45309;          }

/* ── Auth card ────────────────────────────────────────────────────────────── */
.auth-wrap {
    max-width: 420px;
    margin: 6vh auto;
    background: var(--card-bg);
    border-radius: 18px;
    box-shadow: var(--shadow-md);
    padding: 2.5rem 2rem;
    border: 1px solid var(--neutral-200);
}
.auth-logo {
    text-align: center;
    font-family: 'Syne', sans-serif;
    font-size: 2rem;
    font-weight: 800;
    color: var(--green-600);
    margin-bottom: 0.25rem;
}
.auth-sub {
    text-align: center;
    color: var(--neutral-700);
    font-size: 0.9rem;
    margin-bottom: 1.8rem;
}

/* ── Upload zone ──────────────────────────────────────────────────────────── */
[data-testid="stFileUploader"] {
    border: 2px dashed var(--green-400) !important;
    border-radius: var(--radius) !important;
    background: var(--neutral-50) !important;
    padding: 1rem !important;
}

/* ── Result table ────────────────────────────────────────────────────────── */
.result-row {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
    gap: 12px;
    align-items: center;
    padding: 12px 16px;
    border-radius: 8px;
    margin-bottom: 8px;
    background: var(--card-bg);
    border: 1px solid var(--neutral-200);
    box-shadow: var(--shadow-sm);
    font-size: 0.9rem;
}
.result-header {
    font-weight: 600;
    color: var(--neutral-700);
    font-size: 0.78rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

/* ── History table ───────────────────────────────────────────────────────── */
.hist-row {
    display: grid;
    grid-template-columns: 1.5fr 1fr 1fr 1fr 1fr;
    gap: 10px;
    align-items: center;
    padding: 10px 14px;
    border-radius: 8px;
    margin-bottom: 6px;
    background: var(--card-bg);
    border: 1px solid var(--neutral-200);
    font-size: 0.88rem;
}

/* ── Streamlit button overrides ──────────────────────────────────────────── */
.stButton > button[kind="primary"] {
    background: var(--green-500) !important;
    border: none !important;
    color: #fff !important;
    font-weight: 600 !important;
    border-radius: 8px !important;
    padding: 10px 24px !important;
}
.stButton > button[kind="primary"]:hover {
    background: var(--green-600) !important;
}
</style>
"""


def inject_global_css():
    st.markdown(_CSS, unsafe_allow_html=True)
