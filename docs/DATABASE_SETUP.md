# Neon PostgreSQL 데이터베이스 설정 가이드

## 1. Neon PostgreSQL 계정 생성

1. [Neon Console](https://console.neon.tech/)에 접속
2. 계정 생성 및 로그인
3. 새 프로젝트 생성
4. 데이터베이스 생성

## 2. 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용을 추가:

```env
# Neon PostgreSQL Database URL
DATABASE_URL="postgresql://username:password@hostname:port/database"
```

Neon Console에서 제공하는 연결 문자열을 복사하여 사용하세요.

## 3. 데이터베이스 마이그레이션

### 마이그레이션 파일 생성
```bash
npm run db:generate
```

### 마이그레이션 실행
```bash
npm run db:migrate
```

### 데이터베이스 스튜디오 실행 (선택사항)
```bash
npm run db:studio
```

## 4. 사용 가능한 스크립트

- `npm run db:generate`: 마이그레이션 파일 생성
- `npm run db:migrate`: 마이그레이션 실행
- `npm run db:studio`: Drizzle Studio 실행 (데이터베이스 관리 UI)

## 5. 데이터베이스 스키마

### katia_companies 테이블
- `id`: 자동 증가 기본키
- `number`: 시행사 번호
- `company_name`: 회사명
- `representative`: 대표자명
- `address`: 등록지
- `phone`: 연락처
- `created_at`: 생성일시
- `updated_at`: 수정일시

## 6. 기능 설명

### 초기 실행
- 데이터베이스에 데이터가 없으면 자동으로 KATIA 사이트에서 크롤링
- 크롤링한 데이터를 데이터베이스에 저장

### 이후 실행
- 저장된 데이터를 데이터베이스에서 조회하여 표시
- "새로고침" 버튼으로 강제 크롤링 가능

### 데이터 업데이트
- 새로고침 시 기존 데이터 삭제 후 새 데이터 저장
- 실시간 크롤링과 저장된 데이터 구분 표시 