const fetch = require('node-fetch');

async function crawlKatia() {
  console.log('🚀 KATIA 시행사 정보 크롤링 시작...');
  
  try {
    const response = await fetch('http://localhost:3000/api/katia-crawl', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('✅ 크롤링 완료!');
      console.log(`📊 총 ${data.totalCount}개 시행사 정보 수집`);
      console.log(`💾 데이터베이스 저장: ${data.dbConnected ? '성공' : '실패'}`);
      console.log(`⏰ 완료 시간: ${data.timestamp}`);
      
      if (data.dbConnected) {
        console.log('🎉 데이터베이스에 성공적으로 저장되었습니다!');
        console.log('이제 웹사이트에서 저장된 데이터를 빠르게 조회할 수 있습니다.');
      } else {
        console.log('⚠️ 데이터베이스 저장에 실패했습니다.');
        console.log('환경 변수 DATABASE_URL을 설정하고 다시 시도해주세요.');
      }
    } else {
      console.error('❌ 크롤링 실패:', data.error);
    }
  } catch (error) {
    console.error('❌ API 호출 실패:', error.message);
    console.log('개발 서버가 실행 중인지 확인해주세요: npm run dev');
  }
}

// 스크립트 실행
crawlKatia(); 