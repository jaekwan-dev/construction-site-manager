'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrafficAssessmentFilters as TrafficAssessmentFiltersType } from '@/lib/types';

interface TrafficAssessmentFiltersProps {
  filters: TrafficAssessmentFiltersType;
  onFiltersChange: (filters: TrafficAssessmentFiltersType) => void;
  onSearch: () => void;
  loading: boolean;
}

export function TrafficAssessmentFilters({ filters, onFiltersChange, onSearch, loading }: TrafficAssessmentFiltersProps) {
  const handleInputChange = (field: keyof TrafficAssessmentFiltersType, value: string | undefined) => {
    onFiltersChange({
      ...filters,
      [field]: value
    });
  };

  const handleClearFilters = () => {
    onFiltersChange({});
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>검색 조건</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* 사업명 검색 */}
          <div className="space-y-2">
            <Label htmlFor="projectName">사업명</Label>
            <Input
              id="projectName"
              placeholder="사업명을 입력하세요"
              value={filters.projectName || ''}
              onChange={(e) => handleInputChange('projectName', e.target.value || undefined)}
            />
          </div>

          {/* 사업자 검색 */}
          <div className="space-y-2">
            <Label htmlFor="company">사업자</Label>
            <Input
              id="company"
              placeholder="사업자를 입력하세요"
              value={filters.company || ''}
              onChange={(e) => handleInputChange('company', e.target.value || undefined)}
            />
          </div>

          {/* 위치 검색 */}
          <div className="space-y-2">
            <Label htmlFor="location">위치</Label>
            <Input
              id="location"
              placeholder="위치를 입력하세요"
              value={filters.location || ''}
              onChange={(e) => handleInputChange('location', e.target.value || undefined)}
            />
          </div>

          {/* 진행상태 필터 */}
          <div className="space-y-2">
            <Label htmlFor="status">진행상태</Label>
            <Select
              value={filters.status || 'all'}
              onValueChange={(value) => handleInputChange('status', value === 'all' ? undefined : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="전체 상태" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 상태</SelectItem>
                <SelectItem value="진행중">진행중</SelectItem>
                <SelectItem value="완료">완료</SelectItem>
                <SelectItem value="계획">계획</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 사업유형 필터 */}
          <div className="space-y-2">
            <Label htmlFor="projectType">사업유형</Label>
            <Select
              value={filters.projectType || 'all'}
              onValueChange={(value) => handleInputChange('projectType', value === 'all' ? undefined : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="전체 유형" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 유형</SelectItem>
                <SelectItem value="공동주택">공동주택</SelectItem>
                <SelectItem value="지구단위계획">지구단위계획</SelectItem>
                <SelectItem value="도시개발">도시개발</SelectItem>
                <SelectItem value="물류창고">물류창고</SelectItem>
                <SelectItem value="주상복합">주상복합</SelectItem>
                <SelectItem value="기타">기타</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 승인관청 필터 */}
          <div className="space-y-2">
            <Label htmlFor="approvalAuthority">승인관청</Label>
            <Select
              value={filters.approvalAuthority || 'all'}
              onValueChange={(value) => handleInputChange('approvalAuthority', value === 'all' ? undefined : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="전체 관청" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 관청</SelectItem>
                <SelectItem value="국토교통부">국토교통부</SelectItem>
                <SelectItem value="서울특별시">서울특별시</SelectItem>
                <SelectItem value="부산광역시">부산광역시</SelectItem>
                <SelectItem value="대구광역시">대구광역시</SelectItem>
                <SelectItem value="인천광역시">인천광역시</SelectItem>
                <SelectItem value="광주광역시">광주광역시</SelectItem>
                <SelectItem value="대전광역시">대전광역시</SelectItem>
                <SelectItem value="울산광역시">울산광역시</SelectItem>
                <SelectItem value="경기도">경기도</SelectItem>
                <SelectItem value="강원도">강원도</SelectItem>
                <SelectItem value="충청북도">충청북도</SelectItem>
                <SelectItem value="충청남도">충청남도</SelectItem>
                <SelectItem value="전라북도">전라북도</SelectItem>
                <SelectItem value="전라남도">전라남도</SelectItem>
                <SelectItem value="경상북도">경상북도</SelectItem>
                <SelectItem value="경상남도">경상남도</SelectItem>
                <SelectItem value="제주도">제주도</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* 검색 버튼 */}
        <div className="flex gap-2 mt-6">
          <Button onClick={onSearch} disabled={loading} className="flex-1">
            {loading ? '검색 중...' : '검색'}
          </Button>
          <Button variant="outline" onClick={handleClearFilters} disabled={loading}>
            초기화
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 