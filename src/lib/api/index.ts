import { 
  ConstructionSite, 
  CompanyInfo, 
  SafetyInfo, 
  ConstructionInfo, 
  RegionalInfo,
  ApiResponse,
  ApiStatus,
  SearchFilters,
  Pagination,
  TrafficAssessmentFilters,
  TrafficAssessmentSearchResult,
  TrafficAssessmentStats,
  TrafficAssessmentDetail
} from '../types';

// API 기본 설정
const API_CONFIG = {
  BASE_URL: 'https://api.data.go.kr',
  TIMEOUT: 10000,
  RETRY_COUNT: 3
};

// API 키 관리
class ApiKeyManager {
  private keys: Record<string, string> = {};

  setKey(service: string, key: string): void {
    this.keys[service] = key;
  }

  getKey(service: string): string | null {
    return this.keys[service] || null;
  }

  hasKey(service: string): boolean {
    return Boolean(this.keys[service]);
  }

  getAllKeys(): Record<string, string> {
    return { ...this.keys };
  }
}

// 기본 API 클라이언트
class ApiClient {
  private baseUrl: string;
  private timeout: number;
  private retryCount: number;

  constructor(baseUrl: string = API_CONFIG.BASE_URL, timeout: number = API_CONFIG.TIMEOUT, retryCount: number = API_CONFIG.RETRY_COUNT) {
    this.baseUrl = baseUrl;
    this.timeout = timeout;
    this.retryCount = retryCount;
  }

  private async request<T>(
    endpoint: string, 
    params: Record<string, string> = {},
    retryAttempt: number = 0
  ): Promise<ApiResponse<T>> {
    try {
      const url = new URL(endpoint, this.baseUrl);
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url.toString(), {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      if (retryAttempt < this.retryCount) {
        console.warn(`API 요청 실패, 재시도 중... (${retryAttempt + 1}/${this.retryCount})`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryAttempt + 1)));
        return this.request<T>(endpoint, params, retryAttempt + 1);
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
      };
    }
  }

  protected async get<T>(endpoint: string, params: Record<string, string> = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, params);
  }
}

// 건축현장 관리 API 서비스
export class ConstructionSiteApi extends ApiClient {
  private apiKeyManager: ApiKeyManager;

  constructor() {
    super();
    this.apiKeyManager = new ApiKeyManager();
    
    // 환경 변수에서 API 키 로드
    this.loadApiKeysFromEnv();
  }

  // 환경 변수에서 API 키 로드
  private loadApiKeysFromEnv(): void {
    if (typeof window !== 'undefined') {
      // 클라이언트 사이드에서 환경 변수 읽기
      const newtownKey = process.env.NEXT_PUBLIC_NEWTOWN_API_KEY;
      const kisconKey = process.env.NEXT_PUBLIC_KISCON_API_KEY;
      const safetyKey = process.env.NEXT_PUBLIC_SAFETY_API_KEY;
      const constructionKey = process.env.NEXT_PUBLIC_CONSTRUCTION_API_KEY;
      const regionalKey = process.env.NEXT_PUBLIC_REGIONAL_API_KEY;

      if (newtownKey) this.apiKeyManager.setKey('newtown', newtownKey);
      if (kisconKey) this.apiKeyManager.setKey('kiscon', kisconKey);
      if (safetyKey) this.apiKeyManager.setKey('safety', safetyKey);
      if (constructionKey) this.apiKeyManager.setKey('construction', constructionKey);
      if (regionalKey) this.apiKeyManager.setKey('regional', regionalKey);
    }
  }

  // API 키 설정
  setApiKey(service: string, key: string): void {
    this.apiKeyManager.setKey(service, key);
  }

  // API 상태 확인
  async checkApiStatus(): Promise<ApiStatus> {
    const status: ApiStatus = {
      kiscon: 'failed',
      safety: 'failed',
      construction: 'failed',
      regional: 'failed'
    };

    // 각 API 서비스별 상태 확인
    if (this.apiKeyManager.hasKey('kiscon')) {
      try {
        const response = await this.getCompanyInfo('test');
        status.kiscon = response.success ? 'connected' : 'failed';
      } catch {
        status.kiscon = 'failed';
      }
    } else {
      status.kiscon = 'mock';
    }

    if (this.apiKeyManager.hasKey('safety')) {
      try {
        const response = await this.getSafetyInfo('test');
        status.safety = response.success ? 'connected' : 'failed';
      } catch {
        status.safety = 'failed';
      }
    } else {
      status.safety = 'mock';
    }

    if (this.apiKeyManager.hasKey('construction')) {
      try {
        const response = await this.getConstructionInfo('test');
        status.construction = response.success ? 'connected' : 'failed';
      } catch {
        status.construction = 'failed';
      }
    } else {
      status.construction = 'mock';
    }

    if (this.apiKeyManager.hasKey('regional')) {
      try {
        const response = await this.getRegionalInfo('test');
        status.regional = response.success ? 'connected' : 'failed';
      } catch {
        status.regional = 'failed';
      }
    } else {
      status.regional = 'mock';
    }

    return status;
  }

