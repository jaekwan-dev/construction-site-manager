'use client';

// import { NewtownSearch } from '@/components/search/NewtownSearch';
// import { TrafficAssessmentSearch } from '@/components/search/TrafficAssessmentSearch';
import KatiaCompaniesList from '@/components/search/KatiaCompaniesList';
import TrafficAssessmentsList from '@/components/search/TrafficAssessmentsList';

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8">
          건축현장 관리도구
        </h1>
        <p className="text-center text-muted-foreground mb-8">
          신도시/택지지구 개발 건설현장 정보를 효율적으로 관리하세요
        </p>
        
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
      </div>
    </main>
  );
}
