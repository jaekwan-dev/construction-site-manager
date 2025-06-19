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
      const startDate = '2024-01-01'; // 2024년부터로 확장
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
        }
        
        // 종료일 설정
        const endDateInput = document.querySelector('#s_en_dt') as HTMLInputElement;
        if (endDateInput) {
          endDateInput.value = endDate;
        }
        
        // 사업명 설정
        const businessNameInput = document.querySelector('#s_bsns_nm') as HTMLInputElement;
        if (businessNameInput) {
          businessNameInput.value = businessName;
        }
      }, startDate, endDate, businessName);
      
      // 검색 버튼 클릭
      await page.click('input[type="button"][value="검색"]');
      
      // 검색 결과 로딩 대기
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // 모든 페이지 크롤링
      let pageNum = 1;
      let hasNextPage = true;
      
      while (hasNextPage && pageNum <= 10) { // 최대 10페이지까지만 크롤링
        console.log(`=== 페이지 ${pageNum} 크롤링 시작 ===`);
        
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
        console.log(`페이지 ${pageNum}: ${pageAssessments.length}개 교통영향평가 정보 수집`);
        console.log(`누적 수집: ${allAssessments.length}개`);
        
        // 다음 페이지 확인 및 클릭
        const nextPageInfo = await page.evaluate(() => {
          const anchors = Array.from(document.querySelectorAll('a'));
          const nextButton = anchors.find(a =>
            a.title && a.title.includes('다음') && a.textContent && a.textContent.trim() === '>'
          );
          
          return {
            hasNext: !!nextButton,
            nextButtonText: nextButton?.textContent,
            nextButtonTitle: nextButton?.title,
            nextButtonHref: nextButton?.getAttribute('href'),
            allAnchors: anchors.map(a => ({
              text: a.textContent?.trim(),
              title: a.title,
              href: a.getAttribute('href')
            })).filter(a => a.text === '>' || a.title?.includes('다음'))
          };
        });
        
        console.log(`다음 페이지 정보:`, nextPageInfo);
        
        if (nextPageInfo.hasNext && pageNum < 10) {
          try {
            await page.evaluate(() => {
              const anchors = Array.from(document.querySelectorAll('a'));
              const next = anchors.find(a =>
                a.title && a.title.includes('다음') && a.textContent && a.textContent.trim() === '>'
              );
              if (next) {
                console.log('다음 페이지 클릭:', next.getAttribute('href'));
                (next as HTMLElement).click();
              }
            });
            pageNum++;
            await new Promise(resolve => setTimeout(resolve, 3000)); // 페이지 로딩 대기 시간 증가
          } catch (error) {
            console.log('다음 페이지 이동 실패:', error);
            hasNextPage = false;
          }
        } else {
          console.log('다음 페이지가 없거나 최대 페이지 수에 도달');
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