  // 신도시 현장 검색
  async searchNewtownSites(filters: SearchFilters, pagination: Pagination): Promise<ApiResponse<{ sites: ConstructionSite[], pagination: Pagination }>> {
    const apiKey = this.apiKeyManager.getKey('newtown');
    
    if (!apiKey) {
      // 모의 데이터 반환
      return {
        success: true,
        data: {
          sites: this.getMockConstructionSites(),
          pagination: {
            ...pagination,
            total: 100,
            totalPages: Math.ceil(100 / pagination.limit)
          }
        }
      };
    }

    // 실제 API 호출
    const params: Record<string, string> = {
      serviceKey: apiKey,
      pageNo: pagination.page.toString(),
      numOfRows: pagination.limit.toString(),
    };

    // 필터 파라미터 추가 (문자열로 변환)
    if (filters.location) params.location = filters.location;
    if (filters.status) params.status = filters.status;
    if (filters.completionDateFrom) params.completionDateFrom = filters.completionDateFrom;
    if (filters.completionDateTo) params.completionDateTo = filters.completionDateTo;
    if (filters.contractAmountMin) params.contractAmountMin = filters.contractAmountMin.toString();
    if (filters.contractAmountMax) params.contractAmountMax = filters.contractAmountMax.toString();
    if (filters.company) params.company = filters.company;

    return this.get<{ sites: ConstructionSite[], pagination: Pagination }>('/openapi/newtown-sites', params);
  }

  // KISCON 건설회사 정보 조회
  async getCompanyInfo(companyId: string): Promise<ApiResponse<CompanyInfo>> {
    const apiKey = this.apiKeyManager.getKey('kiscon');
    
    if (!apiKey) {
      return {
        success: true,
        data: this.getMockCompanyInfo(companyId)
      };
    }

    const params = {
      serviceKey: apiKey,
      companyId
    };

    return this.get<CompanyInfo>('/openapi/kiscon/company', params);
  }

  // 생활안전지도 API - 안전정보 조회
  async getSafetyInfo(siteId: string): Promise<ApiResponse<SafetyInfo>> {
    const apiKey = this.apiKeyManager.getKey('safety');
    
    if (!apiKey) {
      return {
        success: true,
        data: this.getMockSafetyInfo(siteId)
      };
    }

    const params = {
      serviceKey: apiKey,
      siteId
    };

    return this.get<SafetyInfo>('/openapi/safety/info', params);
  }

  // 건설사업정보시스템 API - 건설정보 조회
  async getConstructionInfo(siteId: string): Promise<ApiResponse<ConstructionInfo>> {
    const apiKey = this.apiKeyManager.getKey('construction');
    
    if (!apiKey) {
      return {
        success: true,
        data: this.getMockConstructionInfo(siteId)
      };
    }

    const params = {
      serviceKey: apiKey,
      siteId
    };

    return this.get<ConstructionInfo>('/openapi/construction/info', params);
  }

  // 지역별 건설현장 API - 지역정보 조회
  async getRegionalInfo(siteId: string): Promise<ApiResponse<RegionalInfo>> {
    const apiKey = this.apiKeyManager.getKey('regional');
    
    if (!apiKey) {
      return {
        success: true,
        data: this.getMockRegionalInfo(siteId)
      };
    }

    const params = {
      serviceKey: apiKey,
      siteId
    };

    return this.get<RegionalInfo>('/openapi/regional/info', params);
  }

  // 모의 데이터 생성 메서드들
  private getMockConstructionSites(): ConstructionSite[] {
    return [
      {
        id: '1',
        name: '판교신도시 1단계 아파트',
        location: '경기도 성남시 분당구',
        company: '삼성물산',
        status: 'construction',
        completionDate: '2024-12-31',
        contractAmount: 150000000000,
        progress: 65,
        contactInfo: {
          siteManager: {
            name: '김현장',
            phone: '010-1234-5678',
            email: 'kim@samsumg.com'
          },
          projectManager: {
            name: '이과장',
            phone: '010-2345-6789',
            email: 'lee@samsung.com'
          },
          office: {
            address: '경기도 성남시 분당구 판교로 123',
            phone: '031-123-4567',
            email: 'office@samsung.com'
          }
        },
        coordinates: {
          lat: 37.4011,
          lng: 127.1086
        },
        createdAt: '2024-01-01',
        updatedAt: '2024-06-19'
      },
      {
        id: '2',
        name: '광교신도시 상업시설',
        location: '경기도 수원시 영통구',
        company: '현대건설',
        status: 'planning',
        completionDate: '2025-06-30',
        contractAmount: 80000000000,
        progress: 15,
        contactInfo: {
          siteManager: {
            name: '박사장',
            phone: '010-3456-7890',
            email: 'park@hyundai.com'
          },
          projectManager: {
            name: '최대리',
            phone: '010-4567-8901',
            email: 'choi@hyundai.com'
          },
          office: {
            address: '경기도 수원시 영통구 광교로 456',
            phone: '031-234-5678',
            email: 'office@hyundai.com'
          }
        },
        coordinates: {
          lat: 37.3011,
          lng: 127.0086
        },
        createdAt: '2024-02-01',
        updatedAt: '2024-06-19'
      }
    ];
  }

