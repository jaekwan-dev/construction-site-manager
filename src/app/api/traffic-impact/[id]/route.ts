import { NextRequest, NextResponse } from 'next/server';
import { TrafficAssessmentDetail } from '@/lib/types';
import { trafficImpactCrawler } from '@/lib/utils/crawler';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: '프로젝트 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // 실제 크롤링 실행
    const detail = await trafficImpactCrawler.crawlTrafficAssessmentDetail(id);
    
    return NextResponse.json(detail);
  } catch (error) {
    console.error('교통영향평가 상세정보 API 오류:', error);
    
    // 크롤링 실패 시 예시 데이터 반환
    const { id } = await params;
    const mockDetail: TrafficAssessmentDetail = {
      id: id,
      projectName: '포천시 신북면 가채리 714번지 일원 가채2지구 지구단위계획 교통영향평가',
      year: '2028',
      company: '주식회사 세븐틴그룹',
      assessmentCompany: '주식회사 길우이앤지',
      approvalAuthority: '포천시교통과',
      location: '포천시 신북면 가채리',
      status: '진행중',
      projectType: '지구단위계획',
      reviewType: '신규',
      contractAmount: 1500000000,
      applicationDate: '2024-01-15',
      coordinates: { lat: 37.5665, lng: 126.9780 },
      
      // 상세 정보
      businessNumber: '123-45-67890',
      representative: '홍길동',
      address: '경기도 포천시 신북면 가채리 714번지',
      phone: '031-123-4567',
      
      businessType: '지구단위계획',
      businessScale: '대규모',
      businessArea: '150,000㎡',
      businessPeriod: {
        start: '2024-01-01',
        end: '2028-12-31'
      },
      
      assessmentPeriod: {
        start: '2024-01-15',
        end: '2024-06-30'
      },
      assessmentType: '정밀교통영향평가',
      assessmentScope: '사업구역 및 영향권역',
      trafficVolume: {
        before: 5000,
        after: 12000
      },
      
      reviewDate: '2024-07-15',
      reviewResult: '승인',
      reviewComments: '교통영향평가서 검토 결과 적절함',
      
      attachments: [
        {
          name: '교통영향평가서.pdf',
          url: '/files/assessment.pdf',
          type: '평가서'
        },
        {
          name: '교통영향평가도면.zip',
          url: '/files/drawings.zip',
          type: '도면'
        }
      ],
      
      mapData: {
        coordinates: { lat: 37.5665, lng: 126.9780 },
        address: '경기도 포천시 신북면 가채리 714번지',
        boundary: '사업구역 경계선 데이터'
      }
    };

    return NextResponse.json(mockDetail);
  }
} 