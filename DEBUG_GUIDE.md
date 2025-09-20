# 🐛 YouTube Summary 디버깅 가이드

## 📋 개요

유튜브 자막 추출 기능의 문제를 진단하고 해결하기 위해 강화된 디버깅 시스템이 추가되었습니다.

## 🔍 디버깅 기능

### 1. 웹 콘솔 로그
브라우저 개발자 도구(F12)의 콘솔 탭에서 다음과 같은 상세 로그를 확인할 수 있습니다:

#### 🚀 앱 초기화 로그
```
🚀 [App] YouTube Summary 앱 초기화
🔧 [Config] 환경변수 검증 시작
🔍 [Config] 환경변수 상태 확인
```

#### 🎬 자막 추출 프로세스 로그
```
🚀 [TranscriptPanel] 자막 추출 프로세스 시작
🔍 [YouTube] 비디오 ID 추출 시도
📝 [YouTube] URL 파싱 성공
🎬 [Supadata] 자막 추출 시작
🔑 [Supadata] API Key 상태
📡 [Supadata] 요청 URL
⏱️ [Performance] Supadata 자막 추출 API 시작
✅ [Supadata] 자막 추출 성공
```

#### ❌ 에러 로그
```
❌ [Error Report] Supadata 자막 추출
📡 [Supadata] HTTP 에러 상세
```

### 2. 디버그 패널 (UI)
웹 페이지 우측 하단의 🐛 버튼을 클릭하면 다음 정보를 확인할 수 있습니다:

- **환경 정보**: 배포 환경, URL, 온라인 상태
- **API 키 상태**: Gemini, Supadata API 키 설정 여부
- **네트워크 정보**: 연결 타입, 속도, RTT
- **브라우저 정보**: User Agent 정보

### 3. 성능 추적
각 API 호출의 응답 시간과 성능 메트릭을 실시간으로 모니터링합니다.

## 🚨 일반적인 문제 해결

### 1. API 키 문제
**증상**: "Missing required API keys" 에러
**해결방법**:
1. 환경변수 확인: `VITE_SUPADATA_API_KEY`가 설정되어 있는지 확인
2. 디버그 패널에서 API 키 상태 확인
3. API 키가 유효한지 확인 (만료되지 않았는지)

### 2. 네트워크 연결 문제
**증상**: 요청이 실패하거나 타임아웃
**해결방법**:
1. 디버그 패널에서 온라인 상태 확인
2. 콘솔에서 HTTP 에러 상세 정보 확인
3. Supadata API 서버 상태 확인

### 3. YouTube URL 형식 문제
**증상**: "유효하지 않은 YouTube URL" 에러
**해결방법**:
1. 콘솔에서 URL 파싱 로그 확인
2. 지원되는 URL 형식:
   - `https://www.youtube.com/watch?v=VIDEO_ID`
   - `https://youtu.be/VIDEO_ID`

### 4. 클립보드 복사 문제
**증상**: "Cannot read properties of undefined (reading 'writeText')" 에러
**해결방법**:
1. HTTPS 환경에서 접속 (HTTP에서는 클립보드 API 제한)
2. 디버그 패널에서 클립보드 지원 상태 확인
3. 브라우저가 클립보드 권한을 허용했는지 확인

### 5. CORS 문제
**증상**: "Access to fetch blocked by CORS policy" 에러
**해결방법**:
1. 브라우저 네트워크 탭에서 요청 헤더 확인
2. Supadata API 서버의 CORS 설정 확인

## 🔧 배포 환경에서의 디버깅

### dream.elanvital.ai:4500에서 디버깅하기

1. **브라우저 개발자 도구 열기**
   - Chrome/Edge: F12 또는 Ctrl+Shift+I
   - Firefox: F12 또는 Ctrl+Shift+K
   - Safari: Cmd+Option+I

2. **콘솔 탭으로 이동**
   - 페이지 로드 시 초기화 로그 확인
   - 자막 추출 시도 시 실시간 로그 모니터링

3. **디버그 패널 사용**
   - 우측 하단 🐛 버튼 클릭
   - 시스템 정보, API 키 상태, 클립보드 지원 상태 확인
   - "복사" 버튼으로 디버그 정보 복사하여 개발자에게 전달

4. **네트워크 탭 확인**
   - API 요청/응답 상세 정보 확인
   - 실패한 요청의 상태 코드 및 응답 내용 확인

## 📊 로그 해석 가이드

### 성공적인 자막 추출 로그 예시
```
🚀 [TranscriptPanel] 자막 추출 프로세스 시작
🔍 [YouTube] 비디오 ID 추출 시도: { url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" }
📝 [YouTube] URL 파싱 성공: { hostname: "www.youtube.com", videoId: "dQw4w9WgXcQ" }
🎬 [Supadata] 자막 추출 시작: { url: "...", lang: "ko", mode: "auto" }
🔑 [Supadata] API Key 상태: { hasApiKey: true, keyLength: 32 }
📡 [Supadata] 요청 URL: "https://api.supadata.ai/v1/transcript?..."
⏱️ [Performance] Supadata 자막 추출 API 시작
✅ [Supadata] 자막 추출 성공: { duration: "1234.56ms", contentLength: 5678 }
🎉 [TranscriptPanel] 자막 추출 프로세스 성공 완료
```

### 실패한 자막 추출 로그 예시
```
🚀 [TranscriptPanel] 자막 추출 프로세스 시작
❌ [YouTube] URL 파싱 실패: { url: "invalid-url", error: "Invalid URL" }
❌ [Error Report] Supadata 자막 추출: { status: 401, message: "Unauthorized" }
```

## 🛠️ 개발자를 위한 추가 정보

### 디버그 정보 수집
문제 발생 시 다음 정보를 수집하여 개발자에게 전달:

1. **디버그 패널의 전체 정보** (복사 버튼 사용)
2. **브라우저 콘솔의 에러 로그**
3. **네트워크 탭의 실패한 요청 정보**
4. **재현 단계**

### 환경변수 확인 명령어
```bash
# Docker 컨테이너 내부에서 환경변수 확인
docker exec -it youtube-summary-app env | grep VITE_
```

### 로그 레벨 조정
프로덕션 환경에서 로그를 줄이려면 `src/lib/debug.ts`에서 로그 레벨을 조정할 수 있습니다.

---

이 가이드를 통해 유튜브 자막 추출 문제를 효과적으로 진단하고 해결할 수 있습니다. 추가 문제가 발생하면 디버그 정보를 수집하여 개발팀에 문의하세요.
