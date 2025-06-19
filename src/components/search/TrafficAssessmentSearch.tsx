'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { TrafficImpactAssessment, TrafficAssessmentFilters, TrafficAssessmentSearchResult } from '@/lib/types';
import { ConstructionSiteApi } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { TrafficAssessmentFilters as TrafficAssessmentFiltersComponent } from './TrafficAssessmentFilters';
import { CompanyContactDialog } from './CompanyContactDialog';

export function TrafficAssessmentSearch() {
  const [data, setData] = useState<TrafficImpactAssessment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<TrafficAssessmentFilters>({
    projectName: '약식' // 기본 검색어로 "약식" 설정
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [crawlingProgress, setCrawlingProgress] = useState<string>('');

  const api = new ConstructionSiteApi();

  const searchTrafficAssessments = async (page: number = 1) => {
    setLoading(true);
    setError(null);
    setCrawlingProgress('크롤링을 시작합니다...');

    try {
      const result: TrafficAssessmentSearchResult = await api.crawlTrafficImpactAssessments(filters, page);
      setData(result.data);
      setTotal(result.total);
      setHasMore(result.hasMore);
      setCurrentPage(result.page);
      setCrawlingProgress(`총 ${result.total}건의 데이터를 수집했습니다.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : '검색 중 오류가 발생했습니다.');
      setCrawlingProgress('');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    searchTrafficAssessments();
  }, []);

  const handleSearch = () => {
    setCurrentPage(1);
    searchTrafficAssessments(1);
  };

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      searchTrafficAssessments(currentPage + 1);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case '진행중': return 'bg-blue-100 text-blue-800';
      case '완료': return 'bg-green-100 text-green-800';
      case '계획': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const downloadData = () => {
    const csvContent = [
      ['사업명', '기준년도', '사업자', '평가대행업체', '승인관청', '위치', '진행상태', '계약금액'],
      ...data.map(item => [
        item.projectName,
        item.year,
        item.company,
        item.assessmentCompany,
        item.approvalAuthority,
        item.location,
        item.status,
        item.contractAmount ? formatCurrency(item.contractAmount) : ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `교통영향평가_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* 검색 필터 */}
      {/* <TrafficAssessmentFiltersComponent
        filters={filters}
        onFiltersChange={setFilters}
        onSearch={handleSearch}
        loading={loading}
      /> */}

      {/* 검색 결과 */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>검색 결과</span>
            <div className="flex gap-2">
              <Button variant="outline" onClick={downloadData} disabled={data.length === 0}>
                다운로드
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
              {error}
            </div>
          )}

          {crawlingProgress && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md text-blue-700">
              {crawlingProgress}
            </div>
          )}

          <div className="space-y-4">
            {/* 검색 결과 테이블 */}
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>사업명</TableHead>
                    <TableHead>기준년도</TableHead>
                    <TableHead>사업자</TableHead>
                    <TableHead>평가대행업체</TableHead>
                    <TableHead>승인관청</TableHead>
                    <TableHead>위치</TableHead>
                    <TableHead>진행상태</TableHead>
                    <TableHead>계약금액</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      </TableRow>
                    ))
                  ) : data.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        검색 결과가 없습니다.
                      </TableCell>
                    </TableRow>
                  ) : (
                    data.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium max-w-xs">
                          <div 
                            className="truncate cursor-help" 
                            title={item.projectName}
                          >
                            {item.projectName}
                          </div>
                        </TableCell>
                        <TableCell>{item.year}</TableCell>
                        <TableCell className="max-w-32">
                          <div 
                            className="truncate cursor-help" 
                            title={item.company}
                          >
                            {item.company}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-32">
                          <CompanyContactDialog companyName={item.assessmentCompany}>
                            <button className="text-left hover:text-blue-600 hover:underline cursor-pointer truncate block" title={item.assessmentCompany}>
                              {item.assessmentCompany}
                            </button>
                          </CompanyContactDialog>
                        </TableCell>
                        <TableCell>{item.approvalAuthority}</TableCell>
                        <TableCell className="max-w-32">
                          <div 
                            className="truncate cursor-help" 
                            title={item.location}
                          >
                            {item.location}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(item.status)}>
                            {item.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {item.contractAmount ? formatCurrency(item.contractAmount) : '-'}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* 페이지네이션 */}
            {data.length > 0 && (
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  총 {total}건의 결과
                </div>
                {hasMore && (
                  <Button variant="outline" onClick={handleLoadMore} disabled={loading}>
                    더 보기
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 