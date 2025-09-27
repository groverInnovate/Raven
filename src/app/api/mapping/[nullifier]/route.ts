import { NextResponse } from "next/server";
import { nullifierMappingService } from "../../../../lib/nullifierMapping";

// Get user data from nullifier mapping
export async function GET(
  request: Request,
  { params }: { params: { nullifier: string } }
) {
  try {
    const { nullifier } = params;
    console.log(`🔍 Looking up nullifier in mapping: ${nullifier}`);
    
    const result = await nullifierMappingService.getNullifierData(nullifier);
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        nullifier,
        data: result.data,
        mappingHash: nullifierMappingService.getCurrentMappingHash(),
        mappingLink: nullifierMappingService.getMappingLink()
      });
    } else {
      return NextResponse.json({
        success: false,
        nullifier,
        error: result.error
      }, { status: 404 });
    }
  } catch (error) {
    console.error("Error retrieving nullifier data:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

// Get the entire nullifier mapping
export async function POST(request: Request) {
  try {
    console.log("📊 Retrieving entire nullifier mapping");
    
    const mapping = await nullifierMappingService.getCurrentMapping();
    
    return NextResponse.json({
      success: true,
      mapping,
      totalEntries: Object.keys(mapping).length,
      mappingHash: nullifierMappingService.getCurrentMappingHash(),
      mappingLink: nullifierMappingService.getMappingLink()
    });
  } catch (error) {
    console.error("Error retrieving nullifier mapping:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
