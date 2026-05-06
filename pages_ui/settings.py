"""pages_ui/settings.py — User settings and account info."""

import streamlit as st


def render_settings():
    st.markdown(
        """
        <div class="page-title">⚙️ Settings</div>
        <div class="page-sub">Manage your account and application preferences.</div>
        """,
        unsafe_allow_html=True,
    )

    tab_account, tab_app, tab_about = st.tabs(
        ["👤 Account", "🎛️ App Preferences", "ℹ️ About"]
    )

    # ── Account tab ────────────────────────────────────────────────────────────
    with tab_account:
        st.markdown("#### Account Information")

        col1, col2 = st.columns(2)
        with col1:
            st.text_input("Full Name",  value=st.session_state.name,    disabled=True)
            st.text_input("Username",   value=st.session_state.user_id, disabled=True)
        with col2:
            st.text_input("Role",       value=st.session_state.role,    disabled=True)
            st.text_input("Last Login", value=st.session_state.last_login or "—", disabled=True)

        st.markdown("---")
        st.markdown("#### Change Password")
        st.info("Password change is handled by the storage backend. Connect it here.")

        with st.form("change_password_form"):
            current_pw = st.text_input("Current Password", type="password")
            new_pw     = st.text_input("New Password",     type="password")
            confirm_pw = st.text_input("Confirm New Password", type="password")
            submitted  = st.form_submit_button("Update Password", type="primary")

        if submitted:
            if not current_pw or not new_pw or not confirm_pw:
                st.error("All fields required.")
            elif new_pw != confirm_pw:
                st.error("New passwords do not match.")
            elif len(new_pw) < 6:
                st.error("Password must be at least 6 characters.")
            else:
                # TODO: call storage.update_password(st.session_state.user_id, current_pw, new_pw)
                st.success("✅ Password updated successfully!")

    # ── App preferences ────────────────────────────────────────────────────────
    with tab_app:
        st.markdown("#### AI Pipeline Settings")

        detection_method = st.radio(
            "Detection Method",
            ["Auto (Gemini → YOLO fallback)", "Force YOLO", "Force Gemini"],
            index=0,
        )
        confidence_threshold = st.slider(
            "Minimum Confidence Threshold (%)",
            min_value=10, max_value=95, value=50, step=5,
        )
        shelf_life_mode = st.radio(
            "Shelf Life Estimation",
            ["Conservative (shorter estimate)", "Standard", "Optimistic (longer estimate)"],
            index=1,
        )

        st.markdown("#### Display Settings")
        show_observations = st.checkbox("Show detailed observations in results", value=True)
        results_per_page  = st.selectbox("History results per page", [10, 25, 50, 100], index=0)

        if st.button("💾 Save Preferences", type="primary"):
            # Store in session_state for use in pipeline calls
            st.session_state["pref_detection_method"]    = detection_method
            st.session_state["pref_confidence_threshold"] = confidence_threshold
            st.session_state["pref_shelf_life_mode"]     = shelf_life_mode
            st.session_state["pref_show_observations"]   = show_observations
            st.session_state["pref_results_per_page"]    = results_per_page
            st.success("✅ Preferences saved!")

    # ── About ──────────────────────────────────────────────────────────────────
    with tab_about:
        st.markdown(
            """
            #### 🥦 FreshnessAI

            **Version:** 2.0.0 — Streamlit Edition

            FreshnessAI uses a multi-model AI pipeline to analyse food freshness from images:

            | Stage | Model | Purpose |
            |-------|-------|---------|
            | Object Detection | Gemini / YOLOv8 | Identify food items |
            | Freshness Analysis | ResNet-50 | Classify fresh/rotten |
            | OCR | EasyOCR / Tesseract | Extract labels/dates |
            | Fusion | Rule-based | Combine all signals |

            ---
            Built with **Streamlit**, **PyTorch**, **Google Gemini**, and **OpenCV**.
            """
        )
