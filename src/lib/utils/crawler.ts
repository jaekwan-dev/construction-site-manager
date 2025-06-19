import * as puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';
import { TrafficImpactAssessment, TrafficAssessmentDetail, TrafficAssessmentFilters } from '../types';

export class TrafficImpactCrawler {
  private browser: puppeteer.Browser | null = null;

  async init() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
    }
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  async crawlTrafficImpactData(filters: TrafficAssessmentFilters = {}, maxPages: number = 10): Promise<TrafficImpactAssessment[]> {
    await this.init();
    
    if (!this.browser) {
      throw new Error('브라우저 초기화 실패');
    }

    const browserPage = await this.browser.newPage();
    const allResults: TrafficImpactAssessment[] = [];
    
    try {
      // 교통영향평가정보지원시스템 접속
      await browserPage.goto('https://tia.molit.go.kr/search/businessSrchList.do', {
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      // 검색 필터 적용
      if (filters.projectName) {
        // 사업명 검색 필드에 값 입력
        await browserPage.waitForSelector('input[name="bizNm"]', { timeout: 5000 });
        await browserPage.type('input[name="bizNm"]', filters.projectName);
      }

      if (filters.company) {
        // 사업자 검색 필드에 값 입력
        await browserPage.waitForSelector('input[name="bizOwnerNm"]', { timeout: 5000 });
        await browserPage.type('input[name="bizOwnerNm"]', filters.company);
      }

      if (filters.location) {
        // 위치 검색 필드에 값 입력
        await browserPage.waitForSelector('input[name="bizAddr"]', { timeout: 5000 });
        await browserPage.type('input[name="bizAddr"]', filters.location);
      }

      if (filters.status) {
        // 진행상태 선택
        await browserPage.waitForSelector('select[name="bizSttusCd"]', { timeout: 5000 });
        await browserPage.select('select[name="bizSttusCd"]', filters.status);
      }

      if (filters.projectType && filters.projectType !== 'all') {
        // 사업유형 선택
        await browserPage.waitForSelector('select[name="bizTypeCd"]', { timeout: 5000 });
        await browserPage.select('select[name="bizTypeCd"]', filters.projectType);
      }

      if (filters.approvalAuthority && filters.approvalAuthority !== 'all') {
        // 승인관청 선택
        await browserPage.waitForSelector('select[name="aprvAuthCd"]', { timeout: 5000 });
        await browserPage.select('select[name="aprvAuthCd"]', filters.approvalAuthority);
      }

      // 검색 버튼 클릭
      await browserPage.waitForSelector('input[type="submit"], button[type="submit"]', { timeout: 5000 });
      await browserPage.click('input[type="submit"], button[type="submit"]');

      // 검색 결과 로딩 대기
      await new Promise(resolve => setTimeout(resolve, 3000));

      // 여러 페이지 크롤링
      for (let currentPage = 1; currentPage <= maxPages; currentPage++) {
        console.log(`페이지 ${currentPage} 크롤링 중...`);
        
        // 페이지 내용 가져오기
        const content = await browserPage.content();
        const $ = cheerio.load(content);

        // 현재 페이지의 데이터 추출
        const pageResults: TrafficImpactAssessment[] = [];
        let hasData = false;

        // 테이블에서 데이터 추출
        $('table tr').each((index, element) => {
          if (index === 0) return; // 헤더 행 스킵

          const cells = $(element).find('td');
          if (cells.length >= 8) {
            const projectName = $(cells[0]).text().trim();
            const year = $(cells[1]).text().trim();
            const company = $(cells[2]).text().trim();
            const assessmentCompany = $(cells[3]).text().trim();
            const approvalAuthority = $(cells[4]).text().trim();
            const location = $(cells[5]).text().trim();
            const status = $(cells[6]).text().trim();

            // 프로젝트 ID 추출 (링크에서)
            const projectLink = $(cells[0]).find('a').attr('href');
            const projectId = projectLink ? this.extractProjectId(projectLink) : `project_${currentPage}_${index}`;

            if (projectName) {
              hasData = true;
              pageResults.push({
                id: projectId,
                projectName,
                year,
                company,
                assessmentCompany,
                approvalAuthority,
                location,
                status: this.normalizeStatus(status),
                projectType: this.extractProjectType(projectName),
                reviewType: this.extractReviewType(projectName),
                contractAmount: undefined, // 실제 사이트에서 계약금액 정보 확인 필요
                applicationDate: undefined,
                completionDate: undefined
              });
            }
          }
        });

        // 현재 페이지 데이터를 전체 결과에 추가
        allResults.push(...pageResults);
        console.log(`페이지 ${currentPage}: ${pageResults.length}개 항목 수집`);

        // 데이터가 없으면 더 이상 페이지가 없음
        if (!hasData) {
          console.log(`페이지 ${currentPage}에 데이터가 없어 크롤링 종료`);
          break;
        }

        // 다음 페이지로 이동 (마지막 페이지가 아니면)
        if (currentPage < maxPages) {
          try {
            // 다음 페이지 버튼 찾기 및 클릭
            const nextPageSelector = `a[href*="page=${currentPage + 1}"], a:contains("다음"), a:contains(">")`;
            const nextPageButton = await browserPage.$(nextPageSelector);
            
            if (nextPageButton) {
              await nextPageButton.click();
              // 페이지 로딩 대기
              await new Promise(resolve => setTimeout(resolve, 2000));
            } else {
              // 다음 페이지 버튼이 없으면 종료
              console.log(`다음 페이지 버튼을 찾을 수 없어 크롤링 종료`);
              break;
            }
          } catch (error) {
            console.log(`페이지 ${currentPage + 1}로 이동 실패:`, error);
            break;
          }
        }
      }

      console.log(`총 ${allResults.length}개 항목 수집 완료`);
      return allResults;
    } catch (error) {
      console.error('크롤링 오류:', error);
      throw new Error('교통영향평가 데이터 크롤링 중 오류가 발생했습니다.');
    } finally {
      await browserPage.close();
    }
  }

  // 상세 정보 크롤링
  async crawlTrafficAssessmentDetail(projectId: string): Promise<TrafficAssessmentDetail> {
    await this.init();
    
    if (!this.browser) {
      throw new Error('브라우저 초기화 실패');
    }

    const browserPage = await this.browser.newPage();
    
    try {
      // 상세 페이지 URL 구성 (실제 사이트 구조에 따라 조정 필요)
      const detailUrl = `https://tia.molit.go.kr/search/businessSrchView.do?bizId=${projectId}`;
      
      await browserPage.goto(detailUrl, {
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      // 페이지 내용 가져오기
      const content = await browserPage.content();
      const $ = cheerio.load(content);

      // 기본 정보 추출
      const basicInfo = this.extractBasicInfo($);
      
      // 사업 정보 추출
      const businessInfo = this.extractBusinessInfo($);
      
      // 교통영향평가 정보 추출
      const assessmentInfo = this.extractAssessmentInfo($);
      
      // 심의 정보 추출
      const reviewInfo = this.extractReviewInfo($);
      
      // 첨부파일 정보 추출
      const attachments = this.extractAttachments($);
      
      // 지도 정보 추출
      const mapData = this.extractMapData($);

      return {
        id: projectId,
        projectName: basicInfo.projectName || '',
        year: basicInfo.year || '',
        company: basicInfo.company || '',
        assessmentCompany: basicInfo.assessmentCompany || '',
        approvalAuthority: basicInfo.approvalAuthority || '',
        location: basicInfo.location || '',
        status: this.normalizeStatus(basicInfo.status || '진행중'),
        projectType: basicInfo.projectType || '',
        reviewType: basicInfo.reviewType || '',
        ...businessInfo,
        ...assessmentInfo,
        ...reviewInfo,
        attachments,
        mapData
      };
    } catch (error) {
      console.error('상세 정보 크롤링 오류:', error);
      throw new Error('교통영향평가 상세 정보 크롤링 중 오류가 발생했습니다.');
    } finally {
      await browserPage.close();
    }
  }

  private extractBasicInfo($: cheerio.CheerioAPI) {
    return {
      projectName: $('.project-name').text().trim(),
      year: $('.project-year').text().trim(),
      company: $('.company-name').text().trim(),
      assessmentCompany: $('.assessment-company').text().trim(),
      approvalAuthority: $('.approval-authority').text().trim(),
      location: $('.project-location').text().trim(),
      status: $('.project-status').text().trim(),
      projectType: $('.project-type').text().trim(),
      reviewType: $('.review-type').text().trim(),
      businessNumber: $('.business-number').text().trim(),
      representative: $('.representative').text().trim(),
      address: $('.address').text().trim(),
      phone: $('.phone').text().trim()
    };
  }

  private extractBusinessInfo($: cheerio.CheerioAPI) {
    return {
      businessType: $('.business-type').text().trim(),
      businessScale: $('.business-scale').text().trim(),
      businessArea: $('.business-area').text().trim(),
      businessPeriod: {
        start: $('.business-period-start').text().trim(),
        end: $('.business-period-end').text().trim()
      }
    };
  }

  private extractAssessmentInfo($: cheerio.CheerioAPI) {
    return {
      assessmentPeriod: {
        start: $('.assessment-period-start').text().trim(),
        end: $('.assessment-period-end').text().trim()
      },
      assessmentType: $('.assessment-type').text().trim(),
      assessmentScope: $('.assessment-scope').text().trim(),
      trafficVolume: {
        before: parseInt($('.traffic-volume-before').text().trim()) || 0,
        after: parseInt($('.traffic-volume-after').text().trim()) || 0
      }
    };
  }

  private extractReviewInfo($: cheerio.CheerioAPI) {
    return {
      reviewDate: $('.review-date').text().trim(),
      reviewResult: $('.review-result').text().trim(),
      reviewComments: $('.review-comments').text().trim()
    };
  }

  private extractAttachments($: cheerio.CheerioAPI) {
    const attachments: { name: string; url: string; type: string }[] = [];
    
    $('.attachment-item').each((index, element) => {
      const name = $(element).find('.attachment-name').text().trim();
      const url = $(element).find('a').attr('href') || '';
      const type = $(element).find('.attachment-type').text().trim();
      
      if (name && url) {
        attachments.push({ name, url, type });
      }
    });
    
    return attachments;
  }

  private extractMapData($: cheerio.CheerioAPI) {
    // 지도 데이터 추출 (실제 사이트 구조에 따라 조정 필요)
    const mapScript = $('script:contains("map")').html() || '';
    const latMatch = mapScript.match(/lat["\s]*:["\s]*([0-9.]+)/);
    const lngMatch = mapScript.match(/lng["\s]*:["\s]*([0-9.]+)/);
    
    return {
      coordinates: {
        lat: latMatch ? parseFloat(latMatch[1]) : 37.5665,
        lng: lngMatch ? parseFloat(lngMatch[1]) : 126.9780
      },
      address: $('.map-address').text().trim() || '',
      boundary: $('.map-boundary').text().trim()
    };
  }

  private extractProjectId(link: string): string {
    // 링크에서 프로젝트 ID 추출
    const match = link.match(/fn_view\('([^']+)'\)/);
    return match ? match[1] : `project_${Date.now()}`;
  }

  private normalizeStatus(status: string): '진행중' | '완료' | '계획' {
    if (status.includes('완료')) return '완료';
    if (status.includes('계획')) return '계획';
    return '진행중';
  }

  private extractProjectType(projectName: string): string {
    if (projectName.includes('공동주택')) return '공동주택';
    if (projectName.includes('지구단위계획')) return '지구단위계획';
    if (projectName.includes('도시개발')) return '도시개발';
    if (projectName.includes('물류창고')) return '물류창고';
    if (projectName.includes('주상복합')) return '주상복합';
    return '기타';
  }

  private extractReviewType(projectName: string): string {
    if (projectName.includes('약식')) return '약식신규';
    if (projectName.includes('변경심의')) return '변경심의';
    if (projectName.includes('변경신고')) return '변경신고';
    return '신규';
  }
}

// 싱글톤 인스턴스
export const trafficImpactCrawler = new TrafficImpactCrawler(); 