# 환경 변수 설정 가이드

## 개요
건축현장 관리도구를 실행하기 위해 필요한 환경 변수를 설정하는 방법을 안내합니다.

## 1. .env.local 파일 생성

프로젝트 루트 디렉토리에 `.env.local` 파일을 생성하세요:

```bash
# Windows
echo. > .env.local

# macOS/Linux
touch .env.local
```

## 2. 환경 변수 설정

`.env.local` 파일에 다음 내용을 추가하세요:

```env
# 공개데이터포털 API 키 설정
# 실제 API 키를 발급받아 아래에 입력하세요

# 신도시 현장 조회 API
NEXT_PUBLIC_NEWTOWN_API_KEY=

# KISCON 건설업체정보 API
NEXT_PUBLIC_KISCON_API_KEY=

# 생활안전지도 API
NEXT_PUBLIC_SAFETY_API_KEY=

# 건설사업정보시스템 API
NEXT_PUBLIC_CONSTRUCTION_API_KEY=

# 지역별 건설현장 API
NEXT_PUBLIC_REGIONAL_API_KEY=

# 개발 환경 설정
NODE_ENV=development
```

## 3. API 키 발급 방법

### 3.1 공개데이터포털 회원가입
1. [공개데이터포털](https://www.data.go.kr) 접속
2. 우측 상단 "회원가입" 클릭
3. 필수 정보 입력 후 가입 완료

### 3.2 API 신청
1. 로그인 후 "API 신청" 메뉴 클릭
2. 다음 API 서비스별로 신청:
   - 신도시 현장 조회 서비스
   - KISCON 건설업체정보 서비스
   - 생활안전지도 API
   - 건설사업정보시스템 OpenAPI
   - 지역별 건설현장 API
3. 신청 사유 작성 (예: "건축현장 관리도구 개발을 위한 데이터 활용")
4. 승인 대기 (보통 1-2일 소요)

### 3.3 API 키 확인
1. "마이페이지" → "API 관리" 메뉴
2. 승인된 API 목록에서 키 확인
3. 복사하여 `.env.local` 파일에 붙여넣기

## 4. 개발 서버 재시작

환경 변수를 설정한 후 개발 서버를 재시작하세요:

```bash
npm run dev
```

## 5. 모의 데이터 사용

API 키가 설정되지 않은 경우, 애플리케이션은 모의 데이터를 제공합니다.
이를 통해 API 키 없이도 기능을 테스트할 수 있습니다.

## 6. 주의사항

1. **보안**: `.env.local` 파일은 절대 Git에 커밋하지 마세요
2. **파일 위치**: `.env.local` 파일은 프로젝트 루트 디렉토리에 있어야 합니다
3. **변수명**: `NEXT_PUBLIC_` 접두사가 붙은 변수만 클라이언트에서 접근 가능합니다
4. **재시작**: 환경 변수 변경 후 개발 서버를 재시작해야 합니다

## 7. 문제 해결

### API 키가 인식되지 않는 경우
1. `.env.local` 파일이 프로젝트 루트에 있는지 확인
2. 환경 변수명이 정확한지 확인
3. 개발 서버 재시작

### API 호출 실패 시
1. API 키가 올바른지 확인
2. 일일 호출 제한을 초과하지 않았는지 확인
3. 네트워크 연결 상태 확인
4. API 서비스 상태 확인

## 8. 예시 .env.local 파일

```env
# 실제 API 키 예시 (실제 키로 교체하세요)
NEXT_PUBLIC_NEWTOWN_API_KEY=abc123def456ghi789
NEXT_PUBLIC_KISCON_API_KEY=xyz789uvw123abc456
NEXT_PUBLIC_SAFETY_API_KEY=def456ghi789jkl012
NEXT_PUBLIC_CONSTRUCTION_API_KEY=mno345pqr678stu901
NEXT_PUBLIC_REGIONAL_API_KEY=vwx234yza567bcd890

NODE_ENV=development
```

## 9. 추가 지원

환경 변수 설정에 문제가 있거나 추가 지원이 필요한 경우:
- 공개데이터포털 고객센터: 02-2133-4274
- 이메일: support@data.go.kr 