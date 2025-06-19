'use client';

// import { NewtownSearch } from '@/components/search/NewtownSearch';
import { TrafficAssessmentSearch } from '@/components/search/TrafficAssessmentSearch';
import KatiaCompaniesList from '@/components/search/KatiaCompaniesList';
import TrafficAssessmentsList from '@/components/search/TrafficAssessmentsList';

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8">
          교통영향평가 자료 및 시행사 조회
        </h1>
        <p className="text-center text-muted-foreground mb-8">
        교통영향평가 정보를 확인하고 시행사 정보를 조회하세요요
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
