'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SearchFilters as SearchFiltersType } from '@/lib/types';

interface SearchFiltersProps {
  filters: SearchFiltersType;
  onFiltersChange: (filters: SearchFiltersType) => void;
  onSearch: () => void;
  onReset: () => void;
  isLoading?: boolean;
}

export function SearchFilters({
  filters,
  onFiltersChange,
  onSearch,
  onReset,
  isLoading = false
}: SearchFiltersProps) {
  const handleInputChange = (field: keyof SearchFiltersType, value: string) => {
    onFiltersChange({
      ...filters,
      [field]: value || undefined
    });
  };

  const handleNumberChange = (field: keyof SearchFiltersType, value: string) => {
    const numValue = value ? parseInt(value, 10) : undefined;
    onFiltersChange({
      ...filters,
      [field]: numValue
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🔍 신도시 현장 검색 필터
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* 지역 검색 */}
          <div className="space-y-2">
            <Label htmlFor="location">지역</Label>
            <Input
              id="location"
              placeholder="예: 경기도 성남시, 서울시 강남구"
              value={filters.location || ''}
              onChange={(e) => handleInputChange('location', e.target.value)}
            />
          </div>

          {/* 상태 필터 */}
          <div className="space-y-2">
            <Label htmlFor="status">현장 상태</Label>
            <Select
              value={filters.status || 'all'}
              onValueChange={(value) => handleInputChange('status', value === 'all' ? '' : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="전체 상태" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 상태</SelectItem>
                <SelectItem value="planning">계획</SelectItem>
                <SelectItem value="construction">시공중</SelectItem>
                <SelectItem value="completed">준공</SelectItem>
                <SelectItem value="maintenance">유지보수</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 건설사 필터 */}
          <div className="space-y-2">
            <Label htmlFor="company">건설사</Label>
            <Input
              id="company"
              placeholder="건설사명 입력"
              value={filters.company || ''}
              onChange={(e) => handleInputChange('company', e.target.value)}
            />
          </div>

          {/* 준공예정일 시작 */}
          <div className="space-y-2">
            <Label htmlFor="completionDateFrom">준공예정일 (시작)</Label>
            <Input
              id="completionDateFrom"
              type="date"
              value={filters.completionDateFrom || ''}
              onChange={(e) => handleInputChange('completionDateFrom', e.target.value)}
            />
          </div>

          {/* 준공예정일 종료 */}
          <div className="space-y-2">
            <Label htmlFor="completionDateTo">준공예정일 (종료)</Label>
            <Input
              id="completionDateTo"
              type="date"
              value={filters.completionDateTo || ''}
              onChange={(e) => handleInputChange('completionDateTo', e.target.value)}
            />
          </div>

          {/* 계약금액 최소 */}
          <div className="space-y-2">
            <Label htmlFor="contractAmountMin">계약금액 최소 (억원)</Label>
            <Input
              id="contractAmountMin"
              type="number"
              placeholder="0"
              value={filters.contractAmountMin || ''}
              onChange={(e) => handleNumberChange('contractAmountMin', e.target.value)}
            />
          </div>

          {/* 계약금액 최대 */}
          <div className="space-y-2">
            <Label htmlFor="contractAmountMax">계약금액 최대 (억원)</Label>
            <Input
              id="contractAmountMax"
              type="number"
              placeholder="1000"
              value={filters.contractAmountMax || ''}
              onChange={(e) => handleNumberChange('contractAmountMax', e.target.value)}
            />
          </div>
        </div>

        {/* 버튼 영역 */}
        <div className="flex gap-2 pt-4">
          <Button 
            onClick={onSearch} 
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? '검색 중...' : '🔍 현장 검색'}
          </Button>
          <Button 
            variant="outline" 
            onClick={onReset}
            disabled={isLoading}
          >
            초기화
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 