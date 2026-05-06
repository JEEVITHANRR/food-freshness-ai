"""
Multi-Class Dataset Preparation for Fruit/Vegetable Identification + Freshness

This script:
1. Creates the folder structure for 30 items × 2 freshness states = 60 classes
2. Downloads training images from the web for each category
3. Organizes images into train/val splits

Target: Train a model that outputs "fresh_apple", "rotten_banana", etc.
"""

import os
import shutil
import requests
from pathlib import Path
import time
import random

# ============================================================================
# CONFIGURATION: 30 Priority Items
# ============================================================================

ITEMS = [
    # Common Fruits (10)
    "apple", "banana", "orange", "mango", "grapes", 
    "papaya", "pomegranate", "guava", "watermelon", "pear",
    
    # Citrus (3)
    "lemon", "lime", "sweet_lime",
    
    # Berries (2)
    "strawberry", "blueberry",
    
    # Root Vegetables (5)
    "potato", "carrot", "beetroot", "radish", "ginger",
    
    # Leafy (3)
    "spinach", "cabbage", "lettuce",
    
    # Gourds (3)
    "bitter_gourd", "cucumber", "pumpkin",
    
    # Nightshade (4)
    "tomato", "brinjal", "capsicum", "okra",
]

FRESHNESS_STATES = ["fresh", "rotten"]

# Dataset paths
DATASET_ROOT = "dataset/multiclass"
TRAIN_DIR = f"{DATASET_ROOT}/train"
VAL_DIR = f"{DATASET_ROOT}/val"

# Images per class target
TARGET_IMAGES_PER_CLASS = 100
TRAIN_VAL_SPLIT = 0.8  # 80% train, 20% val


def create_folder_structure():
    """Create all required folders for the dataset."""
    print("=" * 60)
    print("📁 CREATING DATASET FOLDER STRUCTURE")
    print("=" * 60)
    
    created = 0
    for item in ITEMS:
        for freshness in FRESHNESS_STATES:
            class_name = f"{freshness}_{item}"
            
            train_path = os.path.join(TRAIN_DIR, class_name)
            val_path = os.path.join(VAL_DIR, class_name)
            
            os.makedirs(train_path, exist_ok=True)
            os.makedirs(val_path, exist_ok=True)
            created += 2
    
    print(f"✅ Created {created} folders for {len(ITEMS)} items × 2 freshness states")
    print(f"   Train: {TRAIN_DIR}")
    print(f"   Val: {VAL_DIR}")
    return True


def download_images_duckduckgo(query, output_dir, max_images=50):
    """Download images using DuckDuckGo search."""
    try:
        from duckduckgo_search import DDGS
    except ImportError:
        print("⚠️ duckduckgo_search not installed. Run: pip install duckduckgo_search")
        return 0
    
    os.makedirs(output_dir, exist_ok=True)
    downloaded = 0
    
    try:
        with DDGS() as ddgs:
            results = ddgs.images(query, max_results=max_images * 2)  # Get extra for failures
            
            for i, result in enumerate(results):
                if downloaded >= max_images:
                    break
                    
                try:
                    img_url = result.get('image')
                    if not img_url:
                        continue
                    
                    # Download image
                    response = requests.get(img_url, timeout=10, stream=True)
                    if response.status_code == 200:
                        # Determine extension
                        content_type = response.headers.get('content-type', '')
                        if 'jpeg' in content_type or 'jpg' in content_type:
                            ext = '.jpg'
                        elif 'png' in content_type:
                            ext = '.png'
                        else:
                            ext = '.jpg'
                        
                        filename = f"{query.replace(' ', '_')}_{downloaded + 1}{ext}"
                        filepath = os.path.join(output_dir, filename)
                        
                        with open(filepath, 'wb') as f:
                            for chunk in response.iter_content(1024):
                                f.write(chunk)
                        
                        downloaded += 1
                        
                except Exception as e:
                    continue
                
                # Rate limiting
                time.sleep(0.3)
                
    except Exception as e:
        print(f"   ⚠️ Search error: {e}")
    
    return downloaded


def download_dataset_for_item(item, freshness, target_count=50):
    """Download images for a specific item + freshness combination."""
    class_name = f"{freshness}_{item}"
    output_dir = os.path.join(TRAIN_DIR, class_name)
    
    # Check existing images
    existing = len([f for f in os.listdir(output_dir) if f.endswith(('.jpg', '.png', '.jpeg'))])
    
    if existing >= target_count:
        print(f"   ✅ {class_name}: Already has {existing} images")
        return existing
    
    needed = target_count - existing
    
    # Create search queries
    item_display = item.replace('_', ' ')
    
    if freshness == "fresh":
        queries = [
            f"fresh {item_display} fruit vegetable",
            f"ripe healthy {item_display}",
            f"{item_display} good quality",
        ]
    else:
        queries = [
            f"rotten {item_display} spoiled",
            f"bad moldy {item_display}",
            f"overripe decayed {item_display}",
        ]
    
    total_downloaded = 0
    for query in queries:
        if total_downloaded >= needed:
            break
        
        count = download_images_duckduckgo(
            query, 
            output_dir, 
            max_images=min(20, needed - total_downloaded)
        )
        total_downloaded += count
        time.sleep(1)  # Rate limit between queries
    
    print(f"   📥 {class_name}: Downloaded {total_downloaded} new images (total: {existing + total_downloaded})")
    return existing + total_downloaded


