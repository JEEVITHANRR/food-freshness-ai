"""
Multi-Class Training Script for Fruit/Vegetable Identification + Freshness

Trains a YOLOv8 or ResNet model to classify:
- 30 items × 2 freshness states = 60 classes
- Examples: fresh_apple, rotten_apple, fresh_banana, rotten_banana, etc.

Features:
- Transfer learning from pretrained models
- Heavy data augmentation for limited datasets
- Class balancing for imbalanced data
- Mixed precision training
"""

import os
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, WeightedRandomSampler
from torchvision import datasets, transforms, models
from torch.optim import AdamW
from torch.optim.lr_scheduler import CosineAnnealingWarmRestarts
import numpy as np
from collections import Counter
from datetime import datetime

# ============================================================================
# CONFIGURATION
# ============================================================================

DATASET_PATH = "dataset/multiclass"
MODEL_OUTPUT = "models/multiclass_classifier"
MODEL_FILENAME = "multiclass_best.pth"

# Training Hyperparameters
CONFIG = {
    "epochs": 50,
    "batch_size": 32,
    "learning_rate": 0.001,
    "weight_decay": 0.01,
    "patience": 10,               # Early stopping patience
    "image_size": 224,
    "num_workers": 4,
    "mixed_precision": True,
    "model_type": "resnet50",     # Options: resnet18, resnet50, efficientnet
}

# 30 Items (must match prepare_multiclass_dataset.py)
ITEMS = [
    "apple", "banana", "orange", "mango", "grapes", 
    "papaya", "pomegranate", "guava", "watermelon", "pear",
    "lemon", "lime", "sweet_lime",
    "strawberry", "blueberry",
    "potato", "carrot", "beetroot", "radish", "ginger",
    "spinach", "cabbage", "lettuce",
    "bitter_gourd", "cucumber", "pumpkin",
    "tomato", "brinjal", "capsicum", "okra",
]

FRESHNESS_STATES = ["fresh", "rotten"]

# Generate all 60 class names
CLASS_NAMES = [f"{freshness}_{item}" for item in ITEMS for freshness in FRESHNESS_STATES]


def get_transforms(is_training=True):
    """Get data augmentation transforms."""
    if is_training:
        return transforms.Compose([
            transforms.Resize((256, 256)),
            transforms.RandomCrop(CONFIG["image_size"]),
            transforms.RandomHorizontalFlip(p=0.5),
            transforms.RandomVerticalFlip(p=0.1),
            transforms.RandomRotation(20),
            transforms.ColorJitter(
                brightness=0.3,
                contrast=0.3,
                saturation=0.3,
                hue=0.1
            ),
            transforms.RandomAffine(
                degrees=0,
                translate=(0.1, 0.1),
                scale=(0.9, 1.1)
            ),
            transforms.RandomPerspective(distortion_scale=0.2, p=0.3),
            transforms.GaussianBlur(kernel_size=3, sigma=(0.1, 2.0)),
            transforms.ToTensor(),
            transforms.Normalize(
                mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225]
            ),
            transforms.RandomErasing(p=0.2),
        ])
    else:
        return transforms.Compose([
            transforms.Resize((CONFIG["image_size"], CONFIG["image_size"])),
            transforms.ToTensor(),
            transforms.Normalize(
                mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225]
            ),
        ])


def create_model(num_classes, model_type="resnet50"):
    """Create the classification model with transfer learning."""
    print(f"📦 Creating {model_type} model with {num_classes} classes...")
    
    if model_type == "resnet18":
        model = models.resnet18(weights=models.ResNet18_Weights.DEFAULT)
        num_features = model.fc.in_features
        model.fc = nn.Sequential(
            nn.Dropout(0.4),
            nn.Linear(num_features, 512),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(512, num_classes)
        )
    
    elif model_type == "resnet50":
        model = models.resnet50(weights=models.ResNet50_Weights.DEFAULT)
        num_features = model.fc.in_features
        model.fc = nn.Sequential(
            nn.Dropout(0.4),
            nn.Linear(num_features, 1024),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(1024, 512),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(512, num_classes)
        )
    
    elif model_type == "efficientnet":
        model = models.efficientnet_b2(weights=models.EfficientNet_B2_Weights.DEFAULT)
        num_features = model.classifier[1].in_features
        model.classifier = nn.Sequential(
            nn.Dropout(0.4),
            nn.Linear(num_features, 512),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(512, num_classes)
        )
    
    else:
        raise ValueError(f"Unknown model type: {model_type}")
    
    # Freeze early layers for transfer learning
    for name, param in model.named_parameters():
        if "fc" not in name and "classifier" not in name:
            if "layer4" not in name and "layer3" not in name:
                param.requires_grad = False
    
    trainable = sum(p.numel() for p in model.parameters() if p.requires_grad)
    total = sum(p.numel() for p in model.parameters())
    print(f"   Trainable parameters: {trainable:,} / {total:,} ({100*trainable/total:.1f}%)")
    
    return model


