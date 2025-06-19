'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

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

interface TrafficAssessmentFiltersProps {
  assessments: TrafficAssessmentInfo[];
  onFiltersChange: (filters: {
    year: string;
    status: string;
  }) => void;
}

export default function TrafficAssessmentFilters({ assessments, onFiltersChange }: TrafficAssessmentFiltersProps) {
  const [yearFilter, setYearFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // 고유한 연도와 상태 목록 추출 (실제 데이터에서)
  const uniqueYears = Array.from(new Set(assessments.map(item => item.year))).sort((a, b) => b.localeCompare(a));
  const uniqueStatuses = Array.from(new Set(assessments.map(item => item.status))).sort();

  useEffect(() => {
    onFiltersChange({
      year: yearFilter === 'all' ? '' : yearFilter,
      status: statusFilter === 'all' ? '' : statusFilter
    });
  }, [yearFilter, statusFilter, onFiltersChange]);

  const clearFilters = () => {
    setYearFilter('all');
    setStatusFilter('all');
  };

  const hasActiveFilters = yearFilter !== 'all' || statusFilter !== 'all';

  return (
    <Card className="w-full mb-4">
      <CardContent className="pt-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium whitespace-nowrap">기준년도:</label>
              <Select value={yearFilter} onValueChange={setYearFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="전체" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  {uniqueYears.map(year => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium whitespace-nowrap">진행상태:</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="전체" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  {uniqueStatuses.map(status => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {hasActiveFilters && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">활성 필터:</span>
                {yearFilter !== 'all' && (
                  <Badge variant="secondary" className="text-xs">
                    기준년도: {yearFilter}
                  </Badge>
                )}
                {statusFilter !== 'all' && (
                  <Badge variant="secondary" className="text-xs">
                    상태: {statusFilter}
                  </Badge>
                )}
              </div>
            )}
          </div>

          {hasActiveFilters && (
            <div className="flex items-center gap-2">
              <div className="h-4 w-px bg-gray-300"></div>
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="h-8 px-3 border-orange-200 text-orange-700 hover:bg-orange-50 hover:border-orange-300 hover:text-orange-800 transition-all duration-200 shadow-sm hover:shadow-md group"
              >
                <X className="h-4 w-4 mr-1.5 group-hover:rotate-90 transition-transform duration-200" />
                <span className="font-medium">필터 초기화</span>
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 