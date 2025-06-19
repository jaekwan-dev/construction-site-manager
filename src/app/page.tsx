'use client';

// import { NewtownSearch } from '@/components/search/NewtownSearch';
// import { TrafficAssessmentSearch } from '@/components/search/TrafficAssessmentSearch';
import KatiaCompaniesList from '@/components/search/KatiaCompaniesList';
import TrafficAssessmentsList from '@/components/search/TrafficAssessmentsList';
import KatiaCompaniesListMobile from '@/components/search/KatiaCompaniesListMobile';
import TrafficAssessmentsListMobile from '@/components/search/TrafficAssessmentsListMobile';
import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Building2, 
  FileText, 
  Globe, 
  Database, 
  Construction,
  MapPin,
  Calendar,
  Users
} from 'lucide-react';

export default function Home() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);

    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 섹션 */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl">
              <Construction className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              교통영향평가 및 시행사 자료 조회
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              교통영향평가 및 시행사 자료 정보를 효율적으로 조회하세요
          </p>
          
          {/* 기능 배지 */}
          <div className="flex items-center justify-center gap-3 mt-6">
            <Badge variant="outline" className="bg-white/80 backdrop-blur-sm border-blue-200 text-blue-700 px-4 py-2">
              <Globe className="h-4 w-4 mr-2" />
              실시간 크롤링
            </Badge>
            <Badge variant="outline" className="bg-white/80 backdrop-blur-sm border-green-200 text-green-700 px-4 py-2">
              <Database className="h-4 w-4 mr-2" />
              데이터 저장
            </Badge>
            <Badge variant="outline" className="bg-white/80 backdrop-blur-sm border-purple-200 text-purple-700 px-4 py-2">
              <Users className="h-4 w-4 mr-2" />
              업체 정보
            </Badge>
          </div>
        </div>

        {/* 서비스 소개 카드 */}
        <Card className="mb-8 bg-gradient-to-r from-white/80 to-blue-50/50 dark:from-slate-800/80 dark:to-slate-700/50 backdrop-blur-sm border-blue-200 dark:border-blue-800 shadow-lg">
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                  <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-200 mb-2">
                    교통영향평가 자료
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    교통영향평가정보지원시스템에서 &quot;약식&quot; 사업 자료를 실시간으로 수집하여 
                    사업명, 연도, 진행상태별로 필터링하고 검색할 수 있습니다.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/30 dark:to-green-900/20">
                <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-lg">
                  <Building2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-200 mb-2">
                    KATIA 시행사 정보
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    한국교통기술인협회(KATIA)에서 시행사 정보를 수집하여 
                    대표자, 연락처, 주소 등 상세 정보를 제공합니다.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/30 dark:to-purple-900/20">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                  <MapPin className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-200 mb-2">
                    위치 기반 검색
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    사업 위치와 업체 주소 정보를 통해 
                    지역별 건설현장 정보를 효율적으로 관리할 수 있습니다.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Separator className="my-8" />
        
        {isMobile ? (
          // 모바일 화면
          <div className="space-y-8">
            <TrafficAssessmentsListMobile />
            <KatiaCompaniesListMobile />
          </div>
        ) : (
          // 웹 화면
          <div className="space-y-8">            
            {/* 교통영향평가 자료 목록 */}
            <TrafficAssessmentsList />
            
            {/* KATIA 시행사 정보 */}
            <KatiaCompaniesList />
          </div>
        )}

        {/* 푸터 */}
        <div className="mt-16 text-center">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>마지막 업데이트: {new Date().toLocaleDateString('ko-KR')}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            © 2024 건축현장 관리도구. 모든 데이터는 공식 사이트에서 수집됩니다.
          </p>
        </div>
      </div>
    </main>
  );
}