  private getMockCompanyInfo(companyId: string): CompanyInfo {
    return {
      companyId,
      name: '삼성물산',
      businessNumber: '124-81-00998',
      representative: '정재인',
      address: '서울특별시 서초구 서초대로 74길 4',
      registrationType: '종합건설업',
      registrationNumber: '건설-001234',
      registrationDate: '1988-01-01',
      validUntil: '2028-12-31',
      constructionHistory: [
        {
          projectName: '롯데월드타워',
          client: '롯데건설',
          contractAmount: 500000000000,
          startDate: '2010-01-01',
          endDate: '2016-12-31',
          status: '완료'
        }
      ]
    };
  }

  private getMockSafetyInfo(siteId: string): SafetyInfo {
    return {
      siteId,
      hazardousFacilities: [
        {
          type: 'gas_pipeline',
          name: '도시가스 배관',
          distance: 150,
          coordinates: { lat: 37.4011, lng: 127.1086 },
          riskLevel: 'medium'
        }
      ],
      emergencyContacts: [
        {
          type: 'police',
          name: '분당경찰서',
          phone: '031-123-4567',
          address: '경기도 성남시 분당구',
          distance: 2000
        }
      ],
      accessRoutes: [
        {
          type: 'road',
          description: '판교로 → 현장 진입로',
          distance: 500,
          estimatedTime: 5
        }
      ]
    };
  }

  private getMockConstructionInfo(siteId: string): ConstructionInfo {
    return {
      siteId,
      designDocuments: [
        {
          type: 'drawing',
          format: 'PDF',
          name: '기본설계도면.pdf',
          url: '/documents/design.pdf',
          uploadDate: '2024-01-15'
        }
      ],
      supervisionReports: [
        {
          reportType: 'progress',
          title: '2024년 6월 공정관리보고서',
          content: '전체 공정률 65% 달성',
          reportDate: '2024-06-15',
          inspector: '김감리'
        }
      ],
      maintenanceHistory: [
        {
          date: '2024-05-20',
          type: 'inspection',
          description: '정기 안전점검',
          cost: 500000,
          contractor: '안전관리전문업체'
        }
      ]
    };
  }

  private getMockRegionalInfo(siteId: string): RegionalInfo {
    return {
      siteId,
      progressRate: 65,
      environmentalData: {
        noise: { level: 65, unit: 'dB', measurementDate: '2024-06-18' },
        vibration: { level: 0.5, unit: 'cm/s', measurementDate: '2024-06-18' },
        dust: { level: 80, unit: 'μg/m³', measurementDate: '2024-06-18' }
      },
      trafficControl: {
        plan: '부분 차선 통제',
        startDate: '2024-06-01',
        endDate: '2024-12-31',
        affectedRoutes: ['판교로 2차선'],
        alternativeRoutes: ['판교로 1차선', '우회도로']
      },
      localStatistics: {
        totalSites: 25,
        activeSites: 18,
        completedSites: 7,
        totalContractAmount: 2500000000000,
        averageProgress: 58
      }
    };
  }

  // 교통영향평가 데이터 크롤링
  async crawlTrafficImpactAssessments(filters: TrafficAssessmentFilters = {}, page: number = 1): Promise<TrafficAssessmentSearchResult> {
    try {
      // 교통영향평가정보지원시스템에서 데이터 크롤링
      const response = await fetch('/api/traffic-impact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filters,
          page,
          pageSize: 20
        })
      });

      if (!response.ok) {
        throw new Error(`교통영향평가 데이터 조회 실패: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('교통영향평가 데이터 크롤링 오류:', error);
      throw new Error('교통영향평가 데이터를 가져오는 중 오류가 발생했습니다.');
    }
  }

  // 교통영향평가 상세정보 조회
  async getTrafficAssessmentDetail(id: string): Promise<TrafficAssessmentDetail> {
    try {
      const response = await fetch(`/api/traffic-impact/${id}`);
      
      if (!response.ok) {
        throw new Error(`교통영향평가 상세정보 조회 실패: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('교통영향평가 상세정보 조회 오류:', error);
      throw new Error('교통영향평가 상세정보를 가져오는 중 오류가 발생했습니다.');
    }
  }

  // 교통영향평가 통계 데이터 조회
  async getTrafficAssessmentStats(): Promise<TrafficAssessmentStats> {
    try {
      const response = await fetch('/api/traffic-impact/stats');
      
      if (!response.ok) {
        throw new Error(`교통영향평가 통계 조회 실패: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('교통영향평가 통계 조회 오류:', error);
      throw new Error('교통영향평가 통계를 가져오는 중 오류가 발생했습니다.');
    }
  }
}

// 싱글톤 인스턴스 생성
export const constructionSiteApi = new ConstructionSiteApi(); 