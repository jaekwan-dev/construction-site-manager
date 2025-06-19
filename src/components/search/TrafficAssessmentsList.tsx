'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Loader2, RefreshCw, FileText, Database, Globe, Calendar } from 'lucide-react';

interface TrafficAssessmentInfo {
  id: number;
  number: string;
  projectName: string;
  year: string;
  businessOwner: string;
  assessmentAgency: string;
  approvalAuthority: string;
  location: string;
  status: string;
  projectId: string;
  createdAt: string;
  updatedAt: string;
}

interface TrafficAssessmentResponse {
  success: boolean;
  assessments: TrafficAssessmentInfo[];
  totalCount: number;
  message: string;
  isNewData?: boolean;
  dbConnected?: boolean;
  searchPeriod?: string;
  error?: string;
}

export default function TrafficAssessmentsList() {
  const [assessments, setAssessments] = useState<TrafficAssessmentInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isNewData, setIsNewData] = useState(false);
  const [dbConnected, setDbConnected] = useState(false);
  const [searchPeriod, setSearchPeriod] = useState<string>('');

  const fetchTrafficAssessments = async (forceCrawl = false) => {
    setLoading(true);
    setError(null);
    setProgress(0);
    
    try {
      const url = forceCrawl 
        ? '/api/traffic-assessments?action=crawl'
        : '/api/traffic-assessments';
      
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
      const data: TrafficAssessmentResponse = await response.json();

      clearInterval(progressInterval);
      setProgress(100);

      if (data.success) {
        setAssessments(data.assessments);
        setLastUpdated(new Date());
        setIsNewData(data.isNewData || false);
        setDbConnected(data.dbConnected || false);
        setSearchPeriod(data.searchPeriod || '');
      } else {
        setError(data.error || '교통영향평가 자료를 가져오는데 실패했습니다.');
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
    fetchTrafficAssessments(true); // 강제 크롤링
  };

  useEffect(() => {
    fetchTrafficAssessments(); // 초기 로드 시 저장된 데이터 조회
  }, []);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case '완료':
        return 'default';
      case '진행중':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-green-600" />
            <CardTitle>교통영향평가 자료</CardTitle>
            <Badge variant="secondary">
              총 {assessments.length}개 사업
            </Badge>
            {isNewData && (
              <Badge variant="outline" className="text-green-600 border-green-600">
                <Globe className="h-3 w-3 mr-1" />
                실시간 크롤링
              </Badge>
            )}
            {!isNewData && assessments.length > 0 && (
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
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            새로고침
          </Button>
        </div>
        
        {searchPeriod && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>검색 기간: {searchPeriod}</span>
          </div>
        )}
        
        {lastUpdated && (
          <p className="text-sm text-muted-foreground">
            마지막 업데이트: {lastUpdated.toLocaleString('ko-KR')}
            {!isNewData && assessments.length > 0 && (
              <span className="ml-2 text-blue-600">
                (저장된 데이터에서 조회)
              </span>
            )}
          </p>
        )}
      </CardHeader>

      <CardContent>
        {loading && (
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              {isNewData ? '교통영향평가정보지원시스템에서 자료를 수집하고 있습니다...' : '데이터를 불러오는 중...'}
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        )}

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {!loading && assessments.length > 0 && (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">번호</TableHead>
                  <TableHead>사업명</TableHead>
                  <TableHead className="w-20">기준년도</TableHead>
                  <TableHead className="w-24">사업자</TableHead>
                  <TableHead className="w-24">평가대행업체</TableHead>
                  <TableHead className="w-24">승인관청</TableHead>
                  <TableHead className="w-20">위치</TableHead>
                  <TableHead className="w-20">진행상태</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assessments.map((assessment) => (
                  <TableRow key={assessment.id}>
                    <TableCell className="font-medium">
                      {assessment.number}
                    </TableCell>
                    <TableCell className="font-medium max-w-xs truncate" title={assessment.projectName}>
                      {assessment.projectName}
                    </TableCell>
                    <TableCell>{assessment.year}</TableCell>
                    <TableCell className="max-w-xs truncate" title={assessment.businessOwner}>
                      {assessment.businessOwner}
                    </TableCell>
                    <TableCell className="max-w-xs truncate" title={assessment.assessmentAgency}>
                      {assessment.assessmentAgency}
                    </TableCell>
                    <TableCell className="max-w-xs truncate" title={assessment.approvalAuthority}>
                      {assessment.approvalAuthority}
                    </TableCell>
                    <TableCell className="max-w-xs truncate" title={assessment.location}>
                      {assessment.location}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(assessment.status)}>
                        {assessment.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {!loading && assessments.length === 0 && !error && (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>교통영향평가 자료가 없습니다.</p>
            <p className="text-sm mt-2">새로고침 버튼을 클릭하여 데이터를 수집하세요.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 