'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Search, FileText } from 'lucide-react';
import { TrafficAssessmentFilters } from '@/lib/types';

interface SearchResult {
  id: number;
  projectName: string;
  year: string;
  company: string;
  assessmentCompany: string;
  approvalAuthority: string;
  location: string;
  status: string;
}

export function TrafficAssessmentSearch() {
  const [filters, setFilters] = useState<TrafficAssessmentFilters>({});
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const searchTrafficAssessments = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // 검색 로직 구현
      const response = await fetch('/api/traffic-assessments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(filters),
      });

      const data = await response.json();

      if (data.success) {
        setResults(data.assessments || []);
      } else {
        setError(data.error || '검색 중 오류가 발생했습니다.');
      }
    } catch {
      setError('네트워크 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    if (Object.keys(filters).length > 0) {
      searchTrafficAssessments();
    }
  }, [filters, searchTrafficAssessments]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-green-600" />
          교통영향평가 자료 검색
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="projectName">사업명</Label>
              <Input
                id="projectName"
                placeholder="사업명을 입력하세요"
                value={filters.projectName || ''}
                onChange={(e) => setFilters({ ...filters, projectName: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">사업자</Label>
              <Input
                id="company"
                placeholder="사업자를 입력하세요"
                value={filters.company || ''}
                onChange={(e) => setFilters({ ...filters, company: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">위치</Label>
              <Input
                id="location"
                placeholder="위치를 입력하세요"
                value={filters.location || ''}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={searchTrafficAssessments} 
              disabled={loading}
              className="flex-1"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Search className="h-4 w-4 mr-2" />
              )}
              검색
            </Button>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {results.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-muted-foreground mb-2">
                검색 결과: {results.length}개
              </p>
              {/* 결과 표시 로직 */}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 