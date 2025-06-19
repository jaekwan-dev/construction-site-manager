'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  RefreshCw, 
  Loader2, 
  ChevronLeft,
  ChevronRight,
  Building2,
  User,
  Phone,
  MapPin,
  ExternalLink
} from 'lucide-react';

interface KatiaCompany {
  id: string;
  number: string;
  companyName: string;
  representative: string;
  address: string;
  phone: string;
  linkIdx?: string;
}

export default function KatiaCompaniesListMobile() {
  const [companies, setCompanies] = useState<KatiaCompany[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        search: searchTerm
      });

      const response = await fetch(`/api/katia-companies?${params}`);
      const data = await response.json();

      if (data.success) {
        setCompanies(data.companies);
        setTotalPages(Math.ceil(data.totalCount / 10));
      }
    } catch (error) {
      console.error('KATIA 회사 데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const handleRefresh = () => {
    setCurrentPage(1);
    fetchCompanies();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
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
          <Building2 className="h-5 w-5 text-green-600" />
          <h2 className="text-lg font-semibold">KATIA 시행사 정보</h2>
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

      {/* 검색 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="회사명 검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* 데이터 목록 */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
        </div>
      ) : companies.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">검색 결과가 없습니다.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {companies.map((company) => (
            <Card key={company.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* 회사명 */}
                  <div>
                    <h3 className="font-semibold text-base line-clamp-2">
                      {company.companyName}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {company.number}
                      </Badge>
                      {company.linkIdx && (
                        <Badge variant="outline" className="text-xs">
                          ID: {company.linkIdx}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* 기본 정보 */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <User className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span className="text-muted-foreground">대표자:</span>
                        <span className="ml-1">{company.representative || "정보 없음"}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span className="text-muted-foreground">연락처:</span>
                        <span className="ml-1">{company.phone || "정보 없음"}</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span className="text-muted-foreground">주소:</span>
                        <span className="ml-1 line-clamp-2">{company.address || "정보 없음"}</span>
                      </div>
                    </div>
                  </div>

                  {/* 액션 버튼 */}
                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const url = company.linkIdx 
                          ? `https://www.katia.or.kr/work/member_manage.php?code=member_manage&category=&Dosearch=company&search_order=${encodeURIComponent(company.companyName)}`
                          : `https://www.katia.or.kr/work/member_manage.php?code=member_manage&category=&Dosearch=company&search_order=${encodeURIComponent(company.companyName)}`;
                        window.open(url, '_blank');
                      }}
                      className="text-xs cursor-pointer"
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      KATIA 사이트
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
    </div>
  );
} 