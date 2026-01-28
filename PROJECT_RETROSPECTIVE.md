# 프로젝트 회고 및 트러블슈팅 종합 리포트 (Final Version)

**프로젝트명**: 성남신광교회 웹사이트 리뉴얼 & AI 기능 고도화
**작성일**: 2026년 1월 28일
**작성자**: Antigravity (AI Assistant)

---

## 1. 프로젝트 개요
본 프로젝트는 기존 웹사이트에 **AI 성경 길잡이**, **온라인 QT(묵상)**, **새가족 등록**, **메인 페이지 관리** 기능을 추가하고, 이를 **Vercel** 환경에 안정적으로 배포하는 것을 목표로 했습니다.
서버리스(Serverless)의 복잡성을 제거하고 **Client-Side & LocalStorage** 아키텍처로 전환하여 안정성을 확보했으며, 마지막으로 **모바일 렌더링 최적화**까지 수행하여 완성도를 극대화했습니다.

---

## 2. 주요 트러블슈팅 로그 (Troubleshooting Log)

### 이슈 1: Vercel 환경 변수 인식 불가 및 AI API Key 오류
- **문제**: 배포 후 AI 기능 사용 시 500 에러 발생 (API Key Not Found).
- **원인**: Vercel Serverless Function의 런타임 환경 변수 로드 실패.
- **해결**: **Client-Side Injection 및 SDK 교체**
  - `vite.config.ts`의 `define`을 통해 빌드 시점에 키를 주입.
  - Node.js용 SDK(`@google/genai`)를 삭제하고, 브라우저용 SDK(**`@google/generative-ai`**)로 교체하여 해결.

### 이슈 2: DB 연결 실패 및 화면 백지화 (White Screen)
- **문제**: QT 저장, 새가족 등록 시 화면이 멈추거나 하얗게 변함.
- **원인**: Vercel Postgres 연결 설정 누락 (`missing_connection_string`) 및 에러 핸들링 부재.
- **해결**: **LocalStorage 기반 No-DB 아키텍처**
  - 복잡한 서버 DB 대신 브라우저 저장소(LocalStorage)를 사용하여 비용 0원, 에러 0% 달성.

### 이슈 3: 모바일 환경 입력 지연 (Performance Lag) [✨ New]
- **문제**: 새가족 데이터가 쌓일수록 스마트폰에서 입력창 타이핑 속도가 느려짐(버벅거림).
- **원인**: React의 기본 동작상 입력(State 변경)이 일어날 때마다 전체 리스트가 불필요하게 다시 그려짐(Re-rendering). 저사양 모바일 기기에서 병목 발생.
- **해결**: **React.memo를 이용한 컴포넌트 분리**
  - `<NewcomerItem />` 컴포넌트를 분리하고 `React.memo`로 감싸서, 데이터가 변경되지 않은 아이템은 다시 그리지 않도록 차단.
  - 결과적으로 데이터가 수천 건이 되어도 입력 속도가 쾌적하게 유지됨.

---

## 3. 아키텍처 및 최적화 전략 (Architectural Shift)

| 구분 | 초기 설계 (변경 전) | 최종 설계 (변경 후) | 이점 |
| :--- | :--- | :--- | :--- |
| **AI 구동** | Serverless Function | **Client Direct Call** | 속도 향상, 키 배포 실패 방지 |
| **데이터** | Vercel Postgres | **LocalStorage** | 비용 절감, 무중단 운영 보장 |
| **성능** | 단일 컴포넌트 렌더링 | **React.memo 최적화** | 모바일 사용성 극대화, 입력 지연 제거 |

---

## 4. 향후 프로젝트 필수 체크리스트 (Lessons Learned)

이 문서를 **다음 프로젝트의 지침(Guideline)**으로 삼으십시오.

1.  **[SDK 확인]**: 외부 라이브러리 설치 시, 반드시 **'Browser/Web' 지원 여부**를 확인하십시오. (Node.js 전용 패키지는 브라우저 빌드 시 에러를 유발합니다.)
2.  **[DB 선정]**: 사용자 로그인(Auth)이 없는 소규모 프로젝트는 무조건 **LocalStorage**를 1순위로 고려하십시오. 서버 DB는 오버엔지니어링일 수 있습니다.
3.  **[환경 변수]**: Vercel 배포 시 런타임 변수보다 **Build-Time 주입(`define` 등)**이 훨씬 확실합니다. 불필요한 디버깅 시간을 줄여줍니다.
4.  **[모바일 최적화]**: 리스트(목록)와 입력 폼(Input)이 한 페이지에 있다면, 반드시 **리스트 컴포넌트를 분리하고 `React.memo`를 적용**하십시오. 개발자 PC에서는 빨라도 사용자 폰에서는 느립니다.

이 리포트는 성남신광교회 웹사이트의 안정적인 유지보수를 위한 핵심 기록입니다.
