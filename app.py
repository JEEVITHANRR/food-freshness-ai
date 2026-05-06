"""
FreshnessAI — Streamlit Entry Point
Run with: streamlit run app.py
"""

import streamlit as st

# ── Page config (must be FIRST Streamlit call) ──────────────────────────────
st.set_page_config(
    page_title="FreshnessAI",
    page_icon="🥦",
    layout="wide",
    initial_sidebar_state="expanded",
)

# ── Internal page imports ────────────────────────────────────────────────────
from pages_ui.auth     import render_login, render_signup
from pages_ui.dashboard import render_dashboard
from pages_ui.upload   import render_upload
from pages_ui.history  import render_history
from pages_ui.settings import render_settings
from ui.styles         import inject_global_css

# ── Bootstrap session state ──────────────────────────────────────────────────
DEFAULTS = {
    "authenticated": False,
    "user_id":       None,
    "name":          None,
    "role":          None,
    "last_login":    None,
    "current_page":  "login",   # login | signup | dashboard | upload | history | settings
}
for key, val in DEFAULTS.items():
    st.session_state.setdefault(key, val)

# ── Global CSS ───────────────────────────────────────────────────────────────
inject_global_css()


# ── Sidebar navigation (shown only when logged in) ───────────────────────────
def sidebar_nav():
    with st.sidebar:
        st.markdown(
            """
            <div class="sidebar-brand">
                <span class="brand-icon">🥦</span>
                <span class="brand-name">FreshnessAI</span>
            </div>
            """,
            unsafe_allow_html=True,
        )

        st.markdown("---")
        st.markdown(
            f"<div class='sidebar-user'>👤 &nbsp;<b>{st.session_state.name}</b></div>",
            unsafe_allow_html=True,
        )
        if st.session_state.last_login:
            st.caption(f"Last login: {st.session_state.last_login}")

        st.markdown("---")

        nav_items = {
            "📊  Dashboard":   "dashboard",
            "📤  Upload Image": "upload",
            "📜  History":     "history",
            "⚙️  Settings":    "settings",
        }
        for label, page in nav_items.items():
            active = "nav-active" if st.session_state.current_page == page else ""
            if st.button(label, key=f"nav_{page}", use_container_width=True):
                st.session_state.current_page = page
                st.rerun()

        st.markdown("---")
        if st.button("🚪  Logout", use_container_width=True, type="secondary"):
            for key in list(DEFAULTS.keys()):
                st.session_state[key] = DEFAULTS[key]
            st.session_state.current_page = "login"
            st.rerun()


# ── Router ───────────────────────────────────────────────────────────────────
def main():
    page = st.session_state.current_page

    # ── Unauthenticated routes ────────────────────────────────────────────────
    if not st.session_state.authenticated:
        if page == "signup":
            render_signup()
        else:
            render_login()
        return

    # ── Authenticated routes ──────────────────────────────────────────────────
    sidebar_nav()

    dispatch = {
        "dashboard": render_dashboard,
        "upload":    render_upload,
        "history":   render_history,
        "settings":  render_settings,
    }
    renderer = dispatch.get(page, render_dashboard)
    renderer()


if __name__ == "__main__":
    main()
