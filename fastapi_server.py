"""
FreshAI — Production-Grade FastAPI Backend
==========================================

Provides a complete REST API for the Next.js dashboard:
  • /api/scan          — AI-powered food scanning (Gemini + YOLO + OCR + ResNet)
  • /api/inventory     — Full CRUD inventory management
  • /api/history       — Scan history retrieval
  • /api/analytics     — Dashboard statistics & analytics
  • /api/alerts        — Alert management
  • /api/health        — Health check & system status
  • /uploads/{path}    — Serve uploaded images
"""

from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse, FileResponse
from pydantic import BaseModel, Field
from typing import Optional, List
import os
import shutil
import uuid
import traceback
from datetime import datetime
from PIL import Image
import io
import json
import logging

# ──────────────────────────────────────────────────────────────
# Logging
# ──────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger("freshapi")

# ──────────────────────────────────────────────────────────────
# Import AI modules (graceful degradation)
# ──────────────────────────────────────────────────────────────
GEMINI_AVAILABLE = False
YOLO_AVAILABLE = False
RESNET_AVAILABLE = False
OCR_AVAILABLE = False
DB_AVAILABLE = False

try:
    from gemini_detect import detect_and_count_items, get_item_details, configure_gemini, detect_with_fallback
    GEMINI_AVAILABLE = True
    log.info("✅ Gemini detection module loaded")
except ImportError as e:
    log.warning(f"⚠️  Gemini module unavailable: {e}")

try:
    from resnet_freshness import predict_freshness
    RESNET_AVAILABLE = True
    log.info("✅ ResNet freshness module loaded")
except ImportError as e:
    log.warning(f"⚠️  ResNet module unavailable: {e}")

try:
    from ocr_module import extract_product_info, check_expiry_status
    OCR_AVAILABLE = True
    log.info("✅ OCR module loaded")
except ImportError as e:
    log.warning(f"⚠️  OCR module unavailable: {e}")

try:
    from yolo_detect import detect_objects
    YOLO_AVAILABLE = True
    log.info("✅ YOLO detection module loaded")
except ImportError as e:
    log.warning(f"⚠️  YOLO module unavailable: {e}")

try:
    import database as db
    DB_AVAILABLE = True
    log.info("✅ Database module loaded")
except ImportError as e:
    log.warning(f"⚠️  Database module unavailable: {e}")

