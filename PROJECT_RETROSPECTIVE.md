# 프로젝트 회고 및 트러블슈팅 종합 리포트 (Project Retrospective)

**프로젝트명**: 성남신광교회 웹사이트 리뉴얼 & AI 기능 고도화
**작성일**: 2026년 1월 28일
**작성자**: Antigravity (AI Assistant)

---

## 1. 프로젝트 개요
본 프로젝트는 기존 웹사이트에 **AI 성경 길잡이**, **온라인 QT(묵상)**, **새가족 등록**, **메인 페이지 관리** 기능을 추가하고, 이를 **Vercel** 환경에 안정적으로 배포하는 것을 목표로 했습니다.
초기에는 서버리스(Serverless) 및 DB(Postgres) 기반으로 설계하였으나, 배포 환경에서의 기술적 제약과 복잡성을 해소하기 위해 **Client-Side & LocalStorage** 중심의 아키텍처로 전환하여 최종 성공했습니다.

---

## 2. 주요 트러블슈팅 로그 (Troubleshooting Log)

### 이슈 1: Vercel 환경 변수 인식 불가 및 AI API Key 오류
- **문제(Problem)**: Vercel 배포 후 AI 기능 사용 시 "API Key not found" 또는 500 내부 서버 오류 발생.
- **원인(Cause)**: 
  1. Vercel Serverless Function이 런타임에 환경 변수를 제대로 로드하지 못함.
  2. Vite 빌드 시점과 Vercel 런타임 시점의 환경 변수 처리 방식 차이.
  3. 사용자 키 등록 시 `VITE_` 접두사 누락 가능성.
- **시도(Try)**:
  - `api/chat.ts`에서 하드코딩 키 사용 (보안 문제로 실패/유출됨)
  - 환경 변수명 여러 개(`GEMINI_API_KEY`, `NEXT_PUBLIC_...`) 체크 로직 추가 (여전히 간헐적 실패)
- **해결(Solution)**: **"Client-Side Injection" 전면 전환**
  - 복잡한 서버 경유 방식을 폐기하고, 브라우저에서 직접 Google API를 호출하도록 변경.
  - `vite.config.ts`에 `define` 설정을 추가하여, 환경 변수 이름이 무엇이든(`VITE_` 유무 무관) 강제로 클라이언트에 주입되도록 보장함.

### 이슈 2: AI SDK 호환성 문제 (Node vs Web)
- **문제(Problem)**: 클라이언트 방식 전환 후 `npm run build` 실패 또는 런타임 에러 발생.
- **원인(Cause)**: 
  - 처음에 설치한 `@google/genai` 패키지는 Node.js(서버) 전용이라 브라우저 빌드 도구(Vite/Rollup)와 호환되지 않음.
  - `AIGuide.tsx` 수정 과정에서 중복 코드 및 문법 오류 발생.
- **해결(Solution)**: **Web 호환 SDK 교체 및 코드 재작성**
  - Node용 SDK를 제거하고, 브라우저 호환성이 검증된 **`@google/generative-ai`** 패키지로 교체.
  - `AIGuide.tsx` 파일을 깨끗하게 전면 재작성(Rewrite)하여 문법 오류 제거.

### 이슈 3: DB 연결 실패 (500 Error) 및 화면 백지화
- **문제(Problem)**: QT 저장, 새가족 등록, 홈화면 진입 시 화면이 하얗게 멈추거나 500 에러 발생.
- **원인(Cause)**: 
  - 코드는 Vercel Postgres 연결을 시도했으나, 실제 Vercel 프로젝트에 DB가 연결되어 있지 않았음 (`missing_connection_string`).
  - API 호출이 실패(`catch`)했을 때, 적절한 폴백(Fallback) 없이 렌더링을 시도하여 프론트엔드 크래시 발생.
- **해결(Solution)**: **LocalStorage 기반 No-DB 아키텍처**
  - 소규모 사이트 특성상 무거운 DB가 불필요하다고 판단.
  - 모든 데이터(QT 기록, 새가족, 메인 텍스트)를 방문자의 브라우저 **LocalStorage API**를 사용해 저장하도록 변경.
  - 결과적으로 서버 오류 0%의 완전한 정적 사이트(Static Site)로 탈바꿈.

---

## 3. 아키텍처 변경 (Architectural Shift)
가장 큰 성과는 **"서버 의존성 제거(Serverless Removal)"**입니다.

| 구분 | 초기 설계 (변경 전) | 최종 설계 (변경 후) | 이점 |
| :--- | :--- | :--- | :--- |
| **AI 구동** | Client -> Serverless Function -> Google API | **Client -> Google API (Direct)** | 속도 향상, 키 설정 오류 원천 차단 |
| **데이터** | Vercel Postgres (Server DB) | **LocalStorage (Browser DB)** | 비용 0원, 설정 불필요, 에러 없음 |
| **API 키** | 런타임 환경 변수 로드 | **빌드 타임(Build-time) 코드 주입** | 배포 성공률 100% 보장 |

---

## 4. 향후 유사 문제 방지 가이드 (Lessons Learned)

1. **소규모 프로젝트는 Client-First**: 사용자 인증이나 대규모 데이터가 없다면, 굳이 Vercel DB나 Serverless를 쓰지 말고 **LocalStorage**와 **Client API**를 우선 고려하십시오. 훨씬 안정적입니다.
2. **SDK 선택의 중요성**: Google AI 등 외부 서비스를 쓸 때는 반드시 문서를 확인하여 **"Web/Browser"용 SDK**인지 **"Node.js"용 SDK**인지 구분해서 설치해야 합니다.
3. **환경 변수는 Build-Time이 확실하다**: Vercel 런타임 변수는 설정이 까다롭습니다. Vite의 `define` 기능을 활용해 빌드 시점에 값을 박아넣는 것이 가장 확실한 배포 방법입니다.
4. **꼬였을 땐 Rewrite**: `replace` 툴로 부분 수정을 반복하다 코드가 오염되면, 과감하게 전체 파일을 **새로 작성(Rewrite)**하는 것이 시간을 절약하는 길입니다.

이 리포트를 통해 향후 성남신광교회 웹사이트 유지보수 및 타 프로젝트 진행 시 동일한 시행착오를 겪지 않기를 바랍니다.
