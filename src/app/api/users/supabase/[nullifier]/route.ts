import { NextRequest, NextResponse } from 'next/server';
import { SupabaseService } from '../../../../../lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ nullifier: string }> }
) {
  try {
    const { nullifier } = await params;
    
    if (!nullifier) {
      return NextResponse.json(
        { error: 'Nullifier is required' },
        { status: 400 }
      );
    }

    console.log(`🔍 Fetching user data from Supabase for nullifier: ${nullifier}`);

    // Get user data from Supabase
    const result = await SupabaseService.getVerifiedUser(nullifier);

    if (result.error) {
      console.log(`❌ User not found in Supabase: ${result.error}`);
      return NextResponse.json(
        { error: result.error },
        { status: 404 }
      );
    }

    console.log(`✅ User data retrieved from Supabase successfully`);

    return NextResponse.json({
      success: true,
      data: result.user
    });

  } catch (error: any) {
    console.error('❌ Supabase API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// Optional: Add POST method to manually store user data
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ nullifier: string }> }
) {
  try {
    const { nullifier } = await params;
    const userData = await request.json();
    
    if (!nullifier) {
      return NextResponse.json(
        { error: 'Nullifier is required' },
        { status: 400 }
      );
    }

    console.log(`📝 Manually storing user data in Supabase for nullifier: ${nullifier}`);

    const result = await SupabaseService.storeVerifiedUser({
      nullifier,
      ...userData
    });

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    console.log(`✅ User data stored in Supabase successfully`);

    return NextResponse.json({
      success: true,
      message: 'User data stored successfully'
    });

  } catch (error: any) {
    console.error('❌ Supabase store API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
