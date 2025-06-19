# API 설정 가이드

## 개요
건축현장 관리도구는 공개데이터포털의 다양한 API를 연계하여 현장 정보를 제공합니다.
실제 API 데이터를 사용하려면 각 서비스별로 API 키를 발급받아 설정해야 합니다.

## 필요한 API 키

### 1. 신도시 현장 조회 API
- **목적**: 전국 신도시/택지지구 개발 건설현장 정보 조회
- **발급처**: 공개데이터포털
- **신청 URL**: https://www.data.go.kr/data/15000581/openapi.do
- **환경변수**: `NEXT_PUBLIC_NEWTOWN_API_KEY`

### 2. KISCON 건설업체정보 API
- **목적**: 건설회사 상세정보, 건설업 등록증, 건설실적 조회
- **발급처**: 공개데이터포털
- **신청 URL**: https://www.data.go.kr/data/15000582/openapi.do
- **환경변수**: `NEXT_PUBLIC_KISCON_API_KEY`

### 3. 생활안전지도 API
- **목적**: 위치 기반 안전정보, 위험시설물 위치, 접근경로 정보
- **발급처**: 공개데이터포털
- **신청 URL**: https://www.data.go.kr/data/15000583/openapi.do
- **환경변수**: `NEXT_PUBLIC_SAFETY_API_KEY`

### 4. 건설사업정보시스템 API
- **목적**: 설계도서, 건설감리보고서, 시설유지관리 정보
- **발급처**: 공개데이터포털
- **신청 URL**: https://www.data.go.kr/data/15000584/openapi.do
- **환경변수**: `NEXT_PUBLIC_CONSTRUCTION_API_KEY`

### 5. 지역별 건설현장 API
- **목적**: 공사장 진행률, 환경측정 데이터, 교통통제 계획
- **발급처**: 공개데이터포털
- **신청 URL**: https://www.data.go.kr/data/15000585/openapi.do
- **환경변수**: `NEXT_PUBLIC_REGIONAL_API_KEY`

## API 키 설정 방법

### 1. 환경 변수 파일 생성
프로젝트 루트 디렉토리에 `.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```env
# 공개데이터포털 API 키 설정
NEXT_PUBLIC_NEWTOWN_API_KEY=여기에_발급받은_API_키_입력
NEXT_PUBLIC_KISCON_API_KEY=여기에_발급받은_API_키_입력
NEXT_PUBLIC_SAFETY_API_KEY=여기에_발급받은_API_키_입력
NEXT_PUBLIC_CONSTRUCTION_API_KEY=여기에_발급받은_API_키_입력
NEXT_PUBLIC_REGIONAL_API_KEY=여기에_발급받은_API_키_입력

# 개발 환경 설정
NODE_ENV=development
```

### 2. API 키 발급 절차

#### 2.1 공개데이터포털 회원가입
1. https://www.data.go.kr 접속
2. 우측 상단 "회원가입" 클릭
3. 필수 정보 입력 후 가입 완료

#### 2.2 API 신청
1. 로그인 후 "API 신청" 메뉴 클릭
2. 위의 각 API 서비스별로 신청
3. 신청 사유 작성 (예: "건축현장 관리도구 개발을 위한 데이터 활용")
4. 승인 대기 (보통 1-2일 소요)

#### 2.3 API 키 확인
1. "마이페이지" → "API 관리" 메뉴
2. 승인된 API 목록에서 키 확인
3. 복사하여 `.env.local` 파일에 붙여넣기

### 3. 개발 서버 재시작
API 키 설정 후 개발 서버를 재시작하세요:

```bash
npm run dev
```

## API 상태 확인

애플리케이션에서 각 API의 연결 상태를 확인할 수 있습니다:

- 🟢 **연결됨**: 실제 API 데이터 사용
- 🟡 **모의**: 테스트 데이터 사용 (API 키 미설정)
- 🔴 **실패**: API 호출 실패

## 모의 데이터

API 키가 설정되지 않은 경우, 애플리케이션은 모의 데이터를 제공합니다.
이를 통해 API 키 없이도 기능을 테스트할 수 있습니다.

## 주의사항

1. **API 키 보안**: `.env.local` 파일은 절대 Git에 커밋하지 마세요
2. **사용량 제한**: 각 API별로 일일 호출 제한이 있을 수 있습니다
3. **데이터 갱신**: API 데이터는 실시간이 아닐 수 있으니 참고하세요
4. **에러 처리**: API 호출 실패 시 모의 데이터로 자동 전환됩니다

## 문제 해결

### API 키가 인식되지 않는 경우
1. `.env.local` 파일이 프로젝트 루트에 있는지 확인
2. 환경 변수명이 정확한지 확인
3. 개발 서버 재시작

### API 호출 실패 시
1. API 키가 올바른지 확인
2. 일일 호출 제한을 초과하지 않았는지 확인
3. 네트워크 연결 상태 확인
4. API 서비스 상태 확인

## 추가 지원

API 설정에 문제가 있거나 추가 지원이 필요한 경우:
- 공개데이터포털 고객센터: 02-2133-4274
- 이메일: support@data.go.kr 