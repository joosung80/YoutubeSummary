# YouTube Summary App

AI를 활용한 YouTube 동영상 자막 추출 및 요약 애플리케이션입니다.

![YouTube Summary App 스크린샷](docs/screenshot.png)

## ✨ 주요 기능

- 🎬 **YouTube URL 자막 추출** - Supadata API 사용
- 🤖 **AI 기반 요약 생성** - Gemini 2.5 Flash 모델 사용
- 📊 **다양한 요약 형식**
  - **General**: 마크다운 형식의 체계적 요약
  - **SCQA**: 컨설팅 스타일의 8슬라이드 구조
  - **Full Report**: 상세 분석 리포트
- 🌙 **다크모드 지원**
- 📱 **반응형 디자인**

## 📺 사용 예시

YouTube URL 예시: https://youtu.be/3TMnDCv4IN0

1. 위 URL을 입력란에 붙여넣기
2. '자막추출' 버튼 클릭
3. 추출된 자막을 바탕으로 AI 요약 생성

## 🚀 빠른 시작

### 사전 요구사항

다음 API 키가 필요합니다:
- **Gemini API Key**: [Google AI Studio](https://ai.google.dev/)에서 발급
- **Supadata API Key**: [Supadata](https://supadata.ai/)에서 발급

## 📦 설치 및 실행 방법

### 1️⃣ 로컬 개발 환경

```bash
# 1. 저장소 클론
git clone <repository-url>
cd YoutubeSummary

# 2. 의존성 설치
npm install

# 3. 환경변수 설정
cp .env.example .env
# .env 파일을 열어 API 키 입력

# 4. 개발 서버 실행
npm run dev
```

**환경변수 설정 (.env 파일):**
```bash
# Gemini AI API Key (필수)
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# Supadata API Key (필수)
VITE_SUPADATA_API_KEY=your_supadata_api_key_here
```

### 2️⃣ Docker로 실행

#### 방법 A: Docker Compose 사용 (권장)

```bash
# 1. 환경변수 설정
cp .env.example .env
# .env 파일에 API 키 입력

# 2. 빌드 및 실행
docker-compose -f docker-compose.prod.yml up -d

# 3. 접속
# http://localhost:4500
```

#### 방법 B: Docker 단독 실행

```bash
# 빌드
docker build -t youtube-summary \
  --build-arg VITE_GEMINI_API_KEY=your_gemini_key \
  --build-arg VITE_SUPADATA_API_KEY=your_supadata_key \
  -f Dockerfile.standalone .

# 실행
docker run -d -p 4500:80 youtube-summary

# 또는 환경변수로 실행
docker run -d -p 4500:80 \
  -e VITE_GEMINI_API_KEY=your_gemini_key \
  -e VITE_SUPADATA_API_KEY=your_supadata_key \
  youtube-summary
```

## 🔧 프로덕션 배포

### Docker Hub에서 실행

```bash
# Docker Hub에서 이미지 pull (예시)
docker pull your-username/youtube-summary:latest

# 환경변수와 함께 실행
docker run -d -p 4500:80 \
  -e VITE_GEMINI_API_KEY=your_gemini_key \
  -e VITE_SUPADATA_API_KEY=your_supadata_key \
  your-username/youtube-summary:latest
```

### 커스텀 포트 설정

```bash
# 포트 변경 (예: 8080)
PORT=8080 docker-compose -f docker-compose.prod.yml up -d
```

## 🔒 보안 및 환경변수

### 환경변수 우선순위
1. 런타임 환경변수
2. `.env` 파일
3. 빌드타임 ARG

### 보안 권장사항
- 프로덕션에서는 `.env` 파일을 버전 관리에 포함하지 마세요
- API 키는 환경변수로 관리하세요
- Docker 이미지에 API 키를 하드코딩하지 마세요

## 📁 프로젝트 구조

```
YoutubeSummary/
├── src/
│   ├── components/          # React 컴포넌트
│   │   ├── ConfigStatus.tsx # 설정 상태 표시
│   │   ├── TranscriptPanel.tsx
│   │   └── ReportPanel.tsx
│   ├── lib/                 # 유틸리티 및 API
│   │   ├── config.ts        # 환경변수 검증
│   │   ├── llm.ts          # Gemini AI 연동
│   │   ├── supadata.ts     # Supadata API 연동
│   │   └── youtube.ts      # YouTube 유틸리티
│   └── App.tsx
├── .env.example            # 환경변수 템플릿
├── docker-compose.yml      # 개발용 Docker Compose
├── docker-compose.prod.yml # 프로덕션용 Docker Compose
├── Dockerfile              # 표준 Dockerfile
├── Dockerfile.standalone   # 독립 실행용 Dockerfile
└── nginx.conf             # Nginx 설정
```

## 🛠️ 개발

### 빌드
```bash
npm run build
```

### 린트
```bash
npm run lint
```

### 프리뷰
```bash
npm run preview
```

## 🐞 문제 해결

### API 키 관련 오류
애플리케이션에서 빨간색 경고가 표시되면:
1. `.env` 파일이 존재하는지 확인
2. API 키가 올바르게 설정되었는지 확인
3. API 키가 유효한지 확인

### Docker 빌드 실패
```bash
# 캐시 없이 다시 빌드
docker-compose -f docker-compose.prod.yml build --no-cache
```

### 포트 충돌
```bash
# 사용 중인 포트 확인
sudo netstat -tlnp | grep :4500

# 다른 포트 사용
PORT=8080 docker-compose -f docker-compose.prod.yml up -d
```

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 🤝 기여하기

1. Fork 프로젝트
2. Feature 브랜치 생성 (`git checkout -b feature/AmazingFeature`)
3. 변경사항 커밋 (`git commit -m 'Add some AmazingFeature'`)
4. 브랜치에 Push (`git push origin feature/AmazingFeature`)
5. Pull Request 생성

## 📞 지원

문제가 발생하면 [Issues](repository-issues-url)에 등록해 주세요.