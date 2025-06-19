'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Loader2, RefreshCw, Building2, Database, Globe } from 'lucide-react';

interface CompanyInfo {
  id: number;
  number: string;
  companyName: string;
  representative: string;
  address: string;
  phone: string;
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

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-blue-600" />
            <CardTitle>KATIA 시행사 정보</CardTitle>
            <Badge variant="secondary">
              총 {companies.length}개 업체
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

        {!loading && companies.length > 0 && (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">번호</TableHead>
                  <TableHead>회사명</TableHead>
                  <TableHead className="w-24">대표자</TableHead>
                  <TableHead>등록지</TableHead>
                  <TableHead className="w-32">연락처</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {companies.map((company) => (
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {!loading && companies.length === 0 && !error && (
          <div className="text-center py-8 text-muted-foreground">
            <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>시행사 정보가 없습니다.</p>
            <p className="text-sm mt-2">새로고침 버튼을 클릭하여 데이터를 수집하세요.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 