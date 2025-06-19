import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import { db } from '@/lib/db';
import { trafficAssessments } from '@/lib/db/schema';

interface TrafficAssessmentInfo {
  number: string;
  projectName: string;
  year: string;
  businessOwner: string;
  assessmentAgency: string;
  approvalAuthority: string;
  location: string;
  status: string;
  projectId: string;
}

export async function GET() {
  try {
    console.log('교통영향평가 자료 크롤링 시작 (약식 검색)');
    
    let browser;
    
    try {
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });

      const page = await browser.newPage();
      const allAssessments: TrafficAssessmentInfo[] = [];
      
      // 검색 조건 설정
      const startDate = '2020-01-01'; // 2024년부터로 확장
      const endDate = new Date().toISOString().split('T')[0]; // 오늘까지
      const businessName = '약식'; // 사업명 검색 조건
      
      console.log(`검색 기간: ${startDate} ~ ${endDate}`);
      console.log(`사업명 검색: ${businessName}`);
      
      // 교통영향평가정보지원시스템 접속
      await page.goto('https://tia.molit.go.kr/search/businessSrchList.do', { 
        waitUntil: 'networkidle2', 
        timeout: 30000 
      });
      
      // 페이지 로딩 대기
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // 검색 조건 설정
      await page.evaluate((startDate, endDate, businessName) => {
        // 시작일 설정
        const startDateInput = document.querySelector('#s_st_dt') as HTMLInputElement;
        if (startDateInput) {
          startDateInput.value = startDate;
          startDateInput.dispatchEvent(new Event('change', { bubbles: true }));
        }
        
        // 종료일 설정
        const endDateInput = document.querySelector('#s_en_dt') as HTMLInputElement;
        if (endDateInput) {
          endDateInput.value = endDate;
          endDateInput.dispatchEvent(new Event('change', { bubbles: true }));
        }
        
        // 사업명 설정
        const businessNameInput = document.querySelector('#s_bsns_nm') as HTMLInputElement;
        if (businessNameInput) {
          businessNameInput.value = businessName;
        }
      }, startDate, endDate, businessName);
      
      // 검색 버튼 클릭 (여러 방법 시도)
      try {
        // 방법 1: 실제 검색 버튼 (a 태그)
        await page.click('a.submit-btn');
      } catch {
        console.log('기본 검색 버튼을 찾을 수 없음, 다른 방법 시도...');
        try {
          // 방법 2: 텍스트가 "검색"인 링크
          await page.click('a:has-text("검색")');
        } catch {
          console.log('검색 버튼을 찾을 수 없음, 폼 제출 시도...');
          // 방법 3: 폼 제출
          await page.evaluate(() => {
            const form = document.querySelector('form');
            if (form) {
              form.submit();
            } else {
              // 방법 4: Enter 키로 제출
              const searchInput = document.querySelector('#s_bsns_nm') as HTMLInputElement;
              if (searchInput) {
                searchInput.focus();
                searchInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true }));
              }
            }
          });
        }
      }
      
      // 검색 결과 로딩 대기
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // 모든 페이지 크롤링
      let currentPageNum = 1;
      let hasNextPage = true;
      
      while (hasNextPage) {
        console.log(`=== 페이지 ${currentPageNum} 크롤링 시작 ===`);
        
        // 페이지 로딩 대기
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // 현재 페이지 정보 확인
        const pageInfo = await page.evaluate(() => {
          const totalText = document.querySelector('.total')?.textContent || '';
          const currentPageText = document.querySelector('.current')?.textContent || '';
          const tableRows = document.querySelectorAll('table tr').length;
          
          return {
            totalText,
            currentPageText,
            tableRows,
            pageHtml: document.body.innerHTML.substring(0, 1000) // 디버깅용
          };
        });
        
        console.log(`페이지 정보:`, pageInfo);
        
        // 테이블에서 교통영향평가 정보 추출
        const pageAssessments = await page.evaluate(() => {
          const assessments: TrafficAssessmentInfo[] = [];
          
          // 사업목록 테이블 찾기
          const tables = document.querySelectorAll('table');
          console.log(`발견된 테이블 개수: ${tables.length}`);
          
          tables.forEach((table, tableIndex) => {
            const rows = table.querySelectorAll('tr');
            console.log(`테이블 ${tableIndex}: 행 개수 = ${rows.length}`);
            
            rows.forEach((row) => {
              const cells = row.querySelectorAll('td');
              
              if (cells.length >= 8) {
                const number = cells[0]?.textContent?.trim() || '';
                const projectNameElement = cells[1]?.querySelector('a');
                const projectName = projectNameElement?.textContent?.trim() || '';
                const year = cells[2]?.textContent?.trim() || '';
                const businessOwner = cells[3]?.textContent?.trim() || '';
                const assessmentAgency = cells[4]?.textContent?.trim() || '';
                const approvalAuthority = cells[5]?.textContent?.trim() || '';
                const location = cells[6]?.textContent?.trim() || '';
                const status = cells[7]?.textContent?.trim() || '';
                
                // 프로젝트 ID 추출 (href에서)
                let projectId = '';
                if (projectNameElement) {
                  const href = projectNameElement.getAttribute('href');
                  if (href) {
                    const match = href.match(/fn_view\('([^']+)'\)/);
                    if (match) {
                      projectId = match[1];
                    }
                  }
                }
                
                // 번호가 숫자인 경우만 유효한 데이터로 간주
                if (number && !isNaN(Number(number))) {
                  assessments.push({
                    number,
                    projectName,
                    year,
                    businessOwner,
                    assessmentAgency,
                    approvalAuthority,
                    location,
                    status,
                    projectId
                  });
                  console.log(`수집된 데이터: ${number} - ${projectName}`);
                }
              }
            });
          });
          
          return assessments;
        });
        
        allAssessments.push(...pageAssessments);
        console.log(`페이지 ${currentPageNum}: ${pageAssessments.length}개 교통영향평가 정보 수집`);
        console.log(`누적 수집: ${allAssessments.length}개`);
        
        // 다음 페이지로 이동
        const nextPageResult = await page.evaluate((currentPage) => {
          // 현재 페이지가 10의 배수인지 확인 (10, 20, 30...)
          const isMultipleOfTen = currentPage % 10 === 0;
          
          if (isMultipleOfTen) {
            // 10의 배수 페이지에서는 "다음" 버튼 클릭
            const nextButton = document.querySelector('a[href*="fn_link_page"][title*="다음"]');
            if (nextButton) {
              console.log('다음 버튼 클릭:', nextButton.getAttribute('href'));
              (nextButton as HTMLElement).click();
              return { success: true, method: 'next_button', nextPage: currentPage + 1 };
            } else {
              return { success: false, method: 'next_button_not_found' };
            }
          } else {
            // 일반 페이지에서는 다음 번호 페이지로 이동
            const nextPageNum = currentPage + 1;
            const nextPageLink = document.querySelector(`a[href*="fn_link_page(${nextPageNum})"]`);
            if (nextPageLink) {
              console.log(`페이지 ${nextPageNum} 클릭:`, nextPageLink.getAttribute('href'));
              (nextPageLink as HTMLElement).click();
              return { success: true, method: 'page_number', nextPage: nextPageNum };
            } else {
              return { success: false, method: 'page_number_not_found', nextPage: nextPageNum };
            }
          }
        }, currentPageNum);
        
        console.log(`페이지 이동 결과:`, nextPageResult);
        
        if (nextPageResult.success && nextPageResult.nextPage) {
          currentPageNum = nextPageResult.nextPage;
          await new Promise(resolve => setTimeout(resolve, 3000));
        } else {
          console.log('더 이상 이동할 페이지가 없음');
          hasNextPage = false;
        }
      }
      
      await browser.close();
      
      // 기존 데이터 모두 삭제
      console.log('기존 교통영향평가 데이터 삭제 중...');
      await db.delete(trafficAssessments);
      console.log('기존 데이터 삭제 완료');
      
      // 새 데이터 저장
      if (allAssessments.length > 0) {
        console.log(`${allAssessments.length}개 교통영향평가 데이터 저장 중...`);
        await db.insert(trafficAssessments).values(
          allAssessments.map(assessment => ({
            number: assessment.number,
            projectName: assessment.projectName,
            year: assessment.year,
            businessOwner: assessment.businessOwner,
            assessmentAgency: assessment.assessmentAgency,
            approvalAuthority: assessment.approvalAuthority,
            location: assessment.location,
            status: assessment.status,
            projectId: assessment.projectId
          }))
        );
        console.log('새 데이터 저장 완료');
      }
      
      return NextResponse.json({
        success: true,
        assessments: allAssessments,
        totalCount: allAssessments.length,
        searchConditions: {
          startDate,
          endDate,
          businessName
        },
        message: '약식 검색 조건으로 교통영향평가 자료 크롤링 및 저장 완료'
      });
      
    } catch (error) {
      console.error('크롤링 오류:', error);
      if (browser) await browser.close();
      
      return NextResponse.json({
        success: false,
        error: error instanceof Error ? error.message : '교통영향평가 크롤링 실패'
      });
    }
    
  } catch (error) {
    console.error('API 오류:', error);
    return NextResponse.json(
      { error: '교통영향평가 자료 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 