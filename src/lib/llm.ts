import { GoogleGenerativeAI } from '@google/generative-ai'

type Mode = 'general' | 'scqa' | 'full'

const prompts: Record<Mode, (transcript: string) => string> = {
  general: (t) => `다음은 유튜브 동영상의 자막입니다. 아래 지침을 엄격히 따라 **한국어**로 마크다운 요약 노트를 생성하세요.

[목표]
입력된 동영상 스크립트를 분석하여 체계적이고 가독성 높은 요약 노트를 생성합니다. 모든 내용은 마크다운 구조와 간결한 설명체(개조식)로 작성합니다.

[구성]
🎬 Title: 영상 전체를 대표하는 핵심 제목 1줄
📚 Genre: 'Tech', 'Business', 'Readership', '자기개발' 중 택1 (필요 시 세부장르 '주장르#세부장르')
✨ Overview: 핵심 메시지 3개를 불릿(•)로 요약
🔑 Keywords: 키워드 3개, 쉼표로 구분
📝 Detailed Notes: 3~5개 주제를 #### 헤딩으로 나누고 각 주제별 세부 불릿 3개

[문체 규칙]
• 모든 문장은 명사형 종결의 간결한 설명체(개조식) 사용
• 불릿은 하이픈 대신 • 사용

[출력 형식]
다음 템플릿을 반드시 준수:

🎬 Title: {제목}

📚 Genre: {장르}

✨ Overview:
• {핵심 1}
• {핵심 2}
• {핵심 3}

🔑 Keywords: {키워드1}, {키워드2}, {키워드3}

📝 Detailed Notes:
#### 📌 {주제 1}
• {세부 1}
• {세부 2}
• {세부 3}

#### 📌 {주제 2}
• {세부 1}
• {세부 2}
• {세부 3}

#### 📌 {주제 3}
• {세부 1}
• {세부 2}
• {세부 3}

---
[입력 데이터]
${t}`,
  scqa: (t) => `You are a consultant preparing an 8-slide YouTube summary deck. Use SCQA and the Pyramid Principle. Return result in Korean markdown.

[Top-Line SCQA]
아래 4개의 불릿으로 상단에 배치. 각 항목은 이모지 + 굵은 라벨을 사용하고, 개조식 종결(~했음/~됨/~필요) 1문장으로 작성.
• 🧭 **Situation**: {상황 핵심 요지 1문장으로 요약했음}
• ⚠️ **Complication**: {행동 필요 이유·위협/기회 1문장으로 요약했음}
• ❓ **Question**: {핵심 질문 1문장으로 제기했음}
• ✅ **Answer**: {핵심 해답 1문장으로 제시했음}

[Goal]
Create an 8-slide outline applying Situation, Complication, Question, Answer. Each slide follows the Pyramid Principle: lead with the answer; add 3 supporting bullets; keep concise.

[Output Structure]
### Slide 1 — Situation
• {상황 요지}
• {배경/맥락}
• {현재 인식}

### Slide 2 — Complication
• {행동 필요 이유}
• {위협/기회}
• {장애물}

### Slide 3 — Question
• {핵심 질문}
• {해결 방향성}
• {평가 기준}

### Slide 4~7 — Answer (by theme)
• {핵심 해답 제목}
• {근거/인사이트 1}
• {근거/인사이트 2}
• {근거/인사이트 3}

### Slide 8 — Next Steps
• {우선 실행 과제}
• {추가 분석 필요}
• {리스크/가정}

[Writing Rules]
• 한국어, 간결한 설명체(개조식, 문장 끝 ~했음/~됨/~필요)
• 각 슬라이드 3불릿 유지, 불릿 기호는 • 사용

[Transcript]
${t}`,
  full: (t) => `다음 자막을 바탕으로 상세 리포트를 한국어 마크다운으로 작성하세요. 아래 섹션을 모두 포함해 최대한 풍부하게 기술합니다.

[Sections]
1. Executive Summary — 4~6줄 개요
2. Table of Contents — 본문 섹션 목록
3. Key Insights — 핵심 인사이트 5~7개 불릿
4. Detailed Analysis — 주제별 세부 분석 (#### 헤딩 다수, 인용문/예시 포함)
5. Data & Evidence — 구체 데이터/수치/출처 요약 (가능 범위 내)
6. Quotes — 인상 깊은 원문 인용 3~5개 (블록 인용)
7. Action Items — 실행 항목 3~5개
8. Takeaways — 3~4개 요약

[Style]
• 마크다운 헤딩/리스트 사용, 불필요 수식어 지양, 간결/정확
• 표가 유용하면 간단한 마크다운 표 사용 가능

[Transcript]
${t}`,
}

export type LLMResult = {
  text: string
  meta: {
    latencyMs: number
    tokens?: { input?: number; output?: number; total?: number }
  }
}

export async function generateReport({
  transcript,
  mode,
}: {
  transcript: string
  mode: Mode
}): Promise<LLMResult> {
  const { config } = await import('./config')
  const apiKey = config.geminiApiKey
  if (!transcript?.trim()) throw new Error('Transcript is empty')

  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
  const prompt = prompts[mode](transcript)
  const started = performance.now()
  const result = await model.generateContent(prompt)
  const ended = performance.now()
  const text = result.response.text()
  // token usage metadata (Gemini SDK)
  const usage: any = (result as any).response?.usageMetadata || (result as any).response?.usage || (result as any).usage
  let inputTokens: number | undefined
  let outputTokens: number | undefined
  let totalTokens: number | undefined
  if (usage) {
    inputTokens = usage?.promptTokenCount ?? usage?.inputTokens ?? usage?.promptTokens
    outputTokens = usage?.candidatesTokenCount ?? usage?.outputTokens ?? usage?.candidatesTokens
    totalTokens = usage?.totalTokenCount ?? usage?.totalTokens
  }
  // Fallback: estimate via countTokens when usage missing
  if (inputTokens == null) {
    try {
      const countedIn: any = await model.countTokens(prompt)
      inputTokens = countedIn?.totalTokens ?? countedIn?.totalTokenCount
    } catch {}
  }
  if (outputTokens == null) {
    try {
      const countedOut: any = await model.countTokens(text)
      outputTokens = countedOut?.totalTokens ?? countedOut?.totalTokenCount
    } catch {}
  }
  if (totalTokens == null && (inputTokens != null || outputTokens != null)) {
    totalTokens = (inputTokens ?? 0) + (outputTokens ?? 0)
  }
  const meta = {
    latencyMs: Math.round(ended - started),
    tokens:
      inputTokens != null || outputTokens != null || totalTokens != null
        ? { input: inputTokens, output: outputTokens, total: totalTokens }
        : undefined,
  }
  return { text, meta }
}




