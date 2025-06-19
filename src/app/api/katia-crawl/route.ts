import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

interface CompanyInfo {
  number: string;
  companyName: string;
  representative: string;
  address: string;
  phone: string;
}

export async function POST() {
  try {
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
              const companyName = cells[1]?.textContent?.trim() || '';
              const representative = cells[2]?.textContent?.trim() || '';
              const address = cells[3]?.textContent?.trim() || '';
              const phone = cells[4]?.textContent?.trim() || '';
              
              // 번호가 숫자인 경우만 유효한 데이터로 간주
              if (number && !isNaN(Number(number))) {
                companies.push({
                  number,
                  companyName,
                  representative,
                  address,
                  phone
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
      
      // 데이터베이스에 저장 시도
      let dbConnected = false;
      try {
        const { db } = await import('@/lib/db');
        const { katiaCompanies } = await import('@/lib/db/schema');
        
        // 기존 데이터 삭제
        await db.delete(katiaCompanies);
        console.log('기존 데이터 삭제 완료');
        
        // 새 데이터 저장
        if (allCompanies.length > 0) {
          await db.insert(katiaCompanies).values(
            allCompanies.map(company => ({
              number: company.number,
              companyName: company.companyName,
              representative: company.representative,
              address: company.address,
              phone: company.phone
            }))
          );
          console.log('데이터베이스에 새 데이터 저장 완료');
          dbConnected = true;
        }
      } catch (dbError) {
        console.log('데이터베이스 저장 실패:', dbError);
      }
      
      return NextResponse.json({
        success: true,
        companies: allCompanies,
        totalCount: allCompanies.length,
        message: '크롤링 완료',
        dbConnected,
        timestamp: new Date().toISOString()
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
    
  } catch (error) {
    console.error('API 오류:', error);
    return NextResponse.json(
      { error: 'KATIA 시행사 정보 크롤링 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 