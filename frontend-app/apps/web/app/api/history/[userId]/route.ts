import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const scans = [
    { 
      id: 1, 
      scan_type: "Full AI Analysis", 
      detection_method: "Gemini 1.5 Pro", 
      item_count: 5, 
      scanned_at: new Date().toISOString(),
      image_path: null 
    },
    { 
      id: 2, 
      scan_type: "Quick Scan", 
      detection_method: "YOLOv8", 
      item_count: 2, 
      scanned_at: new Date(Date.now() - 86400000).toISOString(),
      image_path: null 
    }
  ];

  return NextResponse.json({ success: true, data: { scans } });
}
