// 건축현장 관리도구 기본 타입 정의

// 건설현장 기본 정보
export interface ConstructionSite {
  id: string;
  name: string;
  location: string;
  company: string;
  status: 'planning' | 'construction' | 'completed' | 'maintenance';
  completionDate: string;
  contractAmount: number;
  progress: number;
  contactInfo: ContactInfo;
  coordinates?: {
    lat: number;
    lng: number;
  };
  createdAt: string;
  updatedAt: string;
}

// 연락처 정보
export interface ContactInfo {
  siteManager: {
    name: string;
    phone: string;
    email: string;
  };
  projectManager: {
    name: string;
    phone: string;
    email: string;
  };
  office: {
    address: string;
    phone: string;
    email: string;
  };
}

// 건설회사 정보 (KISCON API)
export interface CompanyInfo {
  companyId: string;
  name: string;
  businessNumber: string;
  representative: string;
  address: string;
  registrationType: string;
  registrationNumber: string;
  registrationDate: string;
  validUntil: string;
  constructionHistory: ConstructionHistory[];
}

// 건설실적 정보
export interface ConstructionHistory {
  projectName: string;
  client: string;
  contractAmount: number;
  startDate: string;
  endDate: string;
  status: string;
}

// 안전정보 (생활안전지도 API)
export interface SafetyInfo {
  siteId: string;
  hazardousFacilities: HazardousFacility[];
  emergencyContacts: EmergencyContact[];
  accessRoutes: AccessRoute[];
}

// 위험시설물 정보
export interface HazardousFacility {
  type: 'gas_pipeline' | 'police_line' | 'electric_line' | 'other';
  name: string;
  distance: number;
  coordinates: {
    lat: number;
    lng: number;
  };
  riskLevel: 'low' | 'medium' | 'high';
}

// 긴급연락처
export interface EmergencyContact {
  type: 'police' | 'fire' | 'hospital' | 'gas_company';
  name: string;
  phone: string;
  address: string;
  distance: number;
}

// 접근경로
export interface AccessRoute {
  type: 'road' | 'emergency';
  description: string;
  distance: number;
  estimatedTime: number;
}

// 건설정보 (건설사업정보시스템 API)
export interface ConstructionInfo {
  siteId: string;
  designDocuments: DesignDocument[];
  supervisionReports: SupervisionReport[];
  maintenanceHistory: MaintenanceRecord[];
}

// 설계도서
export interface DesignDocument {
  type: 'drawing' | 'section' | 'detail';
  format: 'DWG' | 'PDF' | 'other';
  name: string;
  url: string;
  uploadDate: string;
}

// 감리보고서
export interface SupervisionReport {
  reportType: 'progress' | 'material' | 'quality' | 'safety';
  title: string;
  content: string;
  reportDate: string;
  inspector: string;
}

// 유지보수 기록
export interface MaintenanceRecord {
  date: string;
  type: 'repair' | 'inspection' | 'replacement';
  description: string;
  cost: number;
  contractor: string;
}

// 지역정보 (지역별 건설현장 API)
export interface RegionalInfo {
  siteId: string;
  progressRate: number;
  environmentalData: EnvironmentalData;
  trafficControl: TrafficControlInfo;
  localStatistics: LocalStatistics;
}

// 환경측정 데이터
export interface EnvironmentalData {
  noise: {
    level: number;
    unit: string;
    measurementDate: string;
  };
  vibration: {
    level: number;
    unit: string;
    measurementDate: string;
  };
  dust: {
    level: number;
    unit: string;
    measurementDate: string;
  };
}

// 교통통제 정보
export interface TrafficControlInfo {
  plan: string;
  startDate: string;
  endDate: string;
  affectedRoutes: string[];
  alternativeRoutes: string[];
}

// 지역 통계
export interface LocalStatistics {
  totalSites: number;
  activeSites: number;
  completedSites: number;
  totalContractAmount: number;
  averageProgress: number;
}

// 검색 필터
export interface SearchFilters {
  location?: string;
  status?: ConstructionSite['status'];
  completionDateFrom?: string;
  completionDateTo?: string;
  contractAmountMin?: number;
  contractAmountMax?: number;
  company?: string;
}

// API 응답 타입
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// API 상태
export interface ApiStatus {
  kiscon: 'connected' | 'mock' | 'failed';
  safety: 'connected' | 'mock' | 'failed';
  construction: 'connected' | 'mock' | 'failed';
  regional: 'connected' | 'mock' | 'failed';
}

// 대시보드 통계
export interface DashboardStats {
  totalSites: number;
  matchSites: number;
  completionWithin6Months: number;
  totalContractAmount: number;
  averageProgress: number;
}

// 관심 현장 목록
export interface TargetProject {
  id: string;
  siteId: string;
  site: ConstructionSite;
  addedAt: string;
  notes?: string;
}

// 다운로드 옵션
export interface DownloadOptions {
  format: 'csv' | 'excel';
  includeDetails: boolean;
  filters?: SearchFilters;
}

// 페이지네이션
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// 정렬 옵션
export interface SortOption {
  field: keyof ConstructionSite;
  direction: 'asc' | 'desc';
}

// 교통영향평가 데이터 타입
export interface TrafficImpactAssessment {
  id: string;
  projectName: string;
  year: string;
  company: string;
  assessmentCompany: string;
  approvalAuthority: string;
  location: string;
  status: '진행중' | '완료' | '계획';
  projectType: string;
  contractAmount?: number;
  applicationDate?: string;
  completionDate?: string;
  reviewType: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

// 교통영향평가 검색 필터
export interface TrafficAssessmentFilters {
  dateType?: 'application' | 'completion';
  startDate?: string;
  endDate?: string;
  reviewType?: string;
  projectType?: string;
  approvalAuthority?: string;
  projectName?: string;
  company?: string;
  location?: string;
  status?: '진행중' | '완료' | '계획';
  minAmount?: number;
  maxAmount?: number;
}

// 교통영향평가 검색 결과
export interface TrafficAssessmentSearchResult {
  data: TrafficImpactAssessment[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// 교통영향평가 통계 데이터
export interface TrafficAssessmentStats {
  totalProjects: number;
  byStatus: {
    진행중: number;
    완료: number;
    계획: number;
  };
  byProjectType: Record<string, number>;
  byApprovalAuthority: Record<string, number>;
  byYear: Record<string, number>;
  averageContractAmount: number;
  totalContractAmount: number;
}

// 교통영향평가 상세 정보
export interface TrafficAssessmentDetail extends TrafficImpactAssessment {
  // 기본 정보
  businessNumber?: string;
  representative?: string;
  address?: string;
  phone?: string;
  
  // 사업 정보
  businessType?: string;
  businessScale?: string;
  businessArea?: string;
  businessPeriod?: {
    start: string;
    end: string;
  };
  
  // 교통영향평가 정보
  assessmentPeriod?: {
    start: string;
    end: string;
  };
  assessmentType?: string;
  assessmentScope?: string;
  trafficVolume?: {
    before: number;
    after: number;
  };
  
  // 심의 정보
  reviewDate?: string;
  reviewResult?: string;
  reviewComments?: string;
  
  // 첨부파일
  attachments?: {
    name: string;
    url: string;
    type: string;
  }[];
  
  // 지도 정보
  mapData?: {
    coordinates: {
      lat: number;
      lng: number;
    };
    address: string;
    boundary?: string;
  };
} 