import { NextRequest, NextResponse } from "next/server";
import { SupabaseService } from "../../../../lib/supabase";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userAddress = searchParams.get('userAddress');
    
    console.log(`🔍 DEBUG: Checking for user address: ${userAddress}`);
    
    if (!userAddress) {
      return NextResponse.json({ 
        success: false, 
        error: "userAddress parameter is required" 
      }, { status: 400 });
    }
    
    // Get all users with this address (not just latest)
    const result = await SupabaseService.getAllVerifiedUsers();
    
    console.log(`📊 DEBUG: Total users in database: ${result.data?.length || 0}`);
    
    if (result.success && result.data) {
      // Filter by user address
      const userRecords = result.data.filter(user => 
        user.user_address?.toLowerCase() === userAddress.toLowerCase()
      );
      
      console.log(`🎯 DEBUG: Found ${userRecords.length} records for address ${userAddress}`);
      
      return NextResponse.json({ 
        success: true, 
        totalUsers: result.data.length,
        userRecords: userRecords,
        searchAddress: userAddress,
        allAddresses: result.data.map(u => u.user_address)
      });
    } else {
      console.log(`❌ DEBUG: Failed to get users from database:`, result.error);
      
      return NextResponse.json({ 
        success: false, 
        error: result.error || "Failed to get users from database"
      });
    }
    
  } catch (error) {
    console.error("DEBUG: Error checking user:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to check user data" 
    }, { status: 500 });
  }
}
