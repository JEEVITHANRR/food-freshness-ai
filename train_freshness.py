from ultralytics import YOLO
import os
import shutil

# Define dataset path
DATASET_PATH = os.path.abspath("dataset/processed")

# Training Configuration
TRAINING_CONFIG = {
    "model": "yolov8m-cls.pt",    # Medium model for better accuracy
    "epochs": 50,                  # More epochs for convergence
    "imgsz": 320,                  # Larger images for detail
    "batch": 32,                   # Larger batch for stability
    "patience": 10,                # Early stopping patience
    "lr0": 0.001,                  # Initial learning rate
    "lrf": 0.01,                   # Final LR (lr0 * lrf)
    "warmup_epochs": 3,            # Warmup period
    "cos_lr": True,                # Cosine LR scheduler
    "amp": True,                   # Mixed precision training
    "augment": True,               # Enable augmentation
    # Data Augmentation
    "hsv_h": 0.015,                # HSV-Hue augmentation
    "hsv_s": 0.7,                  # HSV-Saturation
    "hsv_v": 0.4,                  # HSV-Value
    "degrees": 15,                 # Rotation degrees
    "translate": 0.1,              # Translation
    "scale": 0.5,                  # Scale factor
    "fliplr": 0.5,                 # Horizontal flip probability
    "flipud": 0.1,                 # Vertical flip probability
    "mosaic": 0.5,                 # Mosaic augmentation
    "mixup": 0.1,                  # Mixup augmentation
    "erasing": 0.2,                # Random erasing
}

def prepare_dataset():
    """Ensure dataset is properly structured."""
    required_dirs = [
        f"{DATASET_PATH}/train/fresh",
        f"{DATASET_PATH}/train/rotten",
        f"{DATASET_PATH}/val/fresh",
        f"{DATASET_PATH}/val/rotten"
    ]
    
    for d in required_dirs:
        os.makedirs(d, exist_ok=True)
        
    # Check if dataset has images
    train_fresh = f"{DATASET_PATH}/train/fresh"
    if os.path.exists(train_fresh):
        count = len([f for f in os.listdir(train_fresh) if f.endswith(('.jpg', '.png', '.jpeg'))])
        print(f"📊 Dataset: {count} fresh training images found")
    
    return True

def train_model():
    """Train freshness classification model with advanced settings."""
    print("=" * 60)
    print("🚀 ADVANCED FRESHNESS CLASSIFIER TRAINING")
    print("=" * 60)
    
    # Prepare dataset
    if not prepare_dataset():
        print("❌ Dataset preparation failed")
        return
    
    # Load pretrained model
    print(f"\n📦 Loading model: {TRAINING_CONFIG['model']}")
    model = YOLO(TRAINING_CONFIG["model"])

    # Train with advanced configuration
    print("\n🏋️ Starting training...")
    print(f"   Epochs: {TRAINING_CONFIG['epochs']}")
    print(f"   Image Size: {TRAINING_CONFIG['imgsz']}")
    print(f"   Batch Size: {TRAINING_CONFIG['batch']}")
    print(f"   Augmentation: Enabled")
    print(f"   Mixed Precision: {TRAINING_CONFIG['amp']}")
    
    results = model.train(
        data=DATASET_PATH,
        epochs=TRAINING_CONFIG["epochs"],
        imgsz=TRAINING_CONFIG["imgsz"],
        batch=TRAINING_CONFIG["batch"],
        patience=TRAINING_CONFIG["patience"],
        lr0=TRAINING_CONFIG["lr0"],
        lrf=TRAINING_CONFIG["lrf"],
        warmup_epochs=TRAINING_CONFIG["warmup_epochs"],
        cos_lr=TRAINING_CONFIG["cos_lr"],
        amp=TRAINING_CONFIG["amp"],
        augment=TRAINING_CONFIG["augment"],
        hsv_h=TRAINING_CONFIG["hsv_h"],
        hsv_s=TRAINING_CONFIG["hsv_s"],
        hsv_v=TRAINING_CONFIG["hsv_v"],
        degrees=TRAINING_CONFIG["degrees"],
        translate=TRAINING_CONFIG["translate"],
        scale=TRAINING_CONFIG["scale"],
        fliplr=TRAINING_CONFIG["fliplr"],
        flipud=TRAINING_CONFIG["flipud"],
        mosaic=TRAINING_CONFIG["mosaic"],
        mixup=TRAINING_CONFIG["mixup"],
        erasing=TRAINING_CONFIG["erasing"],
        project="models",
        name="freshness_classifier",
        exist_ok=True,
        verbose=True
    )

    # Validate
    print("\n📊 Validating model...")
    metrics = model.val()
    print(f"\n✅ TRAINING COMPLETE!")
    print(f"   Top-1 Accuracy: {metrics.top1:.2%}")
    print(f"   Top-5 Accuracy: {metrics.top5:.2%}")

    # Export
    print("\n📤 Exporting model...")
    success = model.export(format="torchscript")
    print(f"   TorchScript export: {'✅' if success else '❌'}")
    
    print("\n" + "=" * 60)
    print("🎉 Model saved to: models/freshness_classifier/weights/best.pt")
    print("=" * 60)

if __name__ == "__main__":
    train_model()

