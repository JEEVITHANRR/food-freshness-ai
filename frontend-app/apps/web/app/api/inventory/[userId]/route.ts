import { NextRequest, NextResponse } from "next/server";

// Simple in-memory/ephemeral store for Vercel demo
// In a real production app, you would connect this to Supabase or Vercel KV
let inventory: any[] = [
  { id: 1, user_id: 1, item_name: "Organic Blueberries", category: "Fruit", quantity: 2, freshness: "Fresh", freshness_score: 0.95, added_at: new Date().toISOString() },
  { id: 2, user_id: 1, item_name: "Fresh Salmon", category: "Protein", quantity: 1, freshness: "Slightly Aged", freshness_score: 0.7, added_at: new Date().toISOString() },
  { id: 3, user_id: 1, item_name: "Whole Milk", category: "Dairy", quantity: 1, freshness: "Fresh", freshness_score: 0.9, added_at: new Date().toISOString() }
];

export async function GET(req: NextRequest) {
  return NextResponse.json({ success: true, data: { items: inventory } });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const newItem = {
      id: Date.now(),
      user_id: 1,
      item_name: body.item_name,
      category: body.category || "Other",
      quantity: body.quantity || 1,
      freshness: body.freshness || "Fresh",
      freshness_score: body.freshness_score || 0.9,
      added_at: new Date().toISOString()
    };
    inventory.unshift(newItem);
    return NextResponse.json({ success: true, data: newItem });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
