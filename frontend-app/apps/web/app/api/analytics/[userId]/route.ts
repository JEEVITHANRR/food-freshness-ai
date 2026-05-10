import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  // Mock analytics data that matches the frontend's expectations
  const stats = {
    total_scans: 124,
    total_items_detected: 452,
    inventory_count: 18,
    freshness_breakdown: {
      "Fresh": 12,
      "Slightly Aged": 4,
      "Rotten": 2
    },
    category_breakdown: {
      "Fruit": 8,
      "Vegetable": 6,
      "Protein": 2,
      "Dairy": 2
    }
  };

  const expiring_items = [
    { item_name: "Milk", days_until_expiry: 1 },
    { item_name: "Spinach", days_until_expiry: 0 },
    { item_name: "Chicken", days_until_expiry: 2 }
  ];

  return NextResponse.json({ 
    success: true, 
    data: { 
      stats, 
      expiring_items 
    } 
  });
}
