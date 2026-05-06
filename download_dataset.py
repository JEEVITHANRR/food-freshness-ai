import os
import requests
import time
from datetime import datetime

# You can add more categories here
FRUITS_AND_VEG = [
    "apple", "banana", "orange", "pear", "pineapple", "grape", "strawberry", 
    "watermelon", "lemon", "lime", "peach", "mango", "pomegranate", "kiwi",
    "tomato", "potato", "cucumber", "carrot", "broccoli", "cauliflower", 
    "cabbage", "spinach", "lettuce", "capsicum", "bell pepper", "onion", 
    "garlic", "ginger", "eggplant", "pumpkin", "corn", "mushroom", "radish",
    "zucchini", "sweet potato", "chili"
]

def download_images(query, save_dir, num_images=20):
    """
    Downloads images for a query using a simple header-based request 
    simulating a browser to get image URLs (simplified).
    For a robust solution, we use a public placeholder or just allow user to drop files.
    
    Since we cannot easily scrape Google/Bing without API keys or complex libraries,
    this script provides a confusing experience if I try to fake it.
    
    INSTEAD, I will create a folder structure and simple instructions, 
    AND a 'mock' downloader that tries to get some images if possible,
    OR better: I'll use a public dataset source logic if possible.
    
    Actually, let's try a direct approach using a library if the user permits,
    but for now, I'll write 'requests' logic that fetches from a free API like Unsplash or Pexels if possible?
    No, Fresh/Rotten specific is hard on Unsplash.
    
    Let's stick to creating the structure and a helper that *would* work if we had the urls,
    or better: tell the user to use a specific command.
    
    Wait, the user said "I want to train my dataset from web". 
    I will build a script that uses 'duckduckgo_search' if installed, or fails gracefully.
    Let's add 'duckduckgo_search' to requirements.
    """
    
    print(f"Searching for '{query}'...")
    
    # Create directory
    if not os.path.exists(save_dir):
        os.makedirs(save_dir)
        
    results = []
    max_retries = 3
    
    # SEARCH
    for attempt in range(max_retries):
        try:
            from duckduckgo_search import DDGS
            with DDGS() as ddgs:
                results = list(ddgs.images(query, max_results=num_images))
            break # Success
        except ImportError:
            print("❌ 'duckduckgo_search' library not found. Please run: pip install duckduckgo_search")
            return
        except Exception as e:
            print(f"  Attempt {attempt+1}/{max_retries} failed: {e}")
            if "Ratelimit" in str(e) or "403" in str(e):
                wait_time = (attempt + 1) * 10
                print(f"  Rate limited. Waiting {wait_time}s...")
                time.sleep(wait_time)
            else:
                break
    
    # DOWNLOAD
    if not results:
        print(f"⚠️ No results found for {query}")
        return

    count = 0
    for res in results:
        try:
            img_url = res['image']
            img_data = requests.get(img_url, timeout=5).content
            
            filename = f"{save_dir}/{query}_{count}.jpg"
            with open(filename, 'wb') as f:
                f.write(img_data)
            
            count += 1
            print(f"  Saved: {filename}")
        except Exception as e:
            # print(f"  Failed {img_url}: {e}")
            pass
            
    print(f"✅ Downloaded {count} images for {query}")
    
    # Rate Limit Buffer
    time.sleep(20)

if __name__ == "__main__":
    print("--- Web Dataset Downloader ---")
    print("This script will download images for Fresh/Rotten categories.")
    
    print("Starting Download (Auto-mode)...")
    # confirm = input("Do you want to install 'duckduckgo_search' first? (y/n): ")
    # if confirm.lower() == 'y':
    #     os.system("pip install duckduckgo_search")
        
    print("\nStarting Download...")
    base_dir = "dataset/web_downloaded"
    
    for item in FRUITS_AND_VEG:
        download_images(f"fresh {item}", f"{base_dir}/train/fresh", num_images=30)
        download_images(f"rotten {item}", f"{base_dir}/train/rotten", num_images=30)
        
    print("\n✅ Done! Now run 'python train_freshness.py' (after updating dataset path to include this new folder)")
