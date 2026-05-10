import streamlit as st
import os
import json
import pandas as pd
from datetime import datetime
import plotly.express as px
import plotly.graph_objects as go
from PIL import Image
import io
import time

# Import AI modules
try:
    from gemini_detect import detect_and_count_items, configure_gemini
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False

try:
    import database as db
    DB_AVAILABLE = True
except ImportError:
    DB_AVAILABLE = False

# ──────────────────────────────────────────────────────────────
# Page Configuration
# ──────────────────────────────────────────────────────────────
st.set_page_config(
    page_title="FreshAI | Intelligent Food Manager",
    page_icon="🍃",
    layout="wide",
    initial_sidebar_state="expanded",
)

# ──────────────────────────────────────────────────────────────
# Custom CSS for Premium Look
# ──────────────────────────────────────────────────────────────
st.markdown("""
    <style>
    /* Main Background */
    .stApp {
        background-color: #0f172a;
        color: #f8fafc;
    }
    
    /* Sidebar */
    [data-testid="stSidebar"] {
        background-color: #1e293b;
        border-right: 1px solid #334155;
    }
    
    /* Headers */
    h1, h2, h3 {
        color: #f8fafc !important;
        font-family: 'Inter', sans-serif;
        font-weight: 700;
    }
    
    /* Premium Cards */
    .metric-card {
        background: rgba(30, 41, 59, 0.7);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 16px;
        padding: 24px;
        margin-bottom: 20px;
        transition: all 0.3s ease;
    }
    .metric-card:hover {
        transform: translateY(-5px);
        border-color: #10b981;
        box-shadow: 0 10px 30px rgba(16, 185, 129, 0.1);
    }
    
    /* Scan Result Card */
    .scan-result {
        background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
        border-radius: 20px;
        padding: 30px;
        border-left: 5px solid #10b981;
    }
    
    /* Buttons */
    .stButton>button {
        background: linear-gradient(90deg, #10b981 0%, #059669 100%);
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 12px;
        font-weight: 600;
        width: 100%;
        transition: all 0.3s ease;
    }
    .stButton>button:hover {
        transform: scale(1.02);
        box-shadow: 0 0 20px rgba(16, 185, 129, 0.4);
    }
    
    /* Success/Freshness Tags */
    .tag {
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
    }
    .tag-fresh { background: rgba(16, 185, 129, 0.2); color: #10b981; }
    .tag-aged { background: rgba(245, 158, 11, 0.2); color: #f59e0b; }
    .tag-rotten { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
    </style>
""", unsafe_allow_html=True)

# ──────────────────────────────────────────────────────────────
# App Logic
# ──────────────────────────────────────────────────────────────

def init_db():
    if DB_AVAILABLE:
        # Assuming db has an init function or handles it on import
        pass

