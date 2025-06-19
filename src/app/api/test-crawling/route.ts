import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const testUrl = searchParams.get('url') || 'https://www.katia.or.kr/work/member_manage.php?code=member_manage&category=&Dosearch=company&search_order=%E3%88%9C%ED%95%9C%EC%86%94%EC%95%8C%EC%95%A4%EB%94%94';

    console.log(`테스트 URL: ${testUrl}`);

    let browser;
    
    try {
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });

      const page = await browser.newPage();
      
      await page.goto(testUrl, { waitUntil: 'networkidle2', timeout: 30000 });
      
      // 페이지 스크린샷 저장 (디버깅용)
      await page.screenshot({ path: './test-screenshot.png' });
      
      // 테이블 크롤링 테스트
      const tableData = await page.evaluate(() => {
        console.log('=== 테이블 크롤링 테스트 시작 ===');
        
        // 모든 테이블 찾기
        const tables = document.querySelectorAll('table');
        console.log(`발견된 테이블 개수: ${tables.length}`);
        
        const results = [];
        
        for (let tableIndex = 0; tableIndex < tables.length; tableIndex++) {
          const table = tables[tableIndex];
          const rows = table.querySelectorAll('tr');
          console.log(`테이블 ${tableIndex}: 행 개수 = ${rows.length}`);
          
          const tableData = [];
          
          for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
            const row = rows[rowIndex];
            const cells = row.querySelectorAll('td');
            console.log(`  행 ${rowIndex}: 셀 개수 = ${cells.length}`);
            
            const rowData = [];
            for (let cellIndex = 0; cellIndex < cells.length; cellIndex++) {
              const cellText = cells[cellIndex].textContent?.trim();
              rowData.push(cellText);
              console.log(`    셀 ${cellIndex}: "${cellText}"`);
            }
            
            if (rowData.length > 0) {
              tableData.push(rowData);
            }
          }
          
          if (tableData.length > 0) {
            results.push({
              tableIndex,
              data: tableData
            });
          }
        }
        
        console.log('=== 테이블 크롤링 테스트 완료 ===');
        return results;
      });

      await browser.close();
      
      return NextResponse.json({
        success: true,
        url: testUrl,
        tables: tableData,
        message: '크롤링 테스트 완료'
      });
      
    } catch (error) {
      console.error('크롤링 테스트 오류:', error);
      
      if (browser) {
        await browser.close();
      }
      
      return NextResponse.json({
        success: false,
        error: error instanceof Error ? error.message : '크롤링 테스트 실패',
        url: testUrl
      });
    }
    
  } catch (error) {
    console.error('API 오류:', error);
    return NextResponse.json(
      { error: '테스트 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 