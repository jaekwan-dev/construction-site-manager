'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  RefreshCw, 
  Loader2, 
  Filter,
  ChevronLeft,
  ChevronRight,
  Building2,
  MapPin,
  User,
  ExternalLink
} from 'lucide-react';
import CompanyInfoDialog from './CompanyInfoDialog';

interface TrafficAssessment {
  id: string;
  number: string;
  projectName: string;
  year: string;
  businessOwner: string;
  assessmentAgency: string;
  approvalAuthority: string;
  location: string;
  status: string;
  projectId: string;
  linkIdx?: string;
}

export default function TrafficAssessmentsListMobile() {
  const [assessments, setAssessments] = useState<TrafficAssessment[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [showCompanyDialog, setShowCompanyDialog] = useState(false);

  const fetchAssessments = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        search: searchTerm,
        year: yearFilter,
        status: statusFilter
      });

      const response = await fetch(`/api/traffic-assessments?${params}`);
      const data = await response.json();

      if (data.success) {
        setAssessments(data.assessments);
        setTotalPages(Math.ceil(data.totalCount / 10));
      }
    } catch (error) {
      console.error('교통영향평가 데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, yearFilter, statusFilter]);

  useEffect(() => {
    fetchAssessments();
  }, [fetchAssessments]);

  const handleRefresh = () => {
    setCurrentPage(1);
    fetchAssessments();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleCompanyClick = (companyName: string) => {
    setSelectedCompany(companyName);
    setShowCompanyDialog(true);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setYearFilter('');
    setStatusFilter('');
    setCurrentPage(1);
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
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

  return (
    <div className="space-y-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-semibold">교통영향평가 자료</h2>
        </div>
        <Button
          onClick={handleRefresh}
          disabled={loading}
          size="sm"
          variant="outline"
          className="cursor-pointer"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* 검색 및 필터 */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="사업명 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="cursor-pointer"
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        {showFilters && (
          <Card className="p-4">
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">기준년도</label>
                <Select value={yearFilter} onValueChange={setYearFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="전체" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">전체</SelectItem>
                    {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}년
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium">진행상태</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="전체" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">전체</SelectItem>
                    <SelectItem value="승인">승인</SelectItem>
                    <SelectItem value="검토중">검토중</SelectItem>
                    <SelectItem value="반려">반려</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="w-full h-8 px-3 border-orange-200 text-orange-700 hover:bg-orange-50 hover:border-orange-300 hover:text-orange-800 transition-all duration-200 shadow-sm hover:shadow-md group cursor-pointer"
              >
                <span className="font-medium">필터 초기화</span>
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* 데이터 목록 */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : assessments.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">검색 결과가 없습니다.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {assessments.map((assessment) => (
            <Card key={assessment.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* 사업명 */}
                  <div>
                    <h3 className="font-semibold text-base line-clamp-2">
                      {assessment.projectName}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {assessment.number}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {assessment.year}년
                      </Badge>
                    </div>
                  </div>

                  {/* 기본 정보 */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <User className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span className="text-muted-foreground">사업주:</span>
                        <span className="ml-1">{assessment.businessOwner}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span className="text-muted-foreground">평가대행:</span>
                        <button
                          onClick={() => handleCompanyClick(assessment.assessmentAgency)}
                          className="ml-1 text-blue-600 hover:text-blue-800 underline cursor-pointer"
                        >
                          {assessment.assessmentAgency}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span className="text-muted-foreground">위치:</span>
                        <span className="ml-1 line-clamp-1">{assessment.location}</span>
                      </div>
                    </div>
                  </div>

                  {/* 상태 */}
                  <div className="flex items-center justify-between">
                    <Badge 
                      variant={assessment.status === '승인' ? 'default' : 
                              assessment.status === '검토중' ? 'secondary' : 'destructive'}
                      className="text-xs"
                    >
                      {assessment.status}
                    </Badge>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`https://tia.molit.go.kr/search/businessSrchView.do?biz_id=${assessment.projectId}`, '_blank')}
                      className="text-xs cursor-pointer"
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      상세보기
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div className="flex items-center gap-1">
            {getPageNumbers().map((page, index) => (
              <div key={index}>
                {page === '...' ? (
                  <span className="px-2 py-1 text-sm text-muted-foreground">...</span>
                ) : (
                  <Button
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(page as number)}
                    className="min-w-[36px] h-8 text-xs cursor-pointer"
                  >
                    {page}
                  </Button>
                )}
              </div>
            ))}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="cursor-pointer"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* 회사 정보 다이얼로그 */}
      {selectedCompany && (
        <CompanyInfoDialog
          isOpen={showCompanyDialog}
          onClose={() => {
            setShowCompanyDialog(false);
            setSelectedCompany(null);
          }}
          companyName={selectedCompany}
        />
      )}
    </div>
  );
} 