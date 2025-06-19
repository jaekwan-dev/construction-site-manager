'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SearchFilters } from './SearchFilters';
import { SearchResults } from './SearchResults';
import { ConstructionSite, SearchFilters as SearchFiltersType, SortOption } from '@/lib/types';
import { constructionSiteApi } from '@/lib/api';
import { storage } from '@/lib/utils';
import { toast } from 'sonner';

const DEFAULT_FILTERS: SearchFiltersType = {
  location: '',
  status: undefined,
  completionDateFrom: '',
  completionDateTo: '',
  contractAmountMin: undefined,
  contractAmountMax: undefined,
  company: ''
};

const DEFAULT_SORT: SortOption = {
  field: 'name',
  direction: 'asc'
};

const DEFAULT_PAGINATION = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
  hasNext: false,
  hasPrev: false
};

export function NewtownSearch() {
  const [filters, setFilters] = useState<SearchFiltersType>(DEFAULT_FILTERS);
  const [sites, setSites] = useState<ConstructionSite[]>([]);
  const [pagination, setPagination] = useState(DEFAULT_PAGINATION);
  const [sortOption, setSortOption] = useState<SortOption>(DEFAULT_SORT);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // 로컬 스토리지에서 필터 복원
  useEffect(() => {
    const savedFilters = storage.get<SearchFiltersType>('newtown-search-filters');
    if (savedFilters) {
      setFilters(savedFilters);
    }
  }, []);

  // 필터 변경 시 로컬 스토리지에 저장
  useEffect(() => {
    storage.set('newtown-search-filters', filters);
  }, [filters]);

  const handleSearch = async () => {
    setIsLoading(true);
    setHasSearched(true);

    try {
      const response = await constructionSiteApi.searchNewtownSites(filters, pagination);
      
      if (response.success && response.data) {
        setSites(response.data.sites);
        setPagination({
          ...response.data.pagination,
          hasNext: response.data.pagination.page < response.data.pagination.totalPages,
          hasPrev: response.data.pagination.page > 1
        });
        toast.success(`${response.data.sites.length}개의 현장을 찾았습니다.`);
      } else {
        toast.error('검색 중 오류가 발생했습니다.');
        setSites([]);
        setPagination(DEFAULT_PAGINATION);
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('검색 중 오류가 발생했습니다.');
      setSites([]);
      setPagination(DEFAULT_PAGINATION);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFilters(DEFAULT_FILTERS);
    setSites([]);
    setPagination(DEFAULT_PAGINATION);
    setSortOption(DEFAULT_SORT);
    setHasSearched(false);
    storage.remove('newtown-search-filters');
    toast.info('검색 조건이 초기화되었습니다.');
  };

  const handleSort = (field: keyof ConstructionSite) => {
    const newDirection = 
      sortOption.field === field && sortOption.direction === 'asc' ? 'desc' : 'asc';
    
    setSortOption({ field, direction: newDirection });
    
    // 정렬된 결과로 다시 검색
    if (hasSearched) {
      handleSearch();
    }
  };

  const handlePageChange = (page: number) => {
    const newPagination = { ...pagination, page };
    setPagination(newPagination);
    
    // 페이지 변경 시 다시 검색
    if (hasSearched) {
      handleSearch();
    }
  };

  const handleAddToTarget = (site: ConstructionSite) => {
    try {
      const existingTargets = storage.get<ConstructionSite[]>('target-projects') || [];
      const isAlreadyAdded = existingTargets.some(target => target.id === site.id);
      
      if (isAlreadyAdded) {
        toast.warning('이미 관심 현장에 추가된 현장입니다.');
        return;
      }

      const newTargets = [...existingTargets, site];
      storage.set('target-projects', newTargets);
      toast.success('관심 현장에 추가되었습니다.');
    } catch (error) {
      console.error('Add to target error:', error);
      toast.error('관심 현장 추가 중 오류가 발생했습니다.');
    }
  };

  const handleViewDetails = (site: ConstructionSite) => {
    // TODO: 상세정보 다이얼로그 열기
    toast.info(`${site.name}의 상세정보를 확인합니다.`);
  };

  const handleDownload = async (format: 'csv' | 'excel') => {
    if (sites.length === 0) {
      toast.warning('다운로드할 데이터가 없습니다.');
      return;
    }

    try {
      const downloadData = sites.map(site => ({
        현장명: site.name,
        위치: site.location,
        건설사: site.company,
        상태: site.status,
        준공예정일: site.completionDate,
        계약금액: site.contractAmount,
        진행률: `${site.progress}%`,
        현장소장: site.contactInfo.siteManager.name,
        현장소장연락처: site.contactInfo.siteManager.phone,
        현장소장이메일: site.contactInfo.siteManager.email,
        공무팀장: site.contactInfo.projectManager.name,
        공무팀장연락처: site.contactInfo.projectManager.phone,
        공무팀장이메일: site.contactInfo.projectManager.email,
        현장사무실주소: site.contactInfo.office.address,
        현장사무실연락처: site.contactInfo.office.phone,
        현장사무실이메일: site.contactInfo.office.email
      }));

      const filename = `신도시현장_${new Date().toISOString().split('T')[0]}`;
      
      if (format === 'csv') {
        const { downloadCSV } = await import('@/lib/utils');
        downloadCSV(downloadData, filename);
      } else {
        const { downloadExcel } = await import('@/lib/utils');
        await downloadExcel(downloadData, filename);
      }

      toast.success(`${format.toUpperCase()} 파일이 다운로드되었습니다.`);
    } catch (error) {
      console.error('Download error:', error);
      toast.error('다운로드 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="space-y-6">
      {/* 검색 필터 */}
      <SearchFilters
        filters={filters}
        onFiltersChange={setFilters}
        onSearch={handleSearch}
        onReset={handleReset}
        isLoading={isLoading}
      />

      {/* 검색 결과 */}
      {hasSearched && (
        <>
          {/* 다운로드 버튼 */}
          {sites.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleDownload('csv')}
                    disabled={isLoading}
                  >
                    📊 CSV 다운로드
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleDownload('excel')}
                    disabled={isLoading}
                  >
                    📈 Excel 다운로드
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 검색 결과 테이블 */}
          <SearchResults
            sites={sites}
            pagination={pagination}
            sortOption={sortOption}
            onSort={handleSort}
            onPageChange={handlePageChange}
            onAddToTarget={handleAddToTarget}
            onViewDetails={handleViewDetails}
            isLoading={isLoading}
          />
        </>
      )}

      {/* 초기 안내 */}
      {!hasSearched && (
        <Card>
          <CardHeader>
            <CardTitle>🔍 신도시 현장 검색</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <p className="mb-4">
                위의 검색 조건을 설정하고 <strong>&quot;현장 검색&quot;</strong> 버튼을 클릭하세요.
              </p>
              <p className="text-sm">
                • 지역, 건설사, 현장 상태 등으로 검색할 수 있습니다.<br />
                • 준공예정일과 계약금액 범위를 설정할 수 있습니다.<br />
                • 검색 결과는 CSV/Excel로 다운로드할 수 있습니다.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 