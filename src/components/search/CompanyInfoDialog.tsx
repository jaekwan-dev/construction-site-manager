'use client';

import { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Building2, User, MapPin, Phone, ExternalLink } from 'lucide-react';

interface CompanyInfo {
  number: string;
  companyName: string;
  representative: string;
  address: string;
  phone: string;
  linkIdx?: string;
}

interface CompanyInfoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  companyName: string;
}

export default function CompanyInfoDialog({ isOpen, onClose, companyName }: CompanyInfoDialogProps) {
  const [companies, setCompanies] = useState<CompanyInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCompanyInfo = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/company-info?name=${encodeURIComponent(companyName)}`);
      const data = await response.json();

      if (data.success) {
        setCompanies(data.companies);
      } else {
        setError(data.error || '업체 정보를 찾을 수 없습니다.');
      }
    } catch {
      setError('업체 정보를 가져오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [companyName]);

  useEffect(() => {
    if (isOpen && companyName) {
      fetchCompanyInfo();
    }
  }, [isOpen, companyName, fetchCompanyInfo]);

  const handleClose = () => {
    setCompanies([]);
    setError(null);
    onClose();
  };

  // KATIA 사이트 URL 생성 (link_idx 사용)
  const getKatiaUrl = (company: CompanyInfo) => {
    if (company.linkIdx) {
      // link_idx가 있으면 상세 페이지로 연결
      return `https://www.katia.or.kr/work/member_manage.php?search_order=&mode=v&premode=&code=member_manage&category=&idx=${company.linkIdx}&fk_idx=&thisPageNum=1&Dosearch=`;
    } else {
      // link_idx가 없으면 검색 페이지로 연결
      const encodedCompanyName = encodeURIComponent(company.companyName);
      return `https://www.katia.or.kr/work/member_manage.php?code=member_manage&category=&Dosearch=company&search_order=${encodedCompanyName}`;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-blue-600" />
            평가대행업체 정보
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            검색어: <span className="font-medium">{companyName}</span>
          </p>
        </DialogHeader>

        <div className="space-y-4">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <span className="ml-2 text-muted-foreground">업체 정보를 검색하고 있습니다...</span>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
              <div className="mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(`https://www.katia.or.kr/work/member_manage.php?code=member_manage&category=&Dosearch=company&search_order=${encodeURIComponent(companyName)}`, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  KATIA 공식 사이트에서 확인
                </Button>
              </div>
            </div>
          )}

          {!loading && !error && companies.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>해당 업체의 정보를 찾을 수 없습니다.</p>
              <p className="text-sm mt-2">KATIA 공식 사이트에서 직접 확인해보세요.</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => window.open(`https://www.katia.or.kr/work/member_manage.php?code=member_manage&category=&Dosearch=company&search_order=${encodeURIComponent(companyName)}`, '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                KATIA 사이트 방문
              </Button>
            </div>
          )}

          {!loading && !error && companies.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {companies.length}개 업체 발견
                </Badge>
              </div>
              
              {companies.map((company, index) => (
                <Card key={index} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg text-blue-600">
                            {company.companyName}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            등록번호: {company.number}
                            {company.linkIdx && (
                              <span className="ml-2">
                                | Link ID: <Badge variant="outline" className="text-xs">{company.linkIdx}</Badge>
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="flex items-start gap-2">
                          <User className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium">대표자</p>
                            <p className="text-sm text-muted-foreground">{company.representative || '정보 없음'}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-2">
                          <Phone className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium">연락처</p>
                            <p className="text-sm text-muted-foreground">{company.phone || '정보 없음'}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium">주소</p>
                          <p className="text-sm text-muted-foreground">{company.address || '정보 없음'}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              <div className="text-center pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-3">
                  더 자세한 정보는 KATIA 공식 사이트에서 확인하세요
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    // 첫 번째 회사의 link_idx를 사용하거나, 없으면 검색 페이지로
                    const firstCompany = companies[0];
                    window.open(getKatiaUrl(firstCompany), '_blank');
                  }}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  KATIA 사이트 방문
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 