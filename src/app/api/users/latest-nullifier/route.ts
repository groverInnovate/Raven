import { NextRequest, NextResponse } from "next/server";
import { SupabaseService } from "../../../../lib/supabase";

export async function GET(req: NextRequest) {
  try {
    console.log(`🔍 Getting latest nullifier by creation date`);
    
    // Get the latest nullifier from Supabase (most recent by created_at)
    const result = await SupabaseService.getLatestNullifier();
    
    if (result.success && result.data) {
      console.log(`✅ Found latest nullifier: ${result.data.nullifier} (created: ${result.data.created_at})`);
      
      return NextResponse.json({ 
        success: true, 
        nullifier: result.data.nullifier,
        nationality: result.data.nationality,
        minimum_age: result.data.minimum_age,
        user_address: result.data.user_address,
        created_at: result.data.created_at
      });
    } else {
      console.log(`❌ No nullifier found in database`);
      
      return NextResponse.json({ 
        success: false, 
        error: "No verification found in database" 
      }, { status: 404 });
    }
    
  } catch (error) {
    console.error("Error retrieving latest nullifier:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to retrieve nullifier" 
    }, { status: 500 });
  }
}
