# 건축현장 관리도구 (Construction Site Manager)

건축현장을 효율적으로 관리하기 위한 웹 애플리케이션입니다. 신도시/택지지구 개발 건설현장 정보를 수집하고, 현장 관계자에게 콜드메일 발송을 위한 연락처 정보를 제공합니다.

## 🚀 주요 기능

### 📊 통계 대시보드
- 전체 현장수, 매치공 현장, 6개월 내 준공사업 현장 통계
- 클릭 시 교환 조건으로 복귀

### 🔍 신도시 현장 조회 (가장 중요)
- 전국 신도시/택지지구 개발 건설 확인 및 표시공 현장 검색
- 현장소장, 공무팀장, 현장사무실 등의 연락처, e-mail 정보 제공
- 준공예정일, 상태별 복귀 및 종료
- CSV/Excel 다운로드 지원

### 🎯 현장관리
- 관심있는 현장을 등록하여 관리
- 다운로드 및 삭제 기능
- 위치 저장 자동 저장

### 🔍 상세정보 조회
다양한 공공데이터 API를 연계하여 종합적인 현장 정보를 제공합니다:

#### KISCON 공개데이터 API 연계
- 건설회사 상세정보 (사업자등록번호, 대표자명, 주소업체, 등록종)
- 건설업 등록증 정보 (등록번호, 등록일자, 유효기간)
- 건설실적 (공사명, 발주기관, 계약금액)

#### 생활안전지도 API 연계
- 위치 기반 안전정보
- 건설 현장 조치 500m 내 위험 시설물 위치
- 긴급 신청 기관/소방서 접근 경로 정보

#### 건설사업정보시스템 OpenAPI
- 설계도서 연계 (전체적인 도면/단면도 등 디지털 설계파일)
- 건설감리보고서 주요 항목 (공정관리, 자재검수)
- 시설유지관리 (준공 후 5년 유지보수 이력)

#### 지역별 건설현장 API
- 공사장 진행률 (착공~준공 단계)
- 환경측정 데이터 (소음/진동/분진)
- 교통통제 계획 정보

## 🛠 기술 스택

- **Frontend**: Next.js 15, React 18, TypeScript
- **UI**: Tailwind CSS, shadcn/ui
- **State Management**: React Hooks
- **Build Tool**: Turbopack
- **APIs**: 공개데이터포털 API 연계

## 📦 설치 및 실행

### 1. 의존성 설치
```bash
npm install
```

### 2. 환경 변수 설정
프로젝트 루트에 `.env.local` 파일을 생성하고 API 키를 설정하세요:

```env
NEXT_PUBLIC_NEWTOWN_API_KEY=여기에_발급받은_API_키_입력
NEXT_PUBLIC_KISCON_API_KEY=여기에_발급받은_API_키_입력
NEXT_PUBLIC_SAFETY_API_KEY=여기에_발급받은_API_키_입력
NEXT_PUBLIC_CONSTRUCTION_API_KEY=여기에_발급받은_API_키_입력
NEXT_PUBLIC_REGIONAL_API_KEY=여기에_발급받은_API_키_입력
```

자세한 API 설정 방법은 [API_SETUP.md](./docs/API_SETUP.md)를 참조하세요.

### 3. 개발 서버 실행
```bash
npm run dev
```

### 4. 프로덕션 빌드
```bash
npm run build
npm start
```

## 🔑 API 설정

실제 공개 데이터를 조회하려면 API 키가 필요합니다.

### API 키 발급 절차
1. [공개데이터포털](https://www.data.go.kr) 로그인 및 회원가입
2. 다음 API 신청:
   - 신도시 현장 조회 서비스
   - KISCON 건설업체정보 서비스
   - 생활안전지도 API
   - 건설사업정보시스템 OpenAPI
   - 지역별 건설현장 API

### API 상태 확인
상세정보 팝업에서 각 API의 연계 상태를 확인할 수 있습니다:
- 🟢 **연결됨**: 실제 API 데이터
- 🟡 **모의**: 테스트 데이터 (API 키 미설정 또는 캐싱 대기)
- 🔴 **실패**: API 호출 실패

## 📁 프로젝트 구성

```
construction-site-manager/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx          # 루트 레이아웃
│   │   ├── page.tsx            # 메인 페이지
│   │   └── globals.css         # 전역 스타일
│   ├── components/             # React 컴포넌트
│   │   ├── ui/                 # shadcn/ui 컴포넌트
│   │   ├── dashboard/          # 대시보드 관련 컴포넌트
│   │   ├── search/             # 검색 관련 컴포넌트
│   │   ├── project/            # 프로젝트 관리 컴포넌트
│   │   ├── detail/             # 상세정보 컴포넌트
│   │   └── api/                # API 상태 관리 컴포넌트
│   ├── lib/                    # 유틸리티 및 API
│   │   ├── api/                # API 서비스
│   │   ├── types/              # TypeScript 타입 정의
│   │   └── utils/              # 유틸리티 함수
│   └── hooks/                  # 커스텀 React Hooks
├── docs/                       # 문서
│   └── API_SETUP.md           # API 설정 가이드
└── README.md
```

## 🎯 활용 방법

### 1. 현장 검색
1. "전체현장조회" 버튼 클릭
2. 조건 설정 (준공예정일, 상태)
3. 테이블 헤더 클릭으로 정렬

### 2. 관심 현장 등록
1. 검색결과에서 "타겟 추가" 버튼 클릭
2. 또는 수동입력에서 직접 등록

### 3. 상세정보 조회
1. "상세보기" 버튼 클릭
2. 5개 탭으로 구분된 종합 정보 확인:
   - **KISCON**: 건설업체 정보 및 실적
   - **안전정보**: 위험시설 및 긴급시설
   - **건설정보**: 설계도서 및 감리보고서
   - **지역정보**: 건설진행률 및 환경측정
   - **통계**: 지역별 건설공사 통계

### 4. 데이터 다운로드
- CSV/Excel 형식으로 현장 목록 다운로드
- 필터링된 결과만 다운로드 가능

## 🔧 개발 정보

### 구성 요소
- `page.tsx`: 메인 페이지, 상태 관리 및 이벤트 처리
- 각 기능별 컴포넌트: 소속 구성 요소
- `api/index.ts`: 확장 가능한 API 서비스 클래스 구조

### 데이터 처리
- 공개데이터포털 API 호출
- 응답 데이터 표준화 및 타입 변환
- 컴포넌트별 상태 관리
- 로컬 스토리지 자동 저장

### 오류 처리
- API 키 미설정 시 모의 데이터 제공
- 지속적 오류 시 Graceful Fallback
- 사용자 친화적인 오류 메시지

## 🚧 향후 개발 계획

- [ ] 실제 API 연동 구현
- [ ] 지도 기반 현장 위치 표시
- [ ] 현장 알림 설정
- [ ] 모바일 앱 버전
- [ ] 데이터 분석 및 인사이트 제공

## 📄 라이선스

MIT 라이선스

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 문의

프로젝트에 대한 문의사항이 있으시면 이슈를 생성해 주세요.
