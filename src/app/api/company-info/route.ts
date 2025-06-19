import { NextRequest, NextResponse } from 'next/server';

interface CompanyInfo {
  number: string;
  companyName: string;
  representative: string;
  address: string;
  phone: string;
  linkIdx?: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyName = searchParams.get('name');
    
    if (!companyName) {
      return NextResponse.json(
        { error: '업체명이 필요합니다.' },
        { status: 400 }
      );
    }

    // KATIA 시행사 정보 조회
    let companies: CompanyInfo[] = [];
    let dbConnected = false;
    
    try {
      const { db } = await import('@/lib/db');
      const { katiaCompanies } = await import('@/lib/db/schema');
      const dbCompanies = await db.select().from(katiaCompanies);
      companies = dbCompanies.map(company => ({
        number: company.number,
        companyName: company.companyName,
        representative: company.representative,
        address: company.address,
        phone: company.phone,
        linkIdx: company.linkIdx || undefined
      }));
      dbConnected = true;
    } catch (dbError) {
      console.log('데이터베이스 연결 실패:', dbError);
      return NextResponse.json(
        { error: '시행사 정보를 조회할 수 없습니다.' },
        { status: 500 }
      );
    }

    // 업체명 매칭 (정확한 일치 또는 포함 관계)
    const matchedCompanies = companies.filter(company => {
      const normalizedCompanyName = company.companyName
        .replace(/주식회사|(주)|㈜|㈐|㈑|㈒|㈓|㈔|㈕|㈖|㈗|㈘|㈙|㈚|㈛|㈜|㈝|㈞|㈟|㈠|㈡|㈢|㈣|㈤|㈥|㈦|㈧|㈨|㈩/g, '')
        .replace(/\s+/g, '')
        .trim();
      
      const normalizedSearchName = companyName
        .replace(/주식회사|(주)|㈜|㈐|㈑|㈒|㈓|㈔|㈕|㈖|㈗|㈘|㈙|㈚|㈛|㈜|㈝|㈞|㈟|㈠|㈡|㈢|㈣|㈤|㈥|㈦|㈧|㈨|㈩/g, '')
        .replace(/\s+/g, '')
        .trim();

      return normalizedCompanyName.includes(normalizedSearchName) || 
             normalizedSearchName.includes(normalizedCompanyName);
    });

    return NextResponse.json({
      success: true,
      companies: matchedCompanies,
      totalCount: matchedCompanies.length,
      searchTerm: companyName,
      dbConnected
    });

  } catch (error) {
    console.error('업체 정보 검색 오류:', error);
    return NextResponse.json(
      { error: '업체 정보 검색 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 