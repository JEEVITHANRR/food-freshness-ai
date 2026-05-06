"""pages_ui/history.py — Scan history with search and filter."""

import streamlit as st
from storage import get_user_history


def _badge(label: str) -> str:
    label_lower = label.lower()
    if "fresh"  in label_lower: cls = "badge-fresh"
    elif "rotten" in label_lower: cls = "badge-rotten"
    else: cls = "badge-warning"
    return f'<span class="badge {cls}">{label}</span>'


def render_history():
    st.markdown(
        """
        <div class="page-title">📜 Scan History</div>
        <div class="page-sub">All your previous freshness detection results.</div>
        """,
        unsafe_allow_html=True,
    )

    history = get_user_history(st.session_state.user_id)
    history = history[::-1]   # newest first

    if not history:
        st.info("No scan history yet. Upload an image to get started!")
        if st.button("📤 Upload Image", type="primary"):
            st.session_state.current_page = "upload"
            st.rerun()
        return

    # ── Filters ────────────────────────────────────────────────────────────────
    all_freshness = sorted({r.get("freshness", "Unknown") for r in history})
    all_cats      = sorted({r.get("category",  "Unknown") for r in history})

    f_col, c_col, s_col = st.columns([1, 1, 2])
    with f_col:
        fresh_filter = st.selectbox("Filter by Freshness", ["All"] + all_freshness)
    with c_col:
        cat_filter   = st.selectbox("Filter by Category",  ["All"] + all_cats)
    with s_col:
        search_term  = st.text_input("🔍 Search item name", placeholder="e.g. Apple")

    # ── Apply filters ──────────────────────────────────────────────────────────
    filtered = history
    if fresh_filter != "All":
        filtered = [r for r in filtered if r.get("freshness") == fresh_filter]
    if cat_filter != "All":
        filtered = [r for r in filtered if r.get("category") == cat_filter]
    if search_term:
        filtered = [
            r for r in filtered
            if search_term.lower() in r.get("item_name", "").lower()
        ]

    st.markdown(
        f"<p style='color:var(--neutral-700);font-size:0.9rem;'>"
        f"Showing <b>{len(filtered)}</b> of <b>{len(history)}</b> records.</p>",
        unsafe_allow_html=True,
    )

    if not filtered:
        st.warning("No records match your filters.")
        return

    # ── Table ──────────────────────────────────────────────────────────────────
    st.markdown(
        """
        <div class="hist-row result-header">
            <span>Item</span>
            <span>Category</span>
            <span>Freshness</span>
            <span>Confidence</span>
            <span>Expiry Date</span>
        </div>
        """,
        unsafe_allow_html=True,
    )

    for row in filtered:
        conf = row.get("confidence", 0)
        conf_str = f"{conf:.1f}%" if isinstance(conf, (int, float)) else str(conf)
        expiry   = row.get("expiry_date", "—")
        # Highlight rows expiring soon
        expiry_color = "var(--red)" if _is_expiring_soon(expiry) else "inherit"

        st.markdown(
            f"""
            <div class="hist-row">
                <span>🥬 <b>{row.get("item_name","Unknown")}</b></span>
                <span style="color:var(--neutral-700)">{row.get("category","—")}</span>
                <span>{_badge(row.get("freshness","Unknown"))}</span>
                <span>{conf_str}</span>
                <span style="color:{expiry_color};font-weight:500">{expiry}</span>
            </div>
            """,
            unsafe_allow_html=True,
        )

    # ── Export as CSV ──────────────────────────────────────────────────────────
    st.markdown("<br>", unsafe_allow_html=True)
    if st.button("📥 Export CSV", use_container_width=False):
        import csv, io
        buf = io.StringIO()
        writer = csv.DictWriter(
            buf,
            fieldnames=["item_name", "category", "freshness", "confidence", "expiry_date"],
            extrasaction="ignore",
        )
        writer.writeheader()
        writer.writerows(filtered)
        st.download_button(
            "⬇️ Download CSV",
            data=buf.getvalue(),
            file_name="freshness_history.csv",
            mime="text/csv",
        )


def _is_expiring_soon(expiry_str: str) -> bool:
    """Returns True if expiry date is within 3 days from today."""
    from datetime import datetime
    try:
        expiry = datetime.strptime(expiry_str, "%Y-%m-%d")
        delta  = (expiry - datetime.now()).days
        return 0 <= delta <= 3
    except Exception:
        return False
