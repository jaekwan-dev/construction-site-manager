'use client';

// import { NewtownSearch } from '@/components/search/NewtownSearch';
// import { TrafficAssessmentSearch } from '@/components/search/TrafficAssessmentSearch';
import KatiaCompaniesList from '@/components/search/KatiaCompaniesList';
import TrafficAssessmentsList from '@/components/search/TrafficAssessmentsList';
import KatiaCompaniesListMobile from '@/components/search/KatiaCompaniesListMobile';
import TrafficAssessmentsListMobile from '@/components/search/TrafficAssessmentsListMobile';
import { useEffect, useState } from 'react';

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
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8">
          건축현장 관리도구
        </h1>
        <p className="text-center text-muted-foreground mb-8">
          신도시/택지지구 개발 건설현장 정보를 효율적으로 관리하세요
        </p>
        
        {isMobile ? (
          // 모바일 화면
          <div className="space-y-6">
            <TrafficAssessmentsListMobile />
            <KatiaCompaniesListMobile />
          </div>
        ) : (
          // 웹 화면
          <div className="space-y-8">
            {/* 신도시 현장 검색 */}
            {/* <NewtownSearch /> */}
            
            {/* 교통영향평가 자료 검색 */}
            {/* <TrafficAssessmentSearch /> */}
            
            {/* 교통영향평가 자료 목록 */}
            <TrafficAssessmentsList />
            
            {/* KATIA 시행사 정보 */}
            <KatiaCompaniesList />
          </div>
        )}
      </div>
    </main>
  );
}
