'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Loader2, RefreshCw, Building2, Database, Globe, Search, ChevronLeft, ChevronRight } from 'lucide-react';

interface CompanyInfo {
  id: number;
  number: string;
  companyName: string;
  representative: string;
  address: string;
  phone: string;
  linkIdx?: string;
  createdAt: string;
  updatedAt: string;
}

interface KatiaResponse {
  success: boolean;
  companies: CompanyInfo[];
  totalCount: number;
  message: string;
  isNewData?: boolean;
  dbConnected?: boolean;
  error?: string;
}

export default function KatiaCompaniesList() {
  const [companies, setCompanies] = useState<CompanyInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isNewData, setIsNewData] = useState(false);
  const [dbConnected, setDbConnected] = useState(false);
  
  // 검색 상태
  const [searchTerm, setSearchTerm] = useState('');
  
  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const fetchKatiaCompanies = async (forceCrawl = false) => {
    setLoading(true);
    setError(null);
    setProgress(0);
    
    try {
      const url = forceCrawl 
        ? '/api/katia-companies?action=crawl'
        : '/api/katia-companies';
      
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
      const data: KatiaResponse = await response.json();

      clearInterval(progressInterval);
      setProgress(100);

      if (data.success) {
        setCompanies(data.companies);
        setCurrentPage(1); // 데이터가 새로 로드되면 첫 페이지로
        setLastUpdated(new Date());
        setIsNewData(data.isNewData || false);
        setDbConnected(data.dbConnected || false);
      } else {
        setError(data.error || '시행사 정보를 가져오는데 실패했습니다.');
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
    fetchKatiaCompanies(true); // 강제 크롤링
  };

  useEffect(() => {
    fetchKatiaCompanies(); // 초기 로드 시 저장된 데이터 조회
  }, []);

  // 검색 필터링
  const filteredCompanies = useMemo(() => {
    if (!searchTerm.trim()) return companies;
    
    return companies.filter(company => {
      const normalizedCompanyName = company.companyName
        .replace(/주식회사|(주)|㈜|㈐|㈑|㈒|㈓|㈔|㈕|㈖|㈗|㈘|㈙|㈚|㈛|㈜|㈝|㈞|㈟|㈠|㈡|㈢|㈣|㈤|㈥|㈦|㈧|㈨|㈩/g, '')
        .replace(/\s+/g, '')
        .toLowerCase();
      
      const normalizedSearchTerm = searchTerm
        .replace(/주식회사|(주)|㈜|㈐|㈑|㈒|㈓|㈔|㈕|㈖|㈗|㈘|㈙|㈚|㈛|㈜|㈝|㈞|㈟|㈠|㈡|㈢|㈣|㈤|㈥|㈦|㈧|㈨|㈩/g, '')
        .replace(/\s+/g, '')
        .toLowerCase();
      
      return normalizedCompanyName.includes(normalizedSearchTerm);
    });
  }, [companies, searchTerm]);

  // 페이지네이션 계산
  const totalPages = Math.ceil(filteredCompanies.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCompanies = filteredCompanies.slice(startIndex, endIndex);

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

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-blue-600" />
            <CardTitle>KATIA 시행사 정보</CardTitle>
            <Badge variant="secondary">
              총 {filteredCompanies.length}개 업체
            </Badge>
            {isNewData && (
              <Badge variant="outline" className="text-green-600 border-green-600">
                <Globe className="h-3 w-3 mr-1" />
                실시간 크롤링
              </Badge>
            )}
            {!isNewData && companies.length > 0 && (
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
            className="cursor-pointer"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            새로고침
          </Button>
        </div>
        
        {lastUpdated && (
          <p className="text-sm text-muted-foreground">
            마지막 업데이트: {lastUpdated.toLocaleString('ko-KR')}
            {!isNewData && companies.length > 0 && (
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
              placeholder="회사명으로 검색..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
          {searchTerm && (
            <p className="text-sm text-muted-foreground mt-2">
              &quot;{searchTerm}&quot; 검색 결과: {filteredCompanies.length}개 업체
            </p>
          )}
        </div>

        {loading && (
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              {isNewData ? 'KATIA 사이트에서 시행사 정보를 수집하고 있습니다...' : '데이터를 불러오는 중...'}
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        )}

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {!loading && filteredCompanies.length > 0 && (
          <>
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">번호</TableHead>
                    <TableHead>회사명</TableHead>
                    <TableHead className="w-24">대표자</TableHead>
                    <TableHead>등록지</TableHead>
                    <TableHead className="w-32">연락처</TableHead>
                    <TableHead className="w-20">Link ID</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentCompanies.map((company) => (
                    <TableRow key={company.id}>
                      <TableCell className="font-medium">
                        {company.number}
                      </TableCell>
                      <TableCell className="font-medium">
                        {company.companyName}
                      </TableCell>
                      <TableCell>{company.representative}</TableCell>
                      <TableCell className="max-w-xs truncate" title={company.address}>
                        {company.address}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {company.phone}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {company.linkIdx ? (
                          <Badge variant="outline" className="text-xs">
                            {company.linkIdx}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-xs">-</span>
                        )}
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
                  {startIndex + 1}-{Math.min(endIndex, filteredCompanies.length)} / {filteredCompanies.length}개
                </div>
                
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="cursor-pointer"
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
                          className="min-w-[40px] cursor-pointer"
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
                    className="cursor-pointer"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

        {!loading && filteredCompanies.length === 0 && !error && (
          <div className="text-center py-8 text-muted-foreground">
            <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            {searchTerm ? (
              <>
                <p>검색 결과가 없습니다.</p>
                <p className="text-sm mt-2">다른 검색어를 시도해보세요.</p>
              </>
            ) : (
              <>
                <p>시행사 정보가 없습니다.</p>
                <p className="text-sm mt-2">새로고침 버튼을 클릭하여 데이터를 수집하세요.</p>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 