# Information Architecture (IA) - YouTube Summary App

## 1. 개요
이 문서는 YouTube Summary App의 정보 아키텍처를 정의합니다. 애플리케이션 내의 주요 정보 흐름, 데이터 구조, 그리고 사용자 인터페이스 요소 간의 관계를 설명합니다.

## 2. 주요 정보 엔티티

### 2.1. YouTube Video
- **ID**: YouTube 동영상 고유 ID
- **URL**: 동영상 원본 URL
- **Title**: 동영상 제목
- **Description**: 동영상 상세 설명
- **Channel Title**: 채널명
- **Published At**: 게시일
- **Duration**: 동영상 길이
- **View Count**: 조회수
- **Like Count**: 좋아요 수
- **Thumbnail**: 썸네일 이미지 URL

### 2.2. Transcript (자막)
- **Content**: 추출된 동영상 자막 텍스트
- **Language**: 자막 언어 (예: ko, en)
- **Available Languages**: 사용 가능한 자막 언어 목록

### 2.3. Report (요약 리포트)
- **Mode**: 요약 모드 (General, SCQA, Full Report)
- **Input Transcript**: 요약에 사용된 자막 원문
- **Generated Report**: LLM을 통해 생성된 요약 마크다운 텍스트
- **Generation Metadata**:
    - **Latency**: LLM 호출에 소요된 시간 (ms)
    - **Tokens**: 사용된 토큰 수 (입력, 출력, 총 토큰)

## 3. 정보 흐름

### 3.1. 사용자 입력 및 초기화
1. 사용자가 YouTube URL을 입력하고 '자막추출' 버튼 클릭.
2. 시스템은 현재 표시된 자막, 메타데이터, 리포트 데이터를 즉시 초기화.

### 3.2. 데이터 추출 및 표시
1. 입력된 URL에서 YouTube Video ID를 추출.
2. SupaData API를 통해 다음 두 가지 요청을 **병렬**로 수행:
    - **자막 추출**: `GET /v1/transcript` 호출하여 `Transcript` 정보 획득.
    - **메타데이터 조회**: `GET /v1/youtube/video` 호출하여 `YouTube Video` 메타 정보 획득.
3. 추출된 `YouTube Video` 메타 정보를 UI의 메타 섹션에 표시.
    - 썸네일, 제목, 채널, 게시일, 길이, 조회수, 좋아요 수를 라벨 형태로 표시.
    - 상세 설명은 별도 스크롤 영역에 표시.
4. 추출된 `Transcript` 내용을 좌측 하단 텍스트 박스에 표시하고, 글자 수를 계산하여 함께 표시.
5. `Transcript` 내용은 자동으로 우측 상단 리포트 입력 박스에 복사.

### 3.3. 리포트 생성 및 표시
1. 사용자가 우측 리포트 패널에서 요약 `Mode`를 선택 (기본: General Summary).
2. '리포트' 버튼 클릭 시, 선택된 `Mode`와 `Input Transcript`를 LLM(`gemini-2.5-flash`)에 전달.
3. LLM은 해당 `Mode`에 맞는 프롬프트 템플릿을 사용하여 `Generated Report`를 생성하고, `Generation Metadata`를 함께 반환.
4. 생성된 `Generated Report`는 우측 하단 리포트 박스에 마크다운 렌더링 뷰로 표시 (Preview 모드).
5. 사용자는 'Preview'/'Text' 버튼으로 뷰를 전환할 수 있음.
6. `Generation Metadata`(요약 길이, 소요 시간, 토큰 사용량)를 리포트 박스 하단에 표시.

## 4. 사용자 인터페이스 (UI) 요소

### 4.1. Header
- 앱 타이틀 ('YouTube Summary')

### 4.2. Left Panel (자막 추출)
- **YouTube URL Input**: 텍스트 입력 필드
- **자막추출 Button**: Primary 스타일
- **Video Metadata Section**:
    - 썸네일 (h-32 w-56)
    - 정보 라벨 (제목, 채널, 게시일, 길이, 조회수, 좋아요) - 이모지 및 컬러칩 포함
    - 상세 설명 (스크롤 가능)
- **Error Display**: API 오류 메시지
- **Transcript Textarea**: 추출된 자막 원문 (최대 50줄, 스크롤 가능)
- **자막 길이 Label**: 추출 자막 글자 수
- **복사(JSON) Button**: Secondary 스타일 (클릭 시 '복사됨' 피드백)

### 4.3. Right Panel (리포트)
- **Report Header**:
    - '리포트' 제목
    - 'Preview' / 'Text' Toggle Button
- **Mode Dropdown**: 요약 모드 선택 (General, SCQA, Full Report)
- **CLEAR Button**: 리포트 입력 초기화 (Ghost 스타일)
- **리포트 Button**: Primary 스타일
- **Report Input Textarea**: 자막 원문 자동 복사 영역 (최대 60줄, 스크롤 가능)
- **Error Display**: LLM 오류 메시지
- **Report Display Area**:
    - 마크다운 렌더링 뷰 (Preview 모드, 좌측 정렬, 줄 간격 최소화)
    - 텍스트 편집 뷰 (Text 모드, 최대 60줄, 스크롤 가능)
- **Report Metadata Label**: 요약 길이, 소요 시간, 토큰 사용량 (이모지 포함)
- **복사 Button**: Secondary 스타일 (클릭 시 '복사됨' 피드백)

### 4.4. Footer
- 저작권 또는 빌드 정보

## 5. 외부 서비스 연동
- **SupaData API**: YouTube 동영상 자막 추출 및 메타데이터 조회
- **Google Gemini API**: 동영상 자막 기반 요약 리포트 생성

---