def download_all_images(images_per_class=50):
    """Download images for all items."""
    print("\n" + "=" * 60)
    print("📥 DOWNLOADING TRAINING IMAGES")
    print("=" * 60)
    print(f"Target: {images_per_class} images per class")
    print(f"Total classes: {len(ITEMS) * 2}")
    print()
    
    stats = {"success": 0, "partial": 0, "failed": 0}
    
    for item in ITEMS:
        print(f"\n🍎 Processing: {item}")
        
        for freshness in FRESHNESS_STATES:
            count = download_dataset_for_item(item, freshness, images_per_class)
            
            if count >= images_per_class:
                stats["success"] += 1
            elif count > 0:
                stats["partial"] += 1
            else:
                stats["failed"] += 1
    
    print("\n" + "=" * 60)
    print("📊 DOWNLOAD SUMMARY")
    print("=" * 60)
    print(f"   ✅ Complete: {stats['success']} classes")
    print(f"   ⚠️ Partial: {stats['partial']} classes")
    print(f"   ❌ Failed: {stats['failed']} classes")


def split_train_val(val_ratio=0.2):
    """Split training data into train and validation sets."""
    print("\n" + "=" * 60)
    print("📂 SPLITTING TRAIN/VAL")
    print("=" * 60)
    
    for item in ITEMS:
        for freshness in FRESHNESS_STATES:
            class_name = f"{freshness}_{item}"
            train_path = os.path.join(TRAIN_DIR, class_name)
            val_path = os.path.join(VAL_DIR, class_name)
            
            # Get all images in train
            images = [f for f in os.listdir(train_path) if f.endswith(('.jpg', '.png', '.jpeg'))]
            
            if len(images) == 0:
                continue
            
            # Calculate validation count
            val_count = max(1, int(len(images) * val_ratio))
            
            # Randomly select validation images
            random.shuffle(images)
            val_images = images[:val_count]
            
            # Move to validation folder
            for img in val_images:
                src = os.path.join(train_path, img)
                dst = os.path.join(val_path, img)
                if os.path.exists(src) and not os.path.exists(dst):
                    shutil.move(src, dst)
            
    print("✅ Train/Val split complete")


def get_dataset_stats():
    """Print dataset statistics."""
    print("\n" + "=" * 60)
    print("📊 DATASET STATISTICS")
    print("=" * 60)
    
    total_train = 0
    total_val = 0
    class_stats = []
    
    for item in ITEMS:
        for freshness in FRESHNESS_STATES:
            class_name = f"{freshness}_{item}"
            
            train_path = os.path.join(TRAIN_DIR, class_name)
            val_path = os.path.join(VAL_DIR, class_name)
            
            train_count = len([f for f in os.listdir(train_path) if f.endswith(('.jpg', '.png', '.jpeg'))]) if os.path.exists(train_path) else 0
            val_count = len([f for f in os.listdir(val_path) if f.endswith(('.jpg', '.png', '.jpeg'))]) if os.path.exists(val_path) else 0
            
            total_train += train_count
            total_val += val_count
            class_stats.append((class_name, train_count, val_count))
    
    print(f"\n{'Class':<25} {'Train':>8} {'Val':>8}")
    print("-" * 45)
    
    for class_name, train_count, val_count in class_stats:
        status = "✅" if train_count >= 30 else "⚠️" if train_count > 0 else "❌"
        print(f"{status} {class_name:<23} {train_count:>8} {val_count:>8}")
    
    print("-" * 45)
    print(f"{'TOTAL':<25} {total_train:>8} {total_val:>8}")
    print(f"\n📈 Total images: {total_train + total_val}")
    print(f"   Train: {total_train} ({total_train/(total_train+total_val)*100:.1f}%)")
    print(f"   Val: {total_val} ({total_val/(total_train+total_val)*100:.1f}%)")


def main():
    """Main function to prepare the dataset."""
    print("=" * 60)
    print("🍎 MULTI-CLASS DATASET PREPARATION")
    print("   30 Items × 2 Freshness States = 60 Classes")
    print("=" * 60)
    
    # Step 1: Create folder structure
    create_folder_structure()
    
    # Step 2: Download images
    print("\n⚠️ This will download images from the web.")
    print("   Estimated time: 30-60 minutes for full dataset")
    
    user_input = input("\nProceed with download? (y/n): ").strip().lower()
    
    if user_input == 'y':
        download_all_images(images_per_class=50)
        
        # Step 3: Split train/val
        split_train_val(val_ratio=0.2)
    
    # Step 4: Show stats
    get_dataset_stats()
    
    print("\n" + "=" * 60)
    print("✅ DATASET PREPARATION COMPLETE")
    print("=" * 60)
    print("\nNext steps:")
    print("1. Review the downloaded images for quality")
    print("2. Add your own labeled images to improve accuracy")
    print("3. Run: python train_multiclass.py")


if __name__ == "__main__":
    main()