def get_weighted_sampler(dataset):
    """Create a weighted sampler for class imbalance."""
    targets = [dataset.targets[i] for i in range(len(dataset))]
    class_counts = Counter(targets)
    
    # Calculate weights (inverse frequency)
    weights = [1.0 / class_counts[t] for t in targets]
    weights = torch.DoubleTensor(weights)
    
    sampler = WeightedRandomSampler(weights, len(weights), replacement=True)
    return sampler


def train_epoch(model, train_loader, criterion, optimizer, scaler, device):
    """Train for one epoch."""
    model.train()
    running_loss = 0.0
    correct = 0
    total = 0
    
    for inputs, labels in train_loader:
        inputs, labels = inputs.to(device), labels.to(device)
        
        optimizer.zero_grad()
        
        if CONFIG["mixed_precision"] and scaler is not None:
            with torch.cuda.amp.autocast():
                outputs = model(inputs)
                loss = criterion(outputs, labels)
            
            scaler.scale(loss).backward()
            scaler.step(optimizer)
            scaler.update()
        else:
            outputs = model(inputs)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()
        
        running_loss += loss.item()
        _, predicted = torch.max(outputs, 1)
        total += labels.size(0)
        correct += (predicted == labels).sum().item()
    
    return running_loss / len(train_loader), correct / total


def validate(model, val_loader, criterion, device):
    """Validate the model."""
    model.eval()
    running_loss = 0.0
    correct = 0
    total = 0
    
    all_preds = []
    all_labels = []
    
    with torch.no_grad():
        for inputs, labels in val_loader:
            inputs, labels = inputs.to(device), labels.to(device)
            
            outputs = model(inputs)
            loss = criterion(outputs, labels)
            
            running_loss += loss.item()
            _, predicted = torch.max(outputs, 1)
            total += labels.size(0)
            correct += (predicted == labels).sum().item()
            
            all_preds.extend(predicted.cpu().numpy())
            all_labels.extend(labels.cpu().numpy())
    
    return running_loss / len(val_loader), correct / total, all_preds, all_labels


def save_model(model, class_names, filepath):
    """Save model with class names metadata."""
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    
    torch.save({
        'model_state_dict': model.state_dict(),
        'class_names': class_names,
        'num_classes': len(class_names),
        'model_type': CONFIG["model_type"],
        'image_size': CONFIG["image_size"],
    }, filepath)
    
    print(f"💾 Model saved to: {filepath}")


