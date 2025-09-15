## YouTube Summary App

### 환경변수
- `.env.local` 파일 생성:
```
VITE_SUPADATA_API_KEY=your_supadata_key
VITE_GEMINI_API_KEY=your_gemini_key
```

### 개발 서버 실행
```
npm run dev
```

### 기능
- YouTube URL 자막 추출 (Supadata)
- 자막 기반 요약: General / SCQA / Full Report (Gemini 2.5 Flash)
