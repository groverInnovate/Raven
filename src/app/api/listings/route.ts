import { NextRequest, NextResponse } from 'next/server';
import { SupabaseService } from '../../../lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { nullifier, title, description, api_key, price } = await request.json();
    
    if (!nullifier || !title || !api_key || !price) {
      return NextResponse.json(
        { error: 'Missing required fields: nullifier, title, api_key, price' },
        { status: 400 }
      );
    }

    console.log(`📝 Creating listing: ${title} for nullifier: ${nullifier}`);

    // Create listing in Supabase
    const result = await SupabaseService.createListing({
      nullifier,
      title,
      description,
      api_key,
      price: parseFloat(price)
    });

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    console.log(`✅ Listing created successfully: ${result.data?.id}`);

    return NextResponse.json({
      success: true,
      data: result.data,
      message: 'Listing created successfully'
    });

  } catch (error: any) {
    console.error('❌ Listings API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const nullifier = searchParams.get('nullifier');

    if (nullifier) {
      // Get listings for specific nullifier
      const result = await SupabaseService.getListingsByNullifier(nullifier);
      
      if (result.error) {
        return NextResponse.json(
          { error: result.error },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        data: result.listings
      });
    } else {
      // Get all listings
      const result = await SupabaseService.getAllListings();
      
      if (result.error) {
        return NextResponse.json(
          { error: result.error },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        data: result.listings
      });
    }

  } catch (error: any) {
    console.error('❌ Listings GET API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