# ──────────────────────────────────────────────────────────────
# FastAPI App
# ──────────────────────────────────────────────────────────────
app = FastAPI(
    title="FreshAI API",
    description="Intelligent Food Freshness Detection API powered by Gemini Vision, YOLOv8, ResNet & OCR",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS — allow Next.js dev server and production
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "*",  # Allow all in dev; restrict in production
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files
UPLOAD_DIR = "static/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# ──────────────────────────────────────────────────────────────
# Pydantic Models
# ──────────────────────────────────────────────────────────────

class APIResponse(BaseModel):
    success: bool
    data: Optional[dict] = None
    error: Optional[str] = None
    timestamp: str = Field(default_factory=lambda: datetime.now().isoformat())

class InventoryItemCreate(BaseModel):
    user_id: int = 1
    item_name: str
    category: str = "Other"
    quantity: int = 1
    freshness: Optional[str] = None
    freshness_score: Optional[float] = None
    expiry_date: Optional[str] = None
    batch_number: Optional[str] = None
    image_path: Optional[str] = None

class InventoryItemUpdate(BaseModel):
    item_name: Optional[str] = None
    category: Optional[str] = None
    quantity: Optional[int] = None
    freshness: Optional[str] = None
    freshness_score: Optional[float] = None
    expiry_date: Optional[str] = None
    status: Optional[str] = None

# ──────────────────────────────────────────────────────────────
# Helper: Save uploaded file
# ──────────────────────────────────────────────────────────────
def save_upload(file: UploadFile) -> str:
    """Save uploaded file with unique name, return path."""
    ext = os.path.splitext(file.filename or "image.jpg")[1] or ".jpg"
    unique_name = f"{datetime.now().strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:8]}{ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_name)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    log.info(f"📁 Saved upload: {file_path} ({os.path.getsize(file_path)} bytes)")
    return file_path

# ──────────────────────────────────────────────────────────────
# Routes: Health Check
# ──────────────────────────────────────────────────────────────

@app.get("/")
async def root():
    return {
        "service": "FreshAI API",
        "version": "2.0.0",
        "status": "running",
        "docs": "/docs",
    }

@app.get("/api/health")
async def health_check():
    """System health check — shows which AI modules are loaded."""
    return {
        "success": True,
        "data": {
            "status": "healthy",
            "uptime": datetime.now().isoformat(),
            "modules": {
                "gemini_vision": GEMINI_AVAILABLE,
                "yolo_detection": YOLO_AVAILABLE,
                "resnet_freshness": RESNET_AVAILABLE,
                "ocr_engine": OCR_AVAILABLE,
                "database": DB_AVAILABLE,
            },
            "endpoints": [
                "POST /api/scan",
                "POST /api/scan/details",
                "GET  /api/inventory/{user_id}",
                "POST /api/inventory",
                "PUT  /api/inventory/{item_id}",
                "DELETE /api/inventory/{item_id}",
                "GET  /api/history/{user_id}",
                "GET  /api/analytics/{user_id}",
                "GET  /api/alerts/{user_id}",
                "PUT  /api/alerts/{alert_id}/read",
                "GET  /api/health",
            ],
        },
    }

# ──────────────────────────────────────────────────────────────
# Routes: Food Scanning (Core Feature)
# ──────────────────────────────────────────────────────────────

@app.post("/api/scan")
async def scan_food(
    file: UploadFile = File(...),
    method: str = Form("gemini"),
    scan_type: str = Form("Full Scan"),
    api_key: str = Form(None),
    user_id: int = Form(1),
):
    """
    🔬 Main scan endpoint — performs multi-layered AI analysis.

    Layers:
      1. Item Detection & Counting (Gemini Vision or YOLO)
      2. Freshness Assessment (ResNet18 fallback)
      3. OCR Label Reading (EasyOCR / Tesseract)
      4. Expiry Status Check

    Returns structured JSON with all results.
    """
    file_path = None
    try:
        # ── Save file ──
        file_path = save_upload(file)
        log.info(f"🔬 Scan started: method={method}, type={scan_type}")

        # ── Configure Gemini API key if provided ──
        if api_key and method == "gemini" and GEMINI_AVAILABLE:
            configure_gemini(api_key)

        results = {
            "method_used": method,
            "scan_type": scan_type,
            "image_path": file_path,
            "image_url": f"/uploads/{os.path.basename(file_path)}",
        }

        # ── Layer 1: Detection & Counting ──
        detection_results = {"items": [], "total_count": 0}

        if method == "gemini" and GEMINI_AVAILABLE:
            log.info("🤖 Running Gemini Vision detection...")
            detection_results = detect_and_count_items(file_path)
            results["model_used"] = detection_results.get("model_used", "gemini")

        elif method == "yolo" and YOLO_AVAILABLE:
            log.info("⚡ Running YOLO detection...")
            detections, counts, annotated_img = detect_objects(file_path)
            detection_results = {
                "items": [
                    {
                        "name": name,
                        "count": count,
                        "category": "Fruit" if name in [
                            "apple", "banana", "orange", "grape", "strawberry",
                            "watermelon", "lemon", "mango", "pear"
                        ] else "Vegetable",
                    }
                    for name, count in counts.items()
                ],
                "total_count": sum(counts.values()),
            }
            results["model_used"] = "yolov8-world"

            # Save annotated image
            if annotated_img:
                ann_path = file_path.replace(".", "_annotated.")
                annotated_img.save(ann_path)
                results["annotated_image_url"] = f"/uploads/{os.path.basename(ann_path)}"

        elif GEMINI_AVAILABLE:
            # Fallback to Gemini if YOLO requested but unavailable
            log.info("⚡ YOLO unavailable, falling back to Gemini...")
            detection_results = detect_and_count_items(file_path)
            results["model_used"] = "gemini-fallback"

        else:
            detection_results = {
                "items": [],
                "total_count": 0,
                "error": "No detection model available. Install google-generativeai or ultralytics.",
            }
            results["model_used"] = "none"

        # Merge detection results
        results["items"] = detection_results.get("items", [])
        results["total_count"] = detection_results.get("total_count", 0)

        if "error" in detection_results and detection_results["error"]:
            results["detection_warning"] = detection_results["error"]

        # ── Layer 2: Freshness Assessment (ResNet fallback) ──
        items_have_freshness = any(
            item.get("freshness") for item in results.get("items", [])
        )
        if (
            scan_type in ["Check Freshness", "Full Scan"]
            and not items_have_freshness
            and RESNET_AVAILABLE
        ):
            log.info("🧠 Running ResNet freshness analysis...")
            freshness_result = predict_freshness(file_path)
            results["freshness_analysis"] = freshness_result

            # Annotate items with freshness if they don't have it
            if freshness_result.get("label"):
                for item in results.get("items", []):
                    if not item.get("freshness"):
                        item["freshness"] = freshness_result["label"]
                        item["freshness_confidence"] = freshness_result.get("confidence", 0)

        # ── Layer 3: OCR Label Reading ──
        if scan_type in ["Read Labels (OCR)", "Full Scan"] and OCR_AVAILABLE:
            log.info("📖 Running OCR extraction...")
            ocr_result = extract_product_info(file_path)
            results["ocr"] = ocr_result

            # Layer 3b: Expiry status check
            if ocr_result.get("expiry_date"):
                expiry_status = check_expiry_status(ocr_result["expiry_date"])
                results["expiry_status"] = expiry_status

        # ── Layer 4: Save to database ──
        scan_id = None
        if DB_AVAILABLE:
            try:
                scan_id = db.save_scan(
                    user_id=user_id,
                    image_path=file_path,
                    scan_type=scan_type,
                    items_detected=results.get("items", []),
                    total_count=results.get("total_count", 0),
                    freshness_results=results.get("freshness_analysis"),
                    ocr_results=results.get("ocr"),
                    detection_method=method,
                )
                results["scan_id"] = scan_id

                # Auto-add items to inventory
                for item in results.get("items", []):
                    item_id = db.add_inventory_item(
                        user_id=user_id,
                        item_name=item.get("name", "Unknown"),
                        category=item.get("category", "Other"),
                        quantity=item.get("count", 1),
                        freshness=item.get("freshness"),
                        freshness_score=item.get("freshness_confidence"),
                        image_path=file_path,
                    )
                    item["inventory_id"] = item_id

                    # Create alert for rotten items
                    if item.get("freshness", "").lower() == "rotten":
                        db.create_alert(
                            user_id=user_id,
                            inventory_id=item_id,
                            alert_type="spoilage",
                            message=f"⚠️ {item['name']} detected as ROTTEN — consider discarding.",
                        )

                log.info(f"💾 Scan saved to DB (scan_id={scan_id})")
            except Exception as db_err:
                log.error(f"Database error: {db_err}")
                results["db_warning"] = str(db_err)

        log.info(f"✅ Scan complete: {results.get('total_count', 0)} items detected")
        return {"success": True, "data": results}

    except Exception as e:
        log.error(f"❌ Scan error: {traceback.format_exc()}")
        return {"success": False, "error": str(e)}


@app.post("/api/scan/details")
async def scan_details(
    file: UploadFile = File(...),
    api_key: str = Form(None),
):
    """Get detailed analysis for a single food item (Gemini deep analysis)."""
    try:
        file_path = save_upload(file)

        if api_key and GEMINI_AVAILABLE:
            configure_gemini(api_key)

        if GEMINI_AVAILABLE:
            result = get_item_details(file_path)
            return {"success": True, "data": result}
        else:
            return {"success": False, "error": "Gemini Vision not available"}

    except Exception as e:
        return {"success": False, "error": str(e)}


# ──────────────────────────────────────────────────────────────
# Routes: Inventory CRUD
# ──────────────────────────────────────────────────────────────

@app.get("/api/inventory/{user_id}")
async def get_inventory(
    user_id: int,
    status: str = Query("active", description="Filter by status: active, deleted, all"),
):
    """Get user's inventory items."""
    if not DB_AVAILABLE:
        return {"success": False, "error": "Database not available"}

    try:
        if status == "all":
            items_active = db.get_user_inventory(user_id, status="active")
            items_deleted = db.get_user_inventory(user_id, status="deleted")
            items = items_active + items_deleted
        else:
            items = db.get_user_inventory(user_id, status=status)

        return {
            "success": True,
            "data": {
                "items": items,
                "count": len(items),
            },
        }
    except Exception as e:
        return {"success": False, "error": str(e)}


@app.post("/api/inventory")
async def add_inventory_item(item: InventoryItemCreate):
    """Manually add an item to inventory."""
    if not DB_AVAILABLE:
        return {"success": False, "error": "Database not available"}

    try:
        item_id = db.add_inventory_item(
            user_id=item.user_id,
            item_name=item.item_name,
            category=item.category,
            quantity=item.quantity,
            freshness=item.freshness,
            freshness_score=item.freshness_score,
            expiry_date=item.expiry_date,
            batch_number=item.batch_number,
            image_path=item.image_path,
        )
        return {
            "success": True,
            "data": {"item_id": item_id, "message": f"Added '{item.item_name}' to inventory"},
        }
    except Exception as e:
        return {"success": False, "error": str(e)}


@app.put("/api/inventory/{item_id}")
async def update_inventory(item_id: int, updates: InventoryItemUpdate):
    """Update an inventory item."""
    if not DB_AVAILABLE:
        return {"success": False, "error": "Database not available"}

    try:
        update_data = {k: v for k, v in updates.model_dump().items() if v is not None}
        if not update_data:
            return {"success": False, "error": "No fields to update"}

        success = db.update_inventory_item(item_id, **update_data)
        return {
            "success": success,
            "data": {"item_id": item_id, "updated_fields": list(update_data.keys())},
        }
    except Exception as e:
        return {"success": False, "error": str(e)}


@app.delete("/api/inventory/{item_id}")
async def delete_inventory_item(item_id: int):
    """Soft-delete an inventory item."""
    if not DB_AVAILABLE:
        return {"success": False, "error": "Database not available"}

    try:
        success = db.delete_inventory_item(item_id)
        return {"success": success, "data": {"item_id": item_id, "status": "deleted"}}
    except Exception as e:
        return {"success": False, "error": str(e)}


# ──────────────────────────────────────────────────────────────
# Routes: Scan History
# ──────────────────────────────────────────────────────────────

@app.get("/api/history/{user_id}")
async def get_history(
    user_id: int,
    limit: int = Query(50, ge=1, le=200),
):
    """Get user's scan history."""
    if not DB_AVAILABLE:
        return {"success": False, "error": "Database not available"}

    try:
        history = db.get_user_scan_history(user_id, limit=limit)
        return {
            "success": True,
            "data": {
                "scans": history,
                "count": len(history),
            },
        }
    except Exception as e:
        return {"success": False, "error": str(e)}


# ──────────────────────────────────────────────────────────────
# Routes: Analytics
# ──────────────────────────────────────────────────────────────

@app.get("/api/analytics/{user_id}")
async def get_analytics(user_id: int):
    """Get dashboard analytics & statistics."""
    if not DB_AVAILABLE:
        return {"success": False, "error": "Database not available"}

    try:
        stats = db.get_user_stats(user_id)
        expiring = db.get_expiring_items(user_id, days=7)

        return {
            "success": True,
            "data": {
                "stats": stats,
                "expiring_items": expiring,
                "expiring_count": len(expiring),
            },
        }
    except Exception as e:
        return {"success": False, "error": str(e)}


# ──────────────────────────────────────────────────────────────
# Routes: Alerts
# ──────────────────────────────────────────────────────────────

@app.get("/api/alerts/{user_id}")
async def get_alerts(
    user_id: int,
    unread_only: bool = Query(False),
):
    """Get user's alerts."""
    if not DB_AVAILABLE:
        return {"success": False, "error": "Database not available"}

    try:
        alerts = db.get_user_alerts(user_id, unread_only=unread_only)
        return {
            "success": True,
            "data": {
                "alerts": alerts,
                "count": len(alerts),
                "unread": sum(1 for a in alerts if not a.get("is_read")),
            },
        }
    except Exception as e:
        return {"success": False, "error": str(e)}


@app.put("/api/alerts/{alert_id}/read")
async def mark_alert_read(alert_id: int):
    """Mark an alert as read."""
    if not DB_AVAILABLE:
        return {"success": False, "error": "Database not available"}

    try:
        db.mark_alert_read(alert_id)
        return {"success": True, "data": {"alert_id": alert_id, "status": "read"}}
    except Exception as e:
        return {"success": False, "error": str(e)}


# ──────────────────────────────────────────────────────────────
# Routes: Expiring Items
# ──────────────────────────────────────────────────────────────

@app.get("/api/expiring/{user_id}")
async def get_expiring_items(
    user_id: int,
    days: int = Query(7, ge=1, le=90),
):
    """Get items expiring within specified days."""
    if not DB_AVAILABLE:
        return {"success": False, "error": "Database not available"}

    try:
        items = db.get_expiring_items(user_id, days=days)
        return {
            "success": True,
            "data": {
                "items": items,
                "count": len(items),
                "threshold_days": days,
            },
        }
    except Exception as e:
        return {"success": False, "error": str(e)}


# ──────────────────────────────────────────────────────────────
# Startup & Shutdown Events
# ──────────────────────────────────────────────────────────────

@app.on_event("startup")
async def startup():
    log.info("=" * 60)
    log.info("🚀 FreshAI API v2.0 — Starting up")
    log.info("=" * 60)
    log.info(f"  Gemini Vision : {'✅ Ready' if GEMINI_AVAILABLE else '❌ Not loaded'}")
    log.info(f"  YOLO Detection: {'✅ Ready' if YOLO_AVAILABLE else '❌ Not loaded'}")
    log.info(f"  ResNet Fresh  : {'✅ Ready' if RESNET_AVAILABLE else '❌ Not loaded'}")
    log.info(f"  OCR Engine    : {'✅ Ready' if OCR_AVAILABLE else '❌ Not loaded'}")
    log.info(f"  Database      : {'✅ Ready' if DB_AVAILABLE else '❌ Not loaded'}")
    log.info("=" * 60)
    log.info("📡 API docs available at http://localhost:8000/docs")
    log.info("=" * 60)


# ──────────────────────────────────────────────────────────────
# Main
# ──────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "fastapi_server:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info",
    )
