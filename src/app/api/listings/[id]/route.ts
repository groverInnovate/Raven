import { NextRequest, NextResponse } from "next/server";
import { SupabaseService } from "../../../../lib/supabase";

// GET - Fetch listing by ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log(`📋 Fetching listing with ID: ${id}`);
    
    const result = await SupabaseService.getListingById(id);
    
    if (result.success && result.data) {
      console.log(`✅ Found listing: ${result.data.title}`);
      return NextResponse.json({
        success: true,
        data: result.data
      });
    } else {
      console.log('⚠️ Listing not found:', result.error);
      return NextResponse.json({
        success: false,
        error: result.error || 'Listing not found'
      }, { status: 404 });
    }
  } catch (error) {
    console.error('❌ Error fetching listing:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch listing'
    }, { status: 500 });
  }
}