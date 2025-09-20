#!/bin/bash

# YouTube Summary 디버깅 버전 배포 스크립트

set -e

echo "🚀 YouTube Summary 디버깅 버전 배포 시작..."

# 환경변수 확인
if [ -z "$VITE_GEMINI_API_KEY" ] || [ -z "$VITE_SUPADATA_API_KEY" ]; then
    echo "❌ 환경변수가 설정되지 않았습니다."
    echo "다음 환경변수를 설정해주세요:"
    echo "  - VITE_GEMINI_API_KEY"
    echo "  - VITE_SUPADATA_API_KEY"
    echo ""
    echo "예시:"
    echo "  export VITE_GEMINI_API_KEY=your_gemini_key"
    echo "  export VITE_SUPADATA_API_KEY=your_supadata_key"
    exit 1
fi

echo "✅ 환경변수 확인 완료"

# 기존 컨테이너 중지 및 제거
echo "🛑 기존 컨테이너 중지 중..."
docker-compose -f docker-compose.prod.yml down || true

# 이미지 빌드
echo "🔨 Docker 이미지 빌드 중..."
docker-compose -f docker-compose.prod.yml build --no-cache

# 컨테이너 시작
echo "🚀 컨테이너 시작 중..."
docker-compose -f docker-compose.prod.yml up -d

# 헬스체크 대기
echo "⏳ 서비스 시작 대기 중..."
sleep 10

# 서비스 상태 확인
if curl -f http://localhost:4500 > /dev/null 2>&1; then
    echo "✅ 배포 성공! 서비스가 http://localhost:4500 에서 실행 중입니다."
    echo ""
    echo "🐛 디버깅 방법:"
    echo "1. 브라우저에서 http://localhost:4500 접속"
    echo "2. F12로 개발자 도구 열기"
    echo "3. Console 탭에서 상세 로그 확인"
    echo "4. 우측 하단 🐛 버튼으로 디버그 패널 열기"
    echo ""
    echo "📋 로그 확인:"
    echo "  docker logs youtube-summary-app -f"
else
    echo "❌ 배포 실패! 서비스에 접근할 수 없습니다."
    echo "로그 확인: docker logs youtube-summary-app"
    exit 1
fi
