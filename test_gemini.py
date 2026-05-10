import os
from google.generativeai import configure, get_model
configure(api_key="AIzaSyAZhsT-c4JpFL3Lb9Yn3oD6JrIjlrsOfQw")
try:
    model = get_model('models/gemini-1.5-flash')
    print("SUCCESS: Model found!")
except Exception as e:
    print(f"ERROR: {e}")
