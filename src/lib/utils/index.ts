import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// Tailwind CSS 클래스 병합 유틸리티 (shadcn/ui)
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 날짜 포맷팅
export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// 날짜 차이 계산 (일)
export function getDaysDifference(date1: string | Date, date2: string | Date): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// 6개월 내 준공 예정인지 확인
export function isCompletionWithin6Months(completionDate: string): boolean {
  const today = new Date();
  const completion = new Date(completionDate);
  const sixMonthsFromNow = new Date();
  sixMonthsFromNow.setMonth(today.getMonth() + 6);
  
  return completion <= sixMonthsFromNow && completion >= today;
}

// 금액 포맷팅 (원)
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

// 진행률 포맷팅 (%)
export function formatProgress(progress: number): string {
  return `${Math.round(progress)}%`;
}

// 상태 텍스트 변환
export function getStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    'planning': '계획',
    'construction': '시공중',
    'completed': '준공',
    'maintenance': '유지보수'
  };
  return statusMap[status] || status;
}

// 상태 색상 클래스
export function getStatusColor(status: string): string {
  const colorMap: Record<string, string> = {
    'planning': 'bg-blue-100 text-blue-800',
    'construction': 'bg-yellow-100 text-yellow-800',
    'completed': 'bg-green-100 text-green-800',
    'maintenance': 'bg-purple-100 text-purple-800'
  };
  return colorMap[status] || 'bg-gray-100 text-gray-800';
}

// 위험도 색상 클래스
export function getRiskLevelColor(riskLevel: string): string {
  const colorMap: Record<string, string> = {
    'low': 'bg-green-100 text-green-800',
    'medium': 'bg-yellow-100 text-yellow-800',
    'high': 'bg-red-100 text-red-800'
  };
  return colorMap[riskLevel] || 'bg-gray-100 text-gray-800';
}

// 거리 포맷팅
export function formatDistance(distance: number): string {
  if (distance < 1000) {
    return `${Math.round(distance)}m`;
  }
  return `${(distance / 1000).toFixed(1)}km`;
}

// 시간 포맷팅 (분)
export function formatTime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}분`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}시간 ${remainingMinutes}분`;
}

// CSV 다운로드
export function downloadCSV(data: Record<string, unknown>[], filename: string): void {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // 쉼표나 따옴표가 포함된 값은 따옴표로 감싸기
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Excel 다운로드 (XLSX 라이브러리 필요)
export async function downloadExcel(data: Record<string, unknown>[], filename: string): Promise<void> {
  try {
    const XLSX = await import('xlsx');
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, `${filename}.xlsx`);
  } catch (error) {
    console.error('Excel 다운로드 실패:', error);
    // XLSX 라이브러리가 없으면 CSV로 대체
    downloadCSV(data, filename);
  }
}

// 로컬 스토리지 유틸리티
export const storage = {
  get: <T>(key: string, defaultValue?: T): T | null => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue || null;
    } catch (error) {
      console.error('로컬 스토리지 읽기 실패:', error);
      return defaultValue || null;
    }
  },
  
  set: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('로컬 스토리지 쓰기 실패:', error);
    }
  },
  
  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('로컬 스토리지 삭제 실패:', error);
    }
  }
};

// API 키 검증
export function validateApiKey(apiKey: string): boolean {
  return Boolean(apiKey && apiKey.length > 0);
}

// 에러 메시지 생성
export function createErrorMessage(error: unknown): string {
  if (typeof error === 'string') {
    return error;
  }
  
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }
  
  if (error && typeof error === 'object' && 'response' in error) {
    const response = (error as { response: { data: { message: string } } }).response;
    if (response?.data?.message) {
      return response.data.message;
    }
  }
  
  return '알 수 없는 오류가 발생했습니다.';
}

// 디바운스 함수
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// 쿼리 파라미터 파싱
export function parseQueryParams(url: string): Record<string, string> {
  const params = new URLSearchParams(url.split('?')[1] || '');
  const result: Record<string, string> = {};
  
  for (const [key, value] of params.entries()) {
    result[key] = value;
  }
  
  return result;
}

// 쿼리 파라미터 생성
export function createQueryParams(params: Record<string, unknown>): string {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });
  
  return searchParams.toString();
}

// 페이지네이션 계산
export function calculatePagination(
  total: number,
  page: number,
  limit: number
): {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
} {
  const totalPages = Math.ceil(total / limit);
  const currentPage = Math.max(1, Math.min(page, totalPages));
  
  return {
    page: currentPage,
    limit,
    total,
    totalPages,
    hasNext: currentPage < totalPages,
    hasPrev: currentPage > 1
  };
}

// 배열 그룹화
export function groupBy<T, K extends string | number | symbol>(
  array: T[],
  key: (item: T) => K
): Record<K, T[]> {
  return array.reduce((groups, item) => {
    const groupKey = key(item);
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(item);
    return groups;
  }, {} as Record<K, T[]>);
}

// 배열 정렬
export function sortBy<T>(
  array: T[],
  key: keyof T,
  direction: 'asc' | 'desc' = 'asc'
): T[] {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    
    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });
}

// 배열 필터링
export function filterArray<T>(
  array: T[],
  filters: Partial<Record<keyof T, unknown>>
): T[] {
  return array.filter(item => {
    return Object.entries(filters).every(([key, value]) => {
      if (value === undefined || value === null || value === '') {
        return true;
      }
      
      const itemValue = item[key as keyof T];
      
      if (typeof value === 'string') {
        return String(itemValue).toLowerCase().includes(value.toLowerCase());
      }
      
      return itemValue === value;
    });
  });
} 