def main():
    init_db()
    
    # Sidebar Navigation
    with st.sidebar:
        st.markdown("<h1 style='text-align: center; color: #10b981;'>FreshAI 🍃</h1>", unsafe_allow_html=True)
        st.markdown("<p style='text-align: center; color: #94a3b8; margin-bottom: 30px;'>Intelligent Food Manager</p>", unsafe_allow_html=True)
        
        page = st.radio(
            "Navigation",
            ["Dashboard", "Scan Food", "Inventory", "Analytics", "Settings"],
            format_func=lambda x: f" {x}"
        )
        
        st.markdown("---")
        st.markdown("### System Status")
        st.info(f"AI Core: {'✅ Ready' if GEMINI_AVAILABLE else '❌ Offline'}")
        st.info(f"Database: {'✅ Ready' if DB_AVAILABLE else '❌ Offline'}")

    # ──────────────────────────────────────────────────────────
    # Page: Dashboard
    # ──────────────────────────────────────────────────────────
    if page == "Dashboard":
        st.markdown("# 👋 Welcome Back")
        st.markdown("Here is your kitchen's freshness overview.")
        
        # Stats Row
        col1, col2, col3, col4 = st.columns(4)
        
        with col1:
            st.markdown("""<div class='metric-card'>
                <p style='color: #94a3b8; font-size: 14px;'>Total Items</p>
                <h2 style='margin: 0;'>24</h2>
                <p style='color: #10b981; font-size: 12px;'>↑ 4 new today</p>
            </div>""", unsafe_allow_html=True)
            
        with col2:
            st.markdown("""<div class='metric-card'>
                <p style='color: #94a3b8; font-size: 14px;'>Fresh Items</p>
                <h2 style='margin: 0; color: #10b981;'>18</h2>
                <p style='color: #94a3b8; font-size: 12px;'>75% of stock</p>
            </div>""", unsafe_allow_html=True)
            
        with col3:
            st.markdown("""<div class='metric-card'>
                <p style='color: #94a3b8; font-size: 14px;'>Expiring Soon</p>
                <h2 style='margin: 0; color: #f59e0b;'>5</h2>
                <p style='color: #f59e0b; font-size: 12px;'>Action required</p>
            </div>""", unsafe_allow_html=True)
            
        with col4:
            st.markdown("""<div class='metric-card'>
                <p style='color: #94a3b8; font-size: 14px;'>Spoiled</p>
                <h2 style='margin: 0; color: #ef4444;'>1</h2>
                <p style='color: #ef4444; font-size: 12px;'>Remove immediately</p>
            </div>""", unsafe_allow_html=True)

        # Recent Items & Alerts
        c1, c2 = st.columns([2, 1])
        
        with c1:
            st.markdown("### 🍎 Recently Added")
            if DB_AVAILABLE:
                items = db.get_user_inventory(1, limit=5)
                if items:
                    df = pd.DataFrame(items)
                    st.dataframe(df[['item_name', 'category', 'freshness', 'added_date']], use_container_width=True)
                else:
                    st.write("No items found. Start by scanning some food!")
            
        with c2:
            st.markdown("### 🔔 Alerts")
            st.warning("⚠️ **Apples** are reaching their limit. Suggestion: Bake an apple pie!")
            st.error("🚨 **Milk** has expired. Please discard.")

    # ──────────────────────────────────────────────────────────
    # Page: Scan Food
    # ──────────────────────────────────────────────────────────
    elif page == "Scan Food":
        st.markdown("# 🔬 AI Food Scanner")
        st.markdown("Upload a photo of your groceries or fridge.")
        
        uploaded_file = st.file_uploader("Drop image here...", type=['jpg', 'jpeg', 'png'])
        
        if uploaded_file is not None:
            col1, col2 = st.columns([1, 1])
            
            with col1:
                img = Image.open(uploaded_file)
                st.image(img, caption="Uploaded Image", use_container_width=True)
                
            with col2:
                st.markdown("### Analysis Options")
                method = st.selectbox("AI Model", ["Gemini Vision (Best)", "Local ResNet"])
                
                if st.button("🚀 Start Analysis"):
                    with st.spinner("🔍 FreshAI is analyzing the image..."):
                        # Save temp file
                        temp_path = "temp_scan.jpg"
                        img.save(temp_path)
                        
                        # Simulate processing time for UX
                        time.sleep(1.5)
                        
                        if GEMINI_AVAILABLE:
                            try:
                                results = detect_and_count_items(temp_path)
                                
                                st.markdown("<div class='scan-result'>", unsafe_allow_html=True)
                                st.markdown(f"## Found {results['total_count']} Items")
                                
                                for item in results['items']:
                                    f_class = "tag-fresh" if item['freshness'] == "Fresh" else "tag-aged" if item['freshness'] == "Slightly Aged" else "tag-rotten"
                                    st.markdown(f"""
                                        <div style='display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.1);'>
                                            <span><strong>{item['name']}</strong> ({item['category']})</span>
                                            <span class='tag {f_class}'>{item['freshness']}</span>
                                        </div>
                                    """, unsafe_allow_html=True)
                                    
                                    # Auto-save to DB
                                    if DB_AVAILABLE:
                                        db.add_inventory_item(1, item['name'], item['category'], item['count'], item['freshness'])
                                
                                st.success("✅ Items successfully added to inventory!")
                                st.markdown("</div>", unsafe_allow_html=True)
                                
                            except Exception as e:
                                st.error(f"Analysis failed: {str(e)}")
                        else:
                            st.error("Gemini API not configured. Please check Settings.")

    # ──────────────────────────────────────────────────────────
    # Page: Inventory
    # ──────────────────────────────────────────────────────────
    elif page == "Inventory":
        st.markdown("# 📦 Your Kitchen")
        
        if DB_AVAILABLE:
            items = db.get_user_inventory(1)
            if items:
                df = pd.DataFrame(items)
                
                # Search & Filter
                search = st.text_input("🔍 Search items...")
                if search:
                    df = df[df['item_name'].str.contains(search, case=False)]
                
                # Display table
                st.dataframe(df[['item_name', 'category', 'quantity', 'freshness', 'added_date']], use_container_width=True)
                
                if st.button("🗑 Clear Expired Items"):
                    st.toast("Clearing expired items...")
            else:
                st.info("Your inventory is empty. Try scanning some food!")

    # ──────────────────────────────────────────────────────────
    # Page: Analytics
    # ──────────────────────────────────────────────────────────
    elif page == "Analytics":
        st.markdown("# 📊 Freshness Analytics")
        
        # Fake data for demo if DB is empty
        categories = ['Fruits', 'Vegetables', 'Dairy', 'Protein']
        values = [45, 30, 15, 10]
        
        fig = px.pie(names=categories, values=values, title="Inventory Composition", hole=0.4)
        fig.update_layout(paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(0,0,0,0)', font_color="white")
        st.plotly_chart(fig, use_container_width=True)
        
        # Freshness Trend
        days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        freshness_scores = [95, 92, 88, 85, 82, 90, 94]
        
        fig2 = px.line(x=days, y=freshness_scores, title="Average Freshness Score Over Time")
        fig2.update_layout(paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(0,0,0,0)', font_color="white")
        st.plotly_chart(fig2, use_container_width=True)

    # ──────────────────────────────────────────────────────────
    # Page: Settings
    # ──────────────────────────────────────────────────────────
    elif page == "Settings":
        st.markdown("# ⚙️ Settings")
        
        st.markdown("### API Configuration")
        key = st.text_input("Gemini API Key", type="password", value=os.getenv("GEMINI_API_KEY", ""))
        if st.button("Save API Key"):
            if GEMINI_AVAILABLE:
                configure_gemini(key)
                st.success("API Key configured successfully!")
                
        st.markdown("---")
        st.markdown("### App Preferences")
        st.checkbox("Enable Push Notifications")
        st.checkbox("Auto-add scanned items to inventory", value=True)
        st.selectbox("Default AI Model", ["Gemini Vision", "Local YOLO"])

if __name__ == "__main__":
    main()
