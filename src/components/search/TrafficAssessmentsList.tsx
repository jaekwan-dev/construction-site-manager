'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Loader2, RefreshCw, FileText, Database, Globe, Calendar, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown, Building2, Search } from 'lucide-react';
import CompanyInfoDialog from './CompanyInfoDialog';
import TrafficAssessmentFilters from './TrafficAssessmentFilters';

interface TrafficAssessmentInfo {
  id: number;
  number: string;
  projectName: string;
  year: string;
  businessOwner: string;
  assessmentAgency: string;
  approvalAuthority: string;
  status: string;
  projectId: string;
  createdAt: string;
  updatedAt: string;
}

interface TrafficAssessmentResponse {
  success: boolean;
  assessments: TrafficAssessmentInfo[];
  totalCount: number;
  message: string;
  isNewData?: boolean;
  dbConnected?: boolean;
  searchPeriod?: string;
  error?: string;
}

type SortField = 'projectName' | 'year' | null;
type SortDirection = 'asc' | 'desc';

export default function TrafficAssessmentsList() {
  const [assessments, setAssessments] = useState<TrafficAssessmentInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isNewData, setIsNewData] = useState(false);
  const [dbConnected, setDbConnected] = useState(false);
  const [searchPeriod, setSearchPeriod] = useState<string>('');
  
  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // 업체 정보 다이얼로그 상태
  const [companyDialogOpen, setCompanyDialogOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<string>('');

  // 필터 상태
  const [filters, setFilters] = useState({
    year: '',
    status: ''
  });

  // 검색 상태
  const [searchTerm, setSearchTerm] = useState('');

  // 정렬 상태
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const fetchTrafficAssessments = async (forceCrawl = false) => {
    setLoading(true);
    setError(null);
    setProgress(0);
    
    try {
      const url = forceCrawl 
        ? '/api/traffic-assessments?action=crawl'
        : '/api/traffic-assessments';
      
      // 진행 상황 시뮬레이션 (실제로는 서버에서 처리)
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);

      const response = await fetch(url);
      const data: TrafficAssessmentResponse = await response.json();

      clearInterval(progressInterval);
      setProgress(100);

      if (data.success) {
        setAssessments(data.assessments);
        setCurrentPage(1); // 데이터가 새로 로드되면 첫 페이지로
        setLastUpdated(new Date());
        setIsNewData(data.isNewData || false);
        setDbConnected(data.dbConnected || false);
        setSearchPeriod(data.searchPeriod || '');
      } else {
        setError(data.error || '교통영향평가 자료를 가져오는데 실패했습니다.');
      }
    } catch {
      setError('네트워크 오류가 발생했습니다.');
    } finally {
      setLoading(false);
      // 진행률 초기화
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const handleRefresh = () => {
    fetchTrafficAssessments(true); // 강제 크롤링
  };

  useEffect(() => {
    fetchTrafficAssessments(); // 초기 로드 시 저장된 데이터 조회
  }, []);

  // 검색 필터링
  const searchFilteredAssessments = useMemo(() => {
    if (!searchTerm.trim()) return assessments;
    
    return assessments.filter(assessment => {
      const normalizedProjectName = assessment.projectName
        .replace(/\s+/g, '')
        .toLowerCase();
      
      const normalizedSearchTerm = searchTerm
        .replace(/\s+/g, '')
        .toLowerCase();
      
      return normalizedProjectName.includes(normalizedSearchTerm);
    });
  }, [assessments, searchTerm]);

  // 필터링된 데이터
  const filteredAssessments = useMemo(() => {
    return searchFilteredAssessments.filter(assessment => {
      if (filters.year && assessment.year !== filters.year) return false;
      if (filters.status && assessment.status !== filters.status) return false;
      return true;
    });
  }, [searchFilteredAssessments, filters]);

  // 정렬된 데이터
  const sortedAssessments = useMemo(() => {
    if (!sortField) return filteredAssessments;
    
    return [...filteredAssessments].sort((a, b) => {
      let aValue: string | number = a[sortField];
      let bValue: string | number = b[sortField];
      
      if (sortField === 'year') {
        aValue = parseInt(aValue as string) || 0;
        bValue = parseInt(bValue as string) || 0;
      } else {
        aValue = (aValue as string).toLowerCase();
        bValue = (bValue as string).toLowerCase();
      }
      
      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  }, [filteredAssessments, sortField, sortDirection]);

  // 페이지네이션 계산
  const totalPages = Math.ceil(filteredAssessments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAssessments = sortedAssessments.slice(startIndex, endIndex);

  // 현재 페이지가 총 페이지 수를 초과하는 경우 첫 페이지로 이동
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // 업체 정보 다이얼로그 열기
  const handleCompanyClick = (companyName: string) => {
    setSelectedCompany(companyName);
    setCompanyDialogOpen(true);
  };

  // 정렬 핸들러
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1); // 정렬 시 첫 페이지로
  };

  // 정렬 아이콘 렌더링
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4" />;
    }
    return sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
  };

  // 검색어 변경 핸들러
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // 검색 시 첫 페이지로
  };

  // 페이지 번호 배열 생성
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case '완료':
        return 'default';
      case '진행중':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-600" />
              <CardTitle>교통영향평가 자료</CardTitle>
              <Badge variant="secondary">
                총 {filteredAssessments.length}개 사업
              </Badge>
              {isNewData && (
                <Badge variant="outline" className="text-green-600 border-green-600">
                  <Globe className="h-3 w-3 mr-1" />
                  실시간 크롤링
                </Badge>
              )}
              {!isNewData && assessments.length > 0 && (
                <Badge variant="outline" className="text-blue-600 border-blue-600">
                  <Database className="h-3 w-3 mr-1" />
                  {dbConnected ? '저장된 데이터' : '임시 저장 데이터'}
                </Badge>
              )}
            </div>
            <Button
              onClick={handleRefresh}
              disabled={loading}
              size="sm"
              variant="outline"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              새로고침
            </Button>
          </div>
          
          {searchPeriod && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>검색 기간: {searchPeriod}</span>
            </div>
          )}
          
          {lastUpdated && (
            <p className="text-sm text-muted-foreground">
              마지막 업데이트: {lastUpdated.toLocaleString('ko-KR')}
              {!isNewData && assessments.length > 0 && (
                <span className="ml-2 text-blue-600">
                  (저장된 데이터에서 조회)
                </span>
              )}
            </p>
          )}
        </CardHeader>

        <CardContent>
          {/* 검색 필터 */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="사업명으로 검색..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
            {searchTerm && (
              <p className="text-sm text-muted-foreground mt-2">
                &quot;{searchTerm}&quot; 검색 결과: {filteredAssessments.length}개 사업
              </p>
            )}
          </div>

          {/* 필터 컴포넌트 */}
          <TrafficAssessmentFilters
            assessments={assessments}
            onFiltersChange={setFilters}
          />

          {loading && (
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                {isNewData ? '교통영향평가정보지원시스템에서 자료를 수집하고 있습니다...' : '데이터를 불러오는 중...'}
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {!loading && filteredAssessments.length > 0 && (
            <>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">번호</TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleSort('projectName')}
                      >
                        <div className="flex items-center gap-1">
                          사업명
                          {getSortIcon('projectName')}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="w-20 cursor-pointer hover:bg-muted/50"
                        onClick={() => handleSort('year')}
                      >
                        <div className="flex items-center gap-1">
                          기준년도
                          {getSortIcon('year')}
                        </div>
                      </TableHead>
                      <TableHead className="w-24">사업자</TableHead>
                      <TableHead className="w-32">평가대행업체</TableHead>
                      <TableHead className="w-24">승인관청</TableHead>
                      <TableHead className="w-20">진행상태</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentAssessments.map((assessment) => (
                      <TableRow key={assessment.id}>
                        <TableCell className="font-medium">
                          {assessment.number}
                        </TableCell>
                        <TableCell className="font-medium max-w-xs truncate" title={assessment.projectName}>
                          {assessment.projectName}
                        </TableCell>
                        <TableCell>{assessment.year}</TableCell>
                        <TableCell className="max-w-xs truncate" title={assessment.businessOwner}>
                          {assessment.businessOwner}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className="cursor-pointer hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 transition-colors"
                            onClick={() => handleCompanyClick(assessment.assessmentAgency)}
                          >
                            <Building2 className="h-3 w-3 mr-1" />
                            {assessment.assessmentAgency}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-xs truncate" title={assessment.approvalAuthority}>
                          {assessment.approvalAuthority}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(assessment.status)}>
                            {assessment.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* 페이지네이션 */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    {startIndex + 1}-{Math.min(endIndex, filteredAssessments.length)} / {filteredAssessments.length}개
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    
                    {getPageNumbers().map((page, index) => (
                      <div key={index}>
                        {page === '...' ? (
                          <span className="px-2 py-1 text-sm text-muted-foreground">...</span>
                        ) : (
                          <Button
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePageChange(page as number)}
                            className="min-w-[40px]"
                          >
                            {page}
                          </Button>
                        )}
                      </div>
                    ))}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}

          {!loading && filteredAssessments.length === 0 && !error && (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              {searchTerm ? (
                <>
                  <p>검색 결과가 없습니다.</p>
                  <p className="text-sm mt-2">다른 검색어를 시도해보세요.</p>
                </>
              ) : (
                <>
                  <p>교통영향평가 자료가 없습니다.</p>
                  <p className="text-sm mt-2">새로고침 버튼을 클릭하여 데이터를 수집하세요.</p>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 업체 정보 다이얼로그 */}
      <CompanyInfoDialog
        isOpen={companyDialogOpen}
        onClose={() => setCompanyDialogOpen(false)}
        companyName={selectedCompany}
      />
    </>
  );
} 