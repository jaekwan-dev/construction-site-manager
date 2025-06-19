import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

interface CompanyInfo {
  number: string;
  companyName: string;
  representative: string;
  address: string;
  phone: string;
  linkIdx?: string;
}

// 임시 메모리 저장소 (데이터베이스 연결 실패 시 사용)
let tempCompanies: CompanyInfo[] = [];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    
    // 데이터베이스 연결 시도
    let existingCompanies: CompanyInfo[] = [];
    let dbConnected = false;
    
    try {
      const { db } = await import('@/lib/db');
      const { katiaCompanies } = await import('@/lib/db/schema');
      const dbCompanies = await db.select().from(katiaCompanies);
      existingCompanies = dbCompanies.map(company => ({
        number: company.number,
        companyName: company.companyName,
        representative: company.representative,
        address: company.address,
        phone: company.phone,
        linkIdx: company.linkIdx || undefined
      }));
      dbConnected = true;
      console.log('데이터베이스 연결 성공');
    } catch (dbError) {
      console.log('데이터베이스 연결 실패, 임시 저장소 사용:', dbError);
      existingCompanies = tempCompanies;
    }
    
    if (action === 'crawl' || existingCompanies.length === 0) {
      // 크롤링이 요청되었거나 데이터가 없는 경우 크롤링 실행
      console.log('KATIA 시행사 정보 크롤링 시작');
      
      let browser;
      
      try {
        browser = await puppeteer.launch({
          headless: true,
          args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();
        const allCompanies: CompanyInfo[] = [];
        
        // 1페이지부터 15페이지까지 크롤링
        for (let pageNum = 1; pageNum <= 15; pageNum++) {
          console.log(`페이지 ${pageNum} 크롤링 중...`);
          
          const url = `https://www.katia.or.kr/work/member_manage.php?search_order=&mode=&premode=&code=member_manage&category=&idx=&fk_idx=&thisPageNum=${pageNum}&Dosearch=`;
          
          await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
          
          // 페이지 로딩 대기
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // 테이블에서 회사 정보 추출
          const pageCompanies = await page.evaluate(() => {
            const companies: CompanyInfo[] = [];
            
            // 회사 정보 테이블 찾기 (번호, 회사명, 대표자, 등록지, 부서전화 컬럼)
            const rows = document.querySelectorAll('table tr');
            
            rows.forEach((row) => {
              const cells = row.querySelectorAll('td');
              
              if (cells.length >= 5) {
                const number = cells[0]?.textContent?.trim() || '';
                const companyNameCell = cells[1];
                const companyName = companyNameCell?.textContent?.trim() || '';
                const representative = cells[2]?.textContent?.trim() || '';
                const address = cells[3]?.textContent?.trim() || '';
                const phone = cells[4]?.textContent?.trim() || '';
                
                // 회사명 링크에서 link_idx 추출
                let linkIdx = '';
                if (companyNameCell) {
                  const link = companyNameCell.querySelector('a');
                  if (link) {
                    const href = link.getAttribute('href');
                    if (href) {
                      // javascript:sendPage_('v', '477','1') 형태에서 '477' 추출
                      const match = href.match(/sendPage_\('v',\s*'(\d+)',\s*'\d+'\)/);
                      if (match) {
                        linkIdx = match[1];
                      }
                    }
                  }
                }
                
                // 번호가 숫자인 경우만 유효한 데이터로 간주
                if (number && !isNaN(Number(number))) {
                  companies.push({
                    number,
                    companyName,
                    representative,
                    address,
                    phone,
                    linkIdx: linkIdx || undefined
                  });
                }
              }
            });
            
            return companies;
          });
          
          allCompanies.push(...pageCompanies);
          console.log(`페이지 ${pageNum}: ${pageCompanies.length}개 회사 정보 수집`);
          
          // 페이지 간 딜레이
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

        await browser.close();
        
        console.log(`총 ${allCompanies.length}개 회사 정보 수집 완료`);
        
        // 데이터 저장 (데이터베이스 또는 임시 저장소)
        if (dbConnected) {
          // 기존 데이터 삭제 후 새 데이터 저장
          if (existingCompanies.length > 0) {
            const { db } = await import('@/lib/db');
            const { katiaCompanies } = await import('@/lib/db/schema');
            await db.delete(katiaCompanies);
            console.log('기존 데이터 삭제 완료');
          }
          
          // 새 데이터 저장
          if (allCompanies.length > 0) {
            const { db } = await import('@/lib/db');
            const { katiaCompanies } = await import('@/lib/db/schema');
            await db.insert(katiaCompanies).values(
              allCompanies.map(company => ({
                number: company.number,
                companyName: company.companyName,
                representative: company.representative,
                address: company.address,
                phone: company.phone,
                linkIdx: company.linkIdx
              }))
            );
            console.log('데이터베이스에 새 데이터 저장 완료');
          }
        } else {
          // 임시 저장소에 저장
          tempCompanies = allCompanies;
          console.log('임시 저장소에 데이터 저장 완료');
        }
        
        return NextResponse.json({
          success: true,
          companies: allCompanies,
          totalCount: allCompanies.length,
          message: '크롤링 및 데이터 저장 완료',
          isNewData: true,
          dbConnected
        });
        
      } catch (error) {
        console.error('KATIA 크롤링 오류:', error);
        
        if (browser) {
          await browser.close();
        }
        
        return NextResponse.json({
          success: false,
          error: error instanceof Error ? error.message : 'KATIA 크롤링 실패'
        });
      }
    } else {
      // 기존 데이터 반환
      return NextResponse.json({
        success: true,
        companies: existingCompanies,
        totalCount: existingCompanies.length,
        message: '저장된 데이터 조회 완료',
        isNewData: false,
        dbConnected
      });
    }
    
  } catch (error) {
    console.error('API 오류:', error);
    return NextResponse.json(
      { error: 'KATIA 시행사 정보 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 