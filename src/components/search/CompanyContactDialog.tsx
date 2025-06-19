'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { ExternalLink, Globe, Phone, MapPin, User } from 'lucide-react';

interface CompanyContactInfo {
  companyName: string;
  representative?: string;
  address?: string;
  phone?: string;
  website?: string;
  found: boolean;
  foundCompanies?: string[];
}

interface CompanyContactDialogProps {
  companyName: string;
  children: React.ReactNode;
}

export function CompanyContactDialog({ companyName, children }: CompanyContactDialogProps) {
  const [contactInfo, setContactInfo] = useState<CompanyContactInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const searchCompanyInfo = async () => {
    if (!open) return;
    
    setLoading(true);
    setError(null);

    try {
      // KATIA API 호출
      const response = await fetch(`/api/company-info?name=${encodeURIComponent(companyName)}`);

      console.log(`response`, response);
      
      if (!response.ok) {
        throw new Error('회사 정보를 가져오는데 실패했습니다.');
      }

      const data = await response.json();
      setContactInfo(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '회사 정보를 가져오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      searchCompanyInfo();
    }
  }, [open, companyName]);

  const handleWebsiteClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleKATIAClick = () => {
    // 평가대행업체명에서 "주식회사"와 공백 제거
    const searchKeyword = companyName
      .replace(/주식회사/g, '')  // "주식회사" 제거
      .replace(/\s+/g, '')      // 모든 공백 제거
      .trim();                  // 앞뒤 공백 제거
    
    const katiaUrl = `https://www.katia.or.kr/work/member_manage.php?code=member_manage&category=&Dosearch=company&search_order=${encodeURIComponent(searchKeyword)}`;
    window.open(katiaUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold flex items-center gap-2">
            <Globe className="h-5 w-5 text-blue-600" />
            {companyName}
          </DialogTitle>
          <DialogDescription>
            교통영향평가협회(KATIA)에서 제공하는 회사 정보입니다.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ) : contactInfo ? (
          <div className="space-y-4">
            {contactInfo.found ? (
              <>
                {/* 회사 정보 */}
                <div className="space-y-3">
                  {contactInfo.representative && (
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <div>
                        <span className="text-sm font-medium">대표자:</span>
                        <span className="text-sm ml-2">{contactInfo.representative}</span>
                      </div>
                    </div>
                  )}
                  
                  {contactInfo.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <div>
                        <span className="text-sm font-medium">연락처:</span>
                        <span className="text-sm ml-2">{contactInfo.phone}</span>
                      </div>
                    </div>
                  )}
                  
                  {contactInfo.address && (
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                      <div>
                        <span className="text-sm font-medium">주소:</span>
                        <div className="text-sm ml-2 mt-1">{contactInfo.address}</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 검색된 모든 회사 목록 */}
                {contactInfo.foundCompanies && contactInfo.foundCompanies.length > 0 && (
                  <div className="pt-2 border-t">
                    <div className="text-sm font-medium mb-2">검색된 회사 목록:</div>
                    <div className="space-y-1">
                      {contactInfo.foundCompanies.map((company, index) => (
                        <div key={index} className="text-sm text-gray-600">
                          • {company}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 웹사이트 및 KATIA 링크 */}
                <div className="space-y-2 pt-2 border-t">
                  {contactInfo.website && (
                    <Button
                      onClick={() => handleWebsiteClick(contactInfo.website!)}
                      variant="outline"
                      className="w-full"
                    >
                      <Globe className="h-4 w-4 mr-2" />
                      회사 웹사이트
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </Button>
                  )}
                  
                  <Button
                    onClick={handleKATIAClick}
                    variant="outline"
                    className="w-full"
                  >
                    <Globe className="h-4 w-4 mr-2" />
                    KATIA 상세정보
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </Button>
                </div>

                {/* 출처 표시 */}
                <div className="text-xs text-gray-500 text-center pt-2 border-t">
                  정보 출처: 교통영향평가협회(KATIA)
                </div>
              </>
            ) : (
              /* 정보를 찾지 못한 경우 */
              <div className="text-center space-y-4">
                <div className="text-gray-500">
                  KATIA에서 해당 업체 정보를 찾을 수 없습니다.
                </div>
                <div className="space-y-2">
                  <Button
                    onClick={handleKATIAClick}
                    variant="outline"
                    className="w-full"
                  >
                    <Globe className="h-4 w-4 mr-2" />
                    KATIA에서 검색
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </Button>
                  
                  {contactInfo.website && (
                    <Button
                      onClick={() => handleWebsiteClick(contactInfo.website!)}
                      variant="outline"
                      className="w-full"
                    >
                      <Globe className="h-4 w-4 mr-2" />
                      Google에서 검색
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
} 