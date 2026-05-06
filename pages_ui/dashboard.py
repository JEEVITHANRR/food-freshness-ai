"""pages_ui/dashboard.py — Main dashboard with stats and recent uploads."""

import streamlit as st
from storage import get_all_stats, get_user_history


def _metric_card(icon: str, value, label: str, color: str = "var(--green-600)"):
    st.markdown(
        f"""
        <div class="card card-metric">
            <div style="font-size:2rem;margin-bottom:4px">{icon}</div>
            <div class="metric-value" style="color:{color}">{value}</div>
            <div class="metric-label">{label}</div>
        </div>
        """,
        unsafe_allow_html=True,
    )


def _freshness_badge(label: str) -> str:
    label_lower = label.lower()
    if "fresh" in label_lower:
        cls = "badge-fresh"
    elif "rotten" in label_lower:
        cls = "badge-rotten"
    else:
        cls = "badge-warning"
    return f'<span class="badge {cls}">{label}</span>'


def render_dashboard():
    # ── Header ────────────────────────────────────────────────────────────────
    st.markdown(
        f"""
        <div class="page-title">👋 Welcome back, {st.session_state.name}!</div>
        <div class="page-sub">Here's your freshness detection overview.</div>
        """,
        unsafe_allow_html=True,
    )

    # ── Global stats ──────────────────────────────────────────────────────────
    stats = get_all_stats()

    total_scans    = stats.get("total_predictions", 0)
    fresh_count    = stats.get("fresh_count",       0)
    rotten_count   = stats.get("rotten_count",      0)
    expiring_soon  = stats.get("expiring_soon",     0)

    c1, c2, c3, c4 = st.columns(4)
    with c1:
        _metric_card("📊", total_scans,   "Total Scans")
    with c2:
        _metric_card("✅", fresh_count,   "Fresh Items",    color="var(--green-500)")
    with c3:
        _metric_card("🚫", rotten_count,  "Rotten Items",   color="var(--red)")
    with c4:
        _metric_card("⚠️", expiring_soon, "Expiring Soon",  color="var(--amber)")

    st.markdown("<br>", unsafe_allow_html=True)

    # ── Two-column layout: quick action + recent activity ─────────────────────
    left, right = st.columns([1, 2], gap="large")

    with left:
        st.markdown('<div class="card">', unsafe_allow_html=True)
        st.markdown("### 🚀 Quick Actions")
        if st.button("📤 Upload New Image", use_container_width=True, type="primary"):
            st.session_state.current_page = "upload"
            st.rerun()
        st.markdown("<br>", unsafe_allow_html=True)
        if st.button("📜 View Full History", use_container_width=True):
            st.session_state.current_page = "history"
            st.rerun()

        st.markdown("<br>", unsafe_allow_html=True)
        st.markdown("#### 📈 Freshness Ratio")
        total = fresh_count + rotten_count or 1
        fresh_pct  = round(fresh_count  / total * 100)
        rotten_pct = round(rotten_count / total * 100)

        st.markdown(
            f"""
            <div style="margin-top:6px">
                <div style="display:flex;justify-content:space-between;font-size:0.85rem;margin-bottom:4px">
                    <span>🟢 Fresh</span><span>{fresh_pct}%</span>
                </div>
            </div>
            """,
            unsafe_allow_html=True,
        )
        st.progress(fresh_pct / 100)

        st.markdown(
            f"""
            <div style="margin-top:6px">
                <div style="display:flex;justify-content:space-between;font-size:0.85rem;margin-bottom:4px">
                    <span>🔴 Rotten</span><span>{rotten_pct}%</span>
                </div>
            </div>
            """,
            unsafe_allow_html=True,
        )
        st.progress(rotten_pct / 100)
        st.markdown("</div>", unsafe_allow_html=True)

    with right:
        st.markdown('<div class="card">', unsafe_allow_html=True)
        st.markdown("### 🕐 Recent Activity")

        user_history = get_user_history(st.session_state.user_id)
        recent       = user_history[-5:][::-1]   # last 5, newest first

        if not recent:
            st.info("No scans yet. Upload your first image to get started!")
        else:
            # Header row
            st.markdown(
                """
                <div class="result-row result-header">
                    <span>Item</span>
                    <span>Category</span>
                    <span>Freshness</span>
                    <span>Confidence</span>
                    <span>Expires</span>
                </div>
                """,
                unsafe_allow_html=True,
            )
            for row in recent:
                badge = _freshness_badge(row.get("freshness", "Unknown"))
                conf  = row.get("confidence", 0)
                conf_display = f"{conf:.0f}%" if isinstance(conf, (int, float)) else str(conf)
                st.markdown(
                    f"""
                    <div class="result-row">
                        <span>🥬 <b>{row.get("item_name", "Unknown")}</b></span>
                        <span style="color:var(--neutral-700)">{row.get("category", "—")}</span>
                        <span>{badge}</span>
                        <span>{conf_display}</span>
                        <span style="font-size:0.82rem;color:var(--neutral-700)">{row.get("expiry_date", "—")}</span>
                    </div>
                    """,
                    unsafe_allow_html=True,
                )
        st.markdown("</div>", unsafe_allow_html=True)

    # ── Last login info ───────────────────────────────────────────────────────
    if st.session_state.last_login:
        st.caption(f"🕐 Last login: {st.session_state.last_login}")
