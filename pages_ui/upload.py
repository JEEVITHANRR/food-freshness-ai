"""pages_ui/upload.py — Image upload page with the full AI pipeline."""

import os
import time
import streamlit as st
from datetime import datetime, timedelta
from collections import Counter
from PIL import Image

from storage import save_prediction

UPLOAD_FOLDER = "static/uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

ALLOWED_TYPES = ["image/png", "image/jpeg", "image/jpg"]


# ── Freshness badge helper ─────────────────────────────────────────────────────

def _badge(label: str) -> str:
    label_lower = label.lower()
    if "fresh" in label_lower:
        cls = "badge-fresh"
    elif "rotten" in label_lower:
        cls = "badge-rotten"
    else:
        cls = "badge-warning"
    return f'<span class="badge {cls}">{label}</span>'


# ── Run the AI pipeline ────────────────────────────────────────────────────────

def _run_pipeline(image_path: str) -> tuple[list[dict], int, str]:
    """
    Runs the full AI pipeline:
      1. Detect objects (Gemini with YOLO fallback)
      2. Freshness prediction (ResNet if Gemini didn't supply it)
      3. OCR analysis
      4. Result fusion

    Returns:
        processed_data  — list of item dicts
        total_items     — int
        display_image   — filename of image to display (possibly annotated)
    """
    filename = os.path.basename(image_path)

    # -- Import AI modules (kept separate to avoid startup-time errors) --------
    from gemini_detect    import detect_with_fallback
    from resnet_freshness import predict_freshness
    from ocr_module       import extract_product_info
    from result_fusion    import fuse_results

    # 1. Object detection
    detection_result, _method = detect_with_fallback(image_path)

    # 2. Freshness (skip ResNet if Gemini already gave freshness)
    freshness_result      = {}
    has_gemini_freshness  = any(
        i.get("freshness") for i in detection_result.get("items", [])
    )
    if not has_gemini_freshness:
        freshness_result = predict_freshness(image_path)

    # 3. OCR
    ocr_result = extract_product_info(image_path)

    # 4. Fuse
    fusion = fuse_results(detection_result, freshness_result, ocr_result)

    # 5. Format for UI
    processed_data = []
    for item in fusion["items"]:
        processed_data.append(
            {
                "name":         item["name"],
                "category":     item["category"],
                "confidence":   item["freshness"]["confidence"] * 100,
                "freshness":    item["freshness"]["label"],
                "shelf_life":   item["shelf_life"]["estimated_days"],
                "count":        item["count"],
                "observations": item.get("observations"),
            }
        )

    total_items = fusion["total_items"]

    # 6. Save annotated image if available
    if detection_result.get("annotated_image"):
        annotated_filename = f"annotated_{filename}"
        annotated_path     = os.path.join(UPLOAD_FOLDER, annotated_filename)
        detection_result["annotated_image"].save(annotated_path)
        display_image = annotated_filename
    else:
        display_image = filename

    return processed_data, total_items, display_image


# ── Persist results to DB ──────────────────────────────────────────────────────

def _save_results(user_id: str, filename: str, processed_data: list[dict]):
    for item in processed_data:
        expiry = (
            datetime.now() + timedelta(days=item["shelf_life"])
        ).strftime("%Y-%m-%d")
        save_prediction(
            user_id,
            filename,
            item["name"],
            item["category"],
            item["freshness"],
            "Active",
            item["confidence"],
            expiry,
        )


# ── Render results ─────────────────────────────────────────────────────────────

