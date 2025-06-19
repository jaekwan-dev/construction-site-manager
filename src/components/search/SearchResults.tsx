'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { ConstructionSite, SortOption } from '@/lib/types';
import { formatDate, formatCurrency, getStatusText, getStatusColor, isCompletionWithin6Months } from '@/lib/utils';

interface SearchResultsProps {
  sites: ConstructionSite[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  sortOption: SortOption;
  onSort: (field: keyof ConstructionSite) => void;
  onPageChange: (page: number) => void;
  onAddToTarget: (site: ConstructionSite) => void;
  onViewDetails: (site: ConstructionSite) => void;
  isLoading?: boolean;
}

export function SearchResults({
  sites,
  pagination,
  sortOption,
  onSort,
  onPageChange,
  onAddToTarget,
  onViewDetails,
  isLoading = false
}: SearchResultsProps) {
  const getSortIcon = (field: keyof ConstructionSite) => {
    if (sortOption.field !== field) return '↕️';
    return sortOption.direction === 'asc' ? '↑' : '↓';
  };

  const handleSort = (field: keyof ConstructionSite) => {
    onSort(field);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>검색 결과</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-4 w-[80px]" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (sites.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>검색 결과</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            검색 결과가 없습니다.
            <br />
            다른 검색 조건을 시도해보세요.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>검색 결과 ({pagination.total}개)</span>
          <div className="text-sm text-muted-foreground">
            {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} / {pagination.total}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center gap-1">
                    현장명 {getSortIcon('name')}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('location')}
                >
                  <div className="flex items-center gap-1">
                    위치 {getSortIcon('location')}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('company')}
                >
                  <div className="flex items-center gap-1">
                    건설사 {getSortIcon('company')}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center gap-1">
                    상태 {getSortIcon('status')}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('completionDate')}
                >
                  <div className="flex items-center gap-1">
                    준공예정일 {getSortIcon('completionDate')}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('contractAmount')}
                >
                  <div className="flex items-center gap-1">
                    계약금액 {getSortIcon('contractAmount')}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('progress')}
                >
                  <div className="flex items-center gap-1">
                    진행률 {getSortIcon('progress')}
                  </div>
                </TableHead>
                <TableHead className="text-right">작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sites.map((site) => (
                <TableRow key={site.id}>
                  <TableCell className="font-medium">
                    <div className="space-y-1">
                      <div>{site.name}</div>
                      {isCompletionWithin6Months(site.completionDate) && (
                        <Badge variant="destructive" className="text-xs">
                          6개월 내 준공
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{site.location}</TableCell>
                  <TableCell>{site.company}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(site.status)}>
                      {getStatusText(site.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(site.completionDate)}</TableCell>
                  <TableCell>{formatCurrency(site.contractAmount)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span>{site.progress}%</span>
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${site.progress}%` }}
                        />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onViewDetails(site)}
                      >
                        상세보기
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => onAddToTarget(site)}
                      >
                        타겟 추가
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* 페이지네이션 */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              페이지 {pagination.page} / {pagination.totalPages}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(pagination.page - 1)}
                disabled={!pagination.hasPrev}
              >
                이전
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(pagination.page + 1)}
                disabled={!pagination.hasNext}
              >
                다음
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 