import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

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

// 임시 메모리 저장소 (데이터베이스 연결 실패 시 사용)
let tempAssessments: TrafficAssessmentInfo[] = [];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    
    // 데이터베이스 연결 시도
    let existingAssessments: TrafficAssessmentInfo[] = [];
    let dbConnected = false;
    
    try {
      const { db } = await import('@/lib/db');
      const { trafficAssessments } = await import('@/lib/db/schema');
      existingAssessments = await db.select().from(trafficAssessments);
      dbConnected = true;
    } catch (dbError) {
      console.log('데이터베이스 연결 실패, 임시 저장소 사용:', dbError);
      existingAssessments = tempAssessments;
    }
    
    if (action === 'crawl' || existingAssessments.length === 0) {
      // 크롤링이 요청되었거나 데이터가 없는 경우 크롤링 실행
      console.log('교통영향평가 자료 크롤링 시작');
      
      let browser;
      
      try {
        browser = await puppeteer.launch({
          headless: true,
          args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();
        const allAssessments: TrafficAssessmentInfo[] = [];
        
        // 검색 조건 설정
        const startDate = '2025-01-01'; // 2024년부터로 확장
        const endDate = new Date().toISOString().split('T')[0]; // 오늘까지
        
        console.log(`검색 기간: ${startDate} ~ ${endDate}`);
        
        // 교통영향평가정보지원시스템 접속
        await page.goto('https://tia.molit.go.kr/search/businessSrchList.do', { 
          waitUntil: 'networkidle2', 
          timeout: 30000 
        });
        
        // 페이지 로딩 대기
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // 검색 조건 설정
        await page.evaluate((startDate, endDate) => {
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
        }, startDate, endDate);
        
        // 검색 버튼 클릭
        await page.click('input[type="button"][value="검색"]');
        
        // 검색 결과 로딩 대기
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // 모든 페이지 크롤링
        let pageNum = 1;
        let hasNextPage = true;
        
        while (hasNextPage && pageNum <= 10) { // 최대 10페이지까지만 크롤링
          console.log(`페이지 ${pageNum} 크롤링 중...`);
          
          // 페이지 로딩 대기
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // 테이블에서 교통영향평가 정보 추출
          const pageAssessments = await page.evaluate(() => {
            const assessments: TrafficAssessmentInfo[] = [];
            
            // 사업목록 테이블 찾기
            const rows = document.querySelectorAll('table tr');
            
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
                }
              }
            });
            
            return assessments;
          });
          
          allAssessments.push(...pageAssessments);
          console.log(`페이지 ${pageNum}: ${pageAssessments.length}개 교통영향평가 정보 수집`);
          
          // 다음 페이지 확인 및 클릭
          const nextPageExists = await page.evaluate(() => {
            const anchors = Array.from(document.querySelectorAll('a'));
            return anchors.some(a =>
              a.title && a.title.includes('다음') && a.textContent && a.textContent.trim() === '>'
            );
          });
          
          if (nextPageExists && pageNum < 10) {
            try {
              await page.evaluate(() => {
                const anchors = Array.from(document.querySelectorAll('a'));
                const next = anchors.find(a =>
                  a.title && a.title.includes('다음') && a.textContent && a.textContent.trim() === '>'
                );
                if (next) (next as HTMLElement).click();
              });
              pageNum++;
              await new Promise(resolve => setTimeout(resolve, 2000));
            } catch {
              console.log('다음 페이지 이동 실패, 크롤링 종료');
              hasNextPage = false;
            }
          } else {
            hasNextPage = false;
          }
        }
        
        await browser.close();
        
        // 데이터베이스에 저장
        if (dbConnected && allAssessments.length > 0) {
          try {
            const { db } = await import('@/lib/db');
            const { trafficAssessments } = await import('@/lib/db/schema');
            
            // 기존 데이터 삭제 후 새 데이터 저장
            if (existingAssessments.length > 0) {
              await db.delete(trafficAssessments);
              console.log('기존 교통영향평가 데이터 삭제 완료');
            }
            
            // 새 데이터 저장
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
            
            console.log(`${allAssessments.length}개 교통영향평가 데이터 저장 완료`);
          } catch (dbError) {
            console.log('데이터베이스 저장 실패, 임시 저장소에 저장:', dbError);
            tempAssessments = allAssessments;
          }
        } else if (!dbConnected) {
          tempAssessments = allAssessments;
        }
        
        return NextResponse.json({
          success: true,
          assessments: allAssessments,
          totalCount: allAssessments.length,
          isNewData: true,
          dbConnected,
          searchPeriod: `${startDate} ~ ${endDate}`
        });
        
      } catch (error) {
        console.error('크롤링 오류:', error);
        if (browser) await browser.close();
        
        return NextResponse.json({
          success: false,
          error: error instanceof Error ? error.message : '교통영향평가 크롤링 실패'
        });
      }
    } else {
      // 기존 데이터 반환
      return NextResponse.json({
        success: true,
        assessments: existingAssessments,
        totalCount: existingAssessments.length,
        isNewData: false,
        dbConnected
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

// 데이터베이스 통계 정보 조회
export async function POST() {
  try {
    const { db } = await import('@/lib/db');
    
    // 전체 개수
    const totalResult = await db.execute('SELECT COUNT(*) as total FROM traffic_assessments');
    const total = parseInt(totalResult.rows[0]?.total || '0');

    // 연도별 개수
    const yearStatsResult = await db.execute(`
      SELECT year, COUNT(*) as count 
      FROM traffic_assessments 
      GROUP BY year 
      ORDER BY year DESC
    `);

    // 상태별 개수
    const statusStatsResult = await db.execute(`
      SELECT status, COUNT(*) as count 
      FROM traffic_assessments 
      GROUP BY status 
      ORDER BY count DESC
    `);

    // 최근 업데이트 시간
    const latestResult = await db.execute(`
      SELECT MAX(created_at) as latest_update 
      FROM traffic_assessments
    `);

    return NextResponse.json({
      total,
      yearStats: yearStatsResult.rows,
      statusStats: statusStatsResult.rows,
      latestUpdate: latestResult.rows[0]?.latest_update
    });
  } catch (error) {
    console.error('통계 조회 오류:', error);
    return NextResponse.json(
      { error: '통계 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 