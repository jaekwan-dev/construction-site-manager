import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

interface CompanyContactInfo {
  companyName: string;
  representative?: string;
  address?: string;
  phone?: string;
  website?: string;
  found: boolean;
  foundCompanies: string[];
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyName = searchParams.get('name');

    if (!companyName) {
      return NextResponse.json(
        { error: '회사명이 필요합니다.' },
        { status: 400 }
      );
    }

    // 평가대행업체명에서 "주식회사"와 공백 제거
    const searchKeyword = companyName
      .replace(/주식회사/g, '')  // "주식회사" 제거
      .replace(/\s+/g, '')      // 모든 공백 제거
      .trim();                  // 앞뒤 공백 제거

    console.log(`원본 회사명: ${companyName}`);
    console.log(`검색 키워드: ${searchKeyword}`);

    // KATIA 사이트에서 회사 정보 크롤링
    const companyInfo = await crawlKATIACompanyInfo(searchKeyword, companyName);
    
    return NextResponse.json(companyInfo);
  } catch (error) {
    console.error('회사 정보 검색 오류:', error);
    return NextResponse.json(
      { error: '회사 정보를 검색하는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

async function crawlKATIACompanyInfo(searchKeyword: string, originalCompanyName: string): Promise<CompanyContactInfo> {
  let browser;
  
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    
    // KATIA 회원관리 페이지로 이동 (정제된 검색 키워드 사용)
    const searchUrl = `https://www.katia.or.kr/work/member_manage.php?code=member_manage&category=&Dosearch=company&search_order=${encodeURIComponent(searchKeyword)}`;
    
    console.log(`KATIA 검색 URL: ${searchUrl}`);
    
    await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // 검색 결과 테이블에서 회사 정보 찾기
    const companyData = await page.evaluate((targetCompanyName, originalName) => {
      const rows = document.querySelectorAll('table tr');
      console.log(`검색된 테이블 행 수: ${rows.length}`);
      console.log(`찾고 있는 회사명: ${originalName}`);
      console.log(`검색 키워드: ${targetCompanyName}`);
      
      // 테이블 구조 확인
      console.log('=== 테이블 구조 확인 ===');
      for (let i = 0; i < Math.min(rows.length, 5); i++) {
        const row = rows[i];
        const cells = row.querySelectorAll('td');
        console.log(`행 ${i}: 셀 개수 = ${cells.length}`);
        for (let j = 0; j < cells.length; j++) {
          console.log(`  셀 ${j}: "${cells[j].textContent?.trim()}"`);
        }
      }
      
      const foundCompanies = [];
      
      for (const row of rows) {
        const cells = row.querySelectorAll('td');
        if (cells.length >= 4) {
          const companyCell = cells[1];
          const companyLink = companyCell.querySelector('a');
          const companyText = companyCell.textContent?.trim();
          
          if (companyLink && companyText) {
            console.log(`발견된 회사: ${companyText}`);
            foundCompanies.push(companyText);
            
            // 원본 회사명과 정확히 일치하는 경우
            if (companyText === originalName) {
              console.log(`정확히 일치하는 회사 발견: ${companyText}`);
              
              // 회사명 클릭하여 상세정보 페이지로 이동
              const detailUrl = companyLink.getAttribute('onclick')?.match(/sendPage_\('v', '(\d+)', '(\d+)'\)/);
              if (detailUrl) {
                return {
                  companyName: companyText,
                  representative: cells[2]?.textContent?.trim(),
                  address: cells[3]?.textContent?.trim(),
                  phone: cells[4]?.textContent?.trim(),
                  detailId: detailUrl[1],
                  detailPage: detailUrl[2],
                  foundCompanies: foundCompanies
                };
              }
            }
          }
        }
      }
      
      // 정확히 일치하는 회사가 없으면 첫 번째 검색 결과 사용
      if (foundCompanies.length > 0) {
        console.log(`정확히 일치하는 회사가 없어서 첫 번째 결과 사용: ${foundCompanies[0]}`);
        
        // 첫 번째 회사의 상세정보 수집 (헤더 제외)
        for (let i = 1; i < rows.length; i++) {
          const row = rows[i];
          const cells = row.querySelectorAll('td');
          if (cells.length >= 4) {
            const companyCell = cells[1];
            const companyLink = companyCell.querySelector('a');
            const companyText = companyCell.textContent?.trim();
            
            if (companyLink && companyText) {
              console.log(`첫 번째 유효한 회사 발견: ${companyText}`);
              const detailUrl = companyLink.getAttribute('onclick')?.match(/sendPage_\('v', '(\d+)', '(\d+)'\)/);
              if (detailUrl) {
                return {
                  companyName: companyText,
                  representative: cells[2]?.textContent?.trim(),
                  address: cells[3]?.textContent?.trim(),
                  phone: cells[4]?.textContent?.trim(),
                  detailId: detailUrl[1],
                  detailPage: detailUrl[2],
                  foundCompanies: foundCompanies
                };
              }
            }
          }
        }
      }
      
      console.log('검색 결과가 없습니다.');
      return null;
    }, searchKeyword, originalCompanyName);

    if (companyData) {
      console.log(`회사 정보 찾음: ${companyData.companyName}`);
      
      // 상세정보 페이지로 이동하여 추가 정보 수집
      const detailUrl = `https://www.katia.or.kr/work/member_manage.php?code=member_manage&category=&Dosearch=company&search_order=${encodeURIComponent(searchKeyword)}&v=${companyData.detailId}&page=${companyData.detailPage}`;
      
      console.log(`상세정보 URL: ${detailUrl}`);
      
      await page.goto(detailUrl, { waitUntil: 'networkidle2', timeout: 30000 });
      
      const detailedInfo = await page.evaluate(() => {
        // 상세정보 페이지에서 추가 정보 추출
        const infoElements = document.querySelectorAll('table tr');
        let website = '';
        
        for (const row of infoElements) {
          const cells = row.querySelectorAll('td');
          if (cells.length >= 2) {
            const label = cells[0]?.textContent?.trim();
            const value = cells[1]?.textContent?.trim();
            
            if (label?.includes('홈페이지') || label?.includes('웹사이트')) {
              website = value || '';
            }
          }
        }
        
        return { website };
      });

      return {
        companyName: companyData.companyName,
        representative: companyData.representative,
        address: companyData.address,
        phone: companyData.phone,
        website: detailedInfo.website,
        found: true,
        foundCompanies: companyData.foundCompanies
      };
    } else {
      console.log('회사 정보를 찾지 못했습니다.');
      // 정보를 찾지 못한 경우
      return {
        companyName: originalCompanyName,
        found: false,
        website: `https://www.katia.or.kr/work/member_manage.php?code=member_manage&category=&Dosearch=company&search_order=${encodeURIComponent(searchKeyword)}`,
        foundCompanies: []
      };
    }
  } catch (error) {
    console.error('KATIA 크롤링 오류:', error);
    
    // 크롤링 실패 시 기본 정보 반환
    return {
      companyName: originalCompanyName,
      found: false,
      website: `https://www.katia.or.kr/work/member_manage.php?code=member_manage&category=&Dosearch=company&search_order=${encodeURIComponent(searchKeyword)}`,
      foundCompanies: []
    };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
} 