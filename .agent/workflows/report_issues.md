---
description: 프로젝트 진행 중 발생한 문제점, 해결 과정, 교훈을 종합하여 회고 리포트(Retrospective)를 생성합니다.
---

# Project Issue & Solution Report Generator

이 워크플로우는 프로젝트 개발 과정에서 발생한 주요 이슈들과 그 해결책을 종합하여, 향후 동일한 문제 발생을 예방하기 위한 `PROJECT_RETROSPECTIVE.md` 파일을 생성합니다.

## 1. 프로젝트 히스토리 분석
먼저 프로젝트의 진행 상황과 주요 변경 사항을 파악합니다.
- `task.md`: 수행한 작업 목록 확인
- `walkthrough.md`: 구현 상세 및 수정 로그 확인
- Git Log: 최근 수정 내역(`fix`, `refactor`) 확인

## 2. 주요 이슈 및 해결책 추출
다음 카테고리를 중심으로 이슈를 정리합니다.
1. **배포 환경 (Vercel)**: 환경 변수(Env Var) 로드 실패, 빌드 에러, Serverless Function 500 에러
2. **AI 연동 (Gemini)**: API Key 인증 실패, 모델(404) 오류, SDK(Node vs Client) 호환성 문제
3. **데이터베이스**: Vercel Postgres 연결 오류, LocalStorage 전환 결정
4. **프론트엔드**: 새가족 페이지 백지화(Crash), 빌드 타임 주입(Define) 문제

## 3. 리포트 생성 (작성 가이드)
수집된 정보를 바탕으로 **`PROJECT_RETROSPECTIVE.md`** 파일을 생성합니다.
리포트는 다음 목차를 포함해야 합니다.

### [목차]
1. **프로젝트 개요**: 작업의 목표와 최종 결과
2. **트러블슈팅 로그 (Troubleshooting Log)**
   - **문제(Problem)**: 발생한 현상과 에러 로그
   - **원인(Cause)**: 근본적인 원인 분석
   - **시도(Try)**: 해결을 위해 시도한 방법들 (실패한 방법 포함)
   - **해결(Solution)**: 최종 해결책 및 코드 변경 결정적 요인
3. **아키텍처 변경 (Architectural Shift)**
   - 예: Serverless API -> Client-Side Direct Call / DB -> LocalStorage
4. **교훈 및 가이드 (Lessons Learned)**
   - 향후 유사 프로젝트 진행 시 반드시 체크해야 할 체크리스트

## 4. 실행
- 위 내용을 바탕으로 AI가 자동으로 리포트를 작성합니다.
- 작성된 리포트는 사용자가 검토 가능한 Markdown 파일로 저장됩니다.
