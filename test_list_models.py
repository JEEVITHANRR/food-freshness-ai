import os
from google.generativeai import configure, list_models

configure(api_key="AIzaSyBtt8Hn-OHYsmufhAg71HWhyXhf3vq1E-E")
try:
    print("Available Models:")
    for m in list_models():
        print(m.name)
except Exception as e:
    print(f"ERROR: {e}")