def train():
    """Main training function."""
    print("=" * 70)
    print("🍎 MULTI-CLASS FRUIT/VEGETABLE + FRESHNESS TRAINING")
    print("=" * 70)
    print(f"   Items: {len(ITEMS)}")
    print(f"   Freshness states: {len(FRESHNESS_STATES)}")
    print(f"   Total classes: {len(CLASS_NAMES)}")
    print(f"   Model: {CONFIG['model_type']}")
    print(f"   Epochs: {CONFIG['epochs']}")
    print()
    
    # Check dataset
    train_dir = os.path.join(DATASET_PATH, "train")
    val_dir = os.path.join(DATASET_PATH, "val")
    
    if not os.path.exists(train_dir):
        print("❌ Training data not found!")
        print("   Run: python prepare_multiclass_dataset.py")
        return
    
    # Load datasets
    print("📂 Loading datasets...")
    train_dataset = datasets.ImageFolder(train_dir, transform=get_transforms(is_training=True))
    val_dataset = datasets.ImageFolder(val_dir, transform=get_transforms(is_training=False))
    
    print(f"   Train: {len(train_dataset)} images")
    print(f"   Val: {len(val_dataset)} images")
    print(f"   Classes found: {len(train_dataset.classes)}")
    
    if len(train_dataset) < 100:
        print("⚠️ Warning: Very small dataset. Consider adding more images.")
    
    # Create weighted sampler for class imbalance
    sampler = get_weighted_sampler(train_dataset)
    
    # Data loaders
    train_loader = DataLoader(
        train_dataset, 
        batch_size=CONFIG["batch_size"],
        sampler=sampler,
        num_workers=CONFIG["num_workers"],
        pin_memory=True
    )
    
    val_loader = DataLoader(
        val_dataset,
        batch_size=CONFIG["batch_size"],
        shuffle=False,
        num_workers=CONFIG["num_workers"],
        pin_memory=True
    )
    
    # Device
    device = torch.device("cuda" if torch.cuda.is_available() else 
                          "mps" if torch.backends.mps.is_available() else "cpu")
    print(f"\n🔧 Training on: {device}")
    
    # Model
    num_classes = len(train_dataset.classes)
    model = create_model(num_classes, CONFIG["model_type"])
    model = model.to(device)
    
    # Loss with class weights
    class_counts = Counter(train_dataset.targets)
    weights = torch.FloatTensor([1.0 / class_counts.get(i, 1) for i in range(num_classes)])
    weights = weights / weights.sum() * num_classes
    weights = weights.to(device)
    
    criterion = nn.CrossEntropyLoss(weight=weights)
    
    # Optimizer
    optimizer = AdamW(
        filter(lambda p: p.requires_grad, model.parameters()),
        lr=CONFIG["learning_rate"],
        weight_decay=CONFIG["weight_decay"]
    )
    
    # Scheduler
    scheduler = CosineAnnealingWarmRestarts(optimizer, T_0=10, T_mult=2)
    
    # Mixed precision scaler
    scaler = torch.cuda.amp.GradScaler() if CONFIG["mixed_precision"] and device.type == "cuda" else None
    
    # Training loop
    print("\n" + "=" * 70)
    print("🏋️ STARTING TRAINING")
    print("=" * 70)
    
    best_val_acc = 0.0
    patience_counter = 0
    history = {"train_loss": [], "train_acc": [], "val_loss": [], "val_acc": []}
    
    for epoch in range(CONFIG["epochs"]):
        # Train
        train_loss, train_acc = train_epoch(model, train_loader, criterion, optimizer, scaler, device)
        
        # Validate
        val_loss, val_acc, _, _ = validate(model, val_loader, criterion, device)
        
        # Update scheduler
        scheduler.step()
        
        # Record history
        history["train_loss"].append(train_loss)
        history["train_acc"].append(train_acc)
        history["val_loss"].append(val_loss)
        history["val_acc"].append(val_acc)
        
        # Print progress
        print(f"Epoch {epoch+1:3d}/{CONFIG['epochs']} | "
              f"Train Loss: {train_loss:.4f} Acc: {train_acc:.4f} | "
              f"Val Loss: {val_loss:.4f} Acc: {val_acc:.4f}", end="")
        
        # Save best model
        if val_acc > best_val_acc:
            best_val_acc = val_acc
            patience_counter = 0
            save_path = os.path.join(MODEL_OUTPUT, MODEL_FILENAME)
            save_model(model, train_dataset.classes, save_path)
            print(" ⭐ Best!")
        else:
            patience_counter += 1
            print()
        
        # Early stopping
        if patience_counter >= CONFIG["patience"]:
            print(f"\n⏹️ Early stopping at epoch {epoch+1}")
            break
    
    # Save training history
    history_path = os.path.join(MODEL_OUTPUT, "training_history.npy")
    np.save(history_path, history)
    
    # Final summary
    print("\n" + "=" * 70)
    print("✅ TRAINING COMPLETE")
    print("=" * 70)
    print(f"   Best Validation Accuracy: {best_val_acc:.4f} ({best_val_acc*100:.2f}%)")
    print(f"   Model saved to: {MODEL_OUTPUT}/{MODEL_FILENAME}")
    print(f"   Training history: {history_path}")
    print()
    print("Next steps:")
    print("1. Test the model with: python test_multiclass.py")
    print("2. The model will be automatically used by the detection pipeline")


def load_trained_model(model_path=None):
    """Load a trained model for inference."""
    if model_path is None:
        model_path = os.path.join(MODEL_OUTPUT, MODEL_FILENAME)
    
    if not os.path.exists(model_path):
        print(f"❌ Model not found: {model_path}")
        return None, None
    
    checkpoint = torch.load(model_path, map_location='cpu')
    
    num_classes = checkpoint['num_classes']
    model_type = checkpoint.get('model_type', 'resnet50')
    class_names = checkpoint['class_names']
    
    model = create_model(num_classes, model_type)
    model.load_state_dict(checkpoint['model_state_dict'])
    model.eval()
    
    print(f"✅ Loaded model with {num_classes} classes")
    
    return model, class_names


def predict(image_path, model=None, class_names=None):
    """Predict the class of an image."""
    if model is None:
        model, class_names = load_trained_model()
        if model is None:
            return None
    
    device = torch.device("cuda" if torch.cuda.is_available() else 
                          "mps" if torch.backends.mps.is_available() else "cpu")
    model = model.to(device)
    
    # Load and transform image
    from PIL import Image
    transform = get_transforms(is_training=False)
    
    image = Image.open(image_path).convert('RGB')
    input_tensor = transform(image).unsqueeze(0).to(device)
    
    # Predict
    with torch.no_grad():
        outputs = model(input_tensor)
        probabilities = torch.softmax(outputs, dim=1)[0]
        confidence, predicted_idx = torch.max(probabilities, 0)
    
    predicted_class = class_names[predicted_idx.item()]
    
    # Parse freshness and item name
    parts = predicted_class.split('_', 1)
    freshness = parts[0].capitalize()
    item_name = parts[1].replace('_', ' ').title()
    
    return {
        "class": predicted_class,
        "item_name": item_name,
        "freshness": freshness,
        "confidence": confidence.item(),
        "all_probabilities": {class_names[i]: probabilities[i].item() 
                             for i in range(len(class_names))}
    }


if __name__ == "__main__":
    train()
