import os
from google.generativeai import configure, get_model

configure(api_key="AIzaSyBtt8Hn-OHYsmufhAg71HWhyXhf3vq1E-E")
try:
    model = get_model('models/gemini-1.5-flash')
    print("SUCCESS: Model found!")
except Exception as e:
    print(f"ERROR: {e}")
