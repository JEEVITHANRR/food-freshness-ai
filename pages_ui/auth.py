"""pages_ui/auth.py — Login and Signup screens."""

import streamlit as st
from datetime import datetime
from storage import verify_user, create_user


# ── helpers ──────────────────────────────────────────────────────────────────

def _set_user(user: dict):
    st.session_state.authenticated = True
    st.session_state.user_id       = user["username"]
    st.session_state.name          = user["name"]
    st.session_state.role          = user["role"]
    st.session_state.last_login    = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    st.session_state.current_page  = "dashboard"


# ── Login ─────────────────────────────────────────────────────────────────────

def render_login():
    # Center column
    _, col, _ = st.columns([1, 1.4, 1])
    with col:
        st.markdown(
            """
            <div class="auth-wrap">
                <div class="auth-logo">🥦 FreshnessAI</div>
                <div class="auth-sub">AI-powered food freshness detection</div>
            </div>
            """,
            unsafe_allow_html=True,
        )

        # Use a real form so Enter submits
        with st.form("login_form", clear_on_submit=False):
            username = st.text_input("Username", placeholder="your_username")
            password = st.text_input("Password", type="password", placeholder="••••••••")
            submitted = st.form_submit_button("Sign In", use_container_width=True, type="primary")

        if submitted:
            if not username or not password:
                st.error("Please enter both username and password.")
            else:
                user = verify_user(username, password)
                if user:
                    _set_user(user)
                    st.rerun()
                else:
                    st.error("❌ Invalid credentials. Please try again.")

        st.markdown("---")
        st.markdown(
            "<p style='text-align:center;font-size:0.9rem;'>Don't have an account?</p>",
            unsafe_allow_html=True,
        )
        if st.button("Create Account →", use_container_width=True):
            st.session_state.current_page = "signup"
            st.rerun()


# ── Signup ────────────────────────────────────────────────────────────────────

def render_signup():
    _, col, _ = st.columns([1, 1.4, 1])
    with col:
        st.markdown(
            """
            <div class="auth-wrap">
                <div class="auth-logo">🥦 FreshnessAI</div>
                <div class="auth-sub">Create your account</div>
            </div>
            """,
            unsafe_allow_html=True,
        )

        with st.form("signup_form", clear_on_submit=False):
            fullname = st.text_input("Full Name",  placeholder="Jane Doe")
            username = st.text_input("Username",   placeholder="jane_doe")
            password = st.text_input("Password",   type="password", placeholder="Min 6 characters")
            confirm  = st.text_input("Confirm Password", type="password", placeholder="Re-enter password")
            submitted = st.form_submit_button("Create Account", use_container_width=True, type="primary")

        if submitted:
            if not all([fullname, username, password, confirm]):
                st.error("All fields are required.")
            elif len(password) < 6:
                st.error("Password must be at least 6 characters.")
            elif password != confirm:
                st.error("Passwords do not match.")
            else:
                ok = create_user(username, password, fullname)
                if ok:
                    st.success("✅ Account created! Please sign in.")
                    st.session_state.current_page = "login"
                    st.rerun()
                else:
                    st.error("Username already exists. Choose another.")

        st.markdown("---")
        st.markdown(
            "<p style='text-align:center;font-size:0.9rem;'>Already have an account?</p>",
            unsafe_allow_html=True,
        )
        if st.button("← Back to Sign In", use_container_width=True):
            st.session_state.current_page = "login"
            st.rerun()
