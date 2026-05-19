# ADR-0002: 상태관리 — Zustand 선택

- 상태: Accepted
- 날짜: 2026-05-19
- 결정자: 1인 팀

## 배경

React Native 앱에서 스케줄, 친구 목록, 초대 상태 등 여러 화면에 걸쳐 공유되는 상태를 관리할 라이브러리를 선택해야 한다.

## 고려한 대안

### 대안 A: Zustand
- 장점: 설정 코드 최소, API 단순, React Context보다 성능 우수, 1인 팀·소규모 앱에 적합
- 단점: 대규모 팀에서는 구조 강제성이 낮아 혼용 가능성

### 대안 B: Redux Toolkit
- 장점: 업계 표준, 레퍼런스 매우 많음, DevTools 강력
- 단점: 보일러플레이트 많음, 1인 팀 소규모 앱에 과한 복잡도

### 대안 C: React Context + useState
- 장점: 외부 라이브러리 없이 React 내장
- 단점: 규모 커지면 리렌더링 최적화 어려움, Provider 중첩 복잡

### 대안 D: Jotai
- 장점: atom 기반, 매우 가벼움
- 단점: Zustand보다 레퍼런스 적음, 팀 경험 없음

## 결정

**Zustand**를 선택한다.

## 이유

- 1인 팀으로 빠른 개발이 필요하며, 설정 코드가 적어 생산성 높음
- 스케줄·친구·초대 상태를 store 단위로 명확히 분리 가능
- Firebase 실시간 데이터와 연동 시 간단한 subscription 패턴으로 구현 가능

## 결과 (예상되는 영향)

긍정:
- store 파일을 feature 단위로 분리해 유지보수 용이
- Redux 대비 코드량 대폭 감소

부정 / 제약:
- 구조 강제성이 없으므로 store 설계 기준을 팀 내 명시해야 함

## 후속 작업

- [ ] `npm install zustand` 설치
- [ ] `src/application/stores/` 디렉토리에 scheduleStore, friendStore, inviteStore 생성