def _render_results(processed_data: list[dict], display_image: str, total_items: int):
    st.markdown("---")
    st.markdown('<div class="page-title">📋 Analysis Results</div>', unsafe_allow_html=True)

    # Summary cards
    fresh_count   = sum(1 for i in processed_data if "Fresh"  in i["freshness"])
    rotten_count  = sum(1 for i in processed_data if "Rotten" in i["freshness"])
    expiring_soon = sum(1 for i in processed_data if i["shelf_life"] <= 3)

    c1, c2, c3, c4 = st.columns(4)
    c1.metric("📦 Total Items",    total_items)
    c2.metric("✅ Fresh",          fresh_count)
    c3.metric("🚫 Rotten",         rotten_count)
    c4.metric("⚠️  Expiring ≤3d",  expiring_soon)

    st.markdown("<br>", unsafe_allow_html=True)

    img_col, table_col = st.columns([1, 2], gap="large")

    with img_col:
        image_path = os.path.join(UPLOAD_FOLDER, display_image)
        if os.path.exists(image_path):
            st.image(image_path, caption="Analysed Image", use_container_width=True)
        else:
            st.warning("Annotated image not found.")

    with table_col:
        st.markdown("#### 🔍 Item Breakdown")

        # Header
        st.markdown(
            """
            <div class="result-row result-header">
                <span>Item (×Qty)</span>
                <span>Category</span>
                <span>Freshness</span>
                <span>Confidence</span>
                <span>Shelf Life</span>
            </div>
            """,
            unsafe_allow_html=True,
        )

        for item in processed_data:
            obs_html = (
                f"<br><small style='color:#888'>{item['observations']}</small>"
                if item.get("observations") else ""
            )
            shelf_color = (
                "var(--red)"   if item["shelf_life"] <= 1 else
                "var(--amber)" if item["shelf_life"] <= 3 else
                "var(--green-600)"
            )
            st.markdown(
                f"""
                <div class="result-row">
                    <span><b>{item['name']}</b> ×{item['count']}{obs_html}</span>
                    <span style="color:var(--neutral-700)">{item['category']}</span>
                    <span>{_badge(item['freshness'])}</span>
                    <span>{item['confidence']:.1f}%</span>
                    <span style="font-weight:600;color:{shelf_color}">
                        {item['shelf_life']}d
                    </span>
                </div>
                """,
                unsafe_allow_html=True,
            )

    # Freshness distribution chart
    st.markdown("<br>", unsafe_allow_html=True)
    st.markdown("#### 📊 Freshness Distribution")

    freshness_counter = Counter(item["freshness"] for item in processed_data)
    if freshness_counter:
        chart_data = dict(freshness_counter)
        st.bar_chart(chart_data)

    # Re-upload
    st.markdown("<br>", unsafe_allow_html=True)
    if st.button("📤 Analyse Another Image", type="primary"):
        st.session_state.pop("upload_results", None)
        st.rerun()


# ── Main render ────────────────────────────────────────────────────────────────

def render_upload():
    st.markdown(
        """
        <div class="page-title">📤 Upload Image</div>
        <div class="page-sub">Upload a photo of your food items for AI-powered freshness detection.</div>
        """,
        unsafe_allow_html=True,
    )

    # If results are cached in session, show them directly
    if "upload_results" in st.session_state:
        cached = st.session_state.upload_results
        _render_results(
            cached["processed_data"],
            cached["display_image"],
            cached["total_items"],
        )
        return

    # ── Upload form ────────────────────────────────────────────────────────────
    left, _ = st.columns([2, 1])
    with left:
        with st.form("upload_form", clear_on_submit=True):
            uploaded_file = st.file_uploader(
                "Choose an image",
                type=["png", "jpg", "jpeg"],
                help="Supported formats: PNG, JPG, JPEG",
            )
            col1, col2 = st.columns(2)
            with col1:
                submitted = st.form_submit_button(
                    "🔍 Analyse Image", use_container_width=True, type="primary"
                )
            with col2:
                st.form_submit_button(
                    "🗑️ Clear", use_container_width=True
                )

    if submitted:
        if uploaded_file is None:
            st.error("Please upload an image first.")
            return

        if uploaded_file.type not in ALLOWED_TYPES:
            st.error("Invalid file type. Please upload a PNG or JPEG image.")
            return

        # Save the uploaded file
        filename  = uploaded_file.name
        save_path = os.path.join(UPLOAD_FOLDER, filename)

        img = Image.open(uploaded_file)
        img.save(save_path)

        # Progress bar while running pipeline
        with st.status("🔍 Running AI pipeline…", expanded=True) as status:
            st.write("📡 Detecting objects…")
            time.sleep(0.3)   # slight delay so the status is visible

            try:
                processed_data, total_items, display_image = _run_pipeline(save_path)

                st.write("💾 Saving results…")
                _save_results(st.session_state.user_id, filename, processed_data)

                status.update(
                    label=f"✅ Done! Found {total_items} item(s).",
                    state="complete",
                )

                # Cache results so they survive rerun
                st.session_state.upload_results = {
                    "processed_data": processed_data,
                    "display_image":  display_image,
                    "total_items":    total_items,
                }
                st.rerun()

            except Exception as exc:
                status.update(label="❌ Pipeline error", state="error")
                st.error(f"Analysis failed: {exc}")
                st.exception(exc)

    # ── Tips ───────────────────────────────────────────────────────────────────
    with st.expander("💡 Tips for best results"):
        st.markdown(
            """
            - **Good lighting** — natural or bright indoor light works best.
            - **Single layer** — avoid stacking items on top of each other.
            - **Clear background** — use a plain surface when possible.
            - **Supported items** — fruits, vegetables, packaged goods, dairy.
            """
        )
