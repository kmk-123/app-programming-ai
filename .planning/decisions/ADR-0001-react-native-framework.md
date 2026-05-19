# ADR-0001: 모바일 프레임워크 — React Native 선택

- 상태: Accepted
- 날짜: 2026-05-12
- 결정자: 1인 팀

## 배경

친구 스케줄 매칭 앱을 개발하기 위해 모바일 프레임워크를 선택해야 한다. Android/iOS 모두 지원해야 하며, 1인 팀이므로 생산성이 중요하다.

## 고려한 대안

### 대안 A: React Native
- 장점: JavaScript 기반으로 학습 곡선 낮음, 커뮤니티 크고 라이브러리 풍부, Android/iOS 동시 지원, Firebase 공식 SDK 지원
- 단점: 네이티브 성능보다 낮을 수 있음, 브리지 레이어 디버깅 까다로움

### 대안 B: Flutter
- 장점: 성능 우수, UI 일관성 높음, Google 공식 지원
- 단점: Dart 언어 신규 학습 필요, 팀 내 경험 없음

### 대안 C: 네이티브 (Swift / Kotlin)
- 장점: 최고 성능, 플랫폼 기능 완전 활용
- 단점: Android/iOS 각각 개발 필요 → 1인 팀에게 비현실적

## 결정

**React Native**를 선택한다.

## 이유

- 1인 팀으로 두 플랫폼을 동시에 커버해야 함
- JavaScript 기반으로 기존 웹 개발 경험 활용 가능
- Firebase와의 통합이 잘 되어 있어 백엔드 연동이 용이

## 결과 (예상되는 영향)

긍정:
- 단일 코드베이스로 Android/iOS 모두 지원
- npm 생태계 활용 가능 (캘린더 라이브러리 등)

부정 / 제약:
- 네이티브 수준의 성능 최적화는 어려울 수 있음
- React Native 버전 업그레이드 시 호환성 이슈 가능성

## 후속 작업

- [ ] React Native 개발 환경 세팅 (Android Studio, Xcode)
- [ ] Firebase React Native SDK 설치 및 연결 확인
