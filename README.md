# 친구 스케줄 매칭 앱

친구들과 겹치는 빈 시간을 한눈에 확인하고 모임을 잡는 React Native 앱입니다.

## 다운로드

[![Download APK](https://img.shields.io/badge/Download-APK-brightgreen?style=for-the-badge&logo=android&logoColor=white)](https://github.com/kmk-123/app-programming-ai/releases/latest/download/schedule-app.apk)

> Android 기기에서 위 버튼을 클릭해 APK를 직접 설치할 수 있습니다.  
> `main` 브랜치에 푸시될 때마다 GitHub Actions가 자동으로 최신 빌드를 업로드합니다.

## 주요 기능

- **인증** — 회원가입 · 로그인 · 비밀번호 재설정
- **스케줄 관리** — 고정(매주 반복) · 일회성 일정 등록, 월간 캘린더 뷰
- **친구 관리** — 이메일 검색 · 친구 요청 · 수락/거절
- **모임 잡기** — 날짜 선택 시 친구별 가용 여부 자동 표시, 초대 발송
- **초대 응답** — 수락 / 거절 / 보류 + 사유 입력, 초대자에게 푸시 알림
- **채팅** — 수락자 기반 채팅방 자동 생성, 실시간 메시지

## 기술 스택

| 분류 | 기술 |
|------|------|
| 앱 | React Native 0.81 + Expo 54 |
| 상태 관리 | Zustand 5 |
| 백엔드 | Firebase (Auth · Firestore · FCM · Crashlytics) |
| 서버리스 | Firebase Cloud Functions v2 |
| 내비게이션 | React Navigation 7 |

## 디렉토리 구조

```
projectAi/
├── app/                  # React Native 앱
│   └── src/
│       ├── presentation/ # 화면·컴포넌트·내비게이션
│       ├── application/  # Zustand stores
│       ├── domain/       # 엔티티·비즈니스 로직
│       └── data/         # Firebase repositories
├── functions/            # Cloud Functions (FCM 푸시 발송)
├── firestore.rules       # Firestore 보안 규칙
└── docs/                 # 아키텍처·설정 문서
```

## 빠른 시작

```bash
# 1. 의존성 설치
cd app && npm install

# 2. google-services.json을 app/ 에 배치 (Firebase 콘솔에서 다운로드)

# 3. 개발 서버 실행
npm run android   # Android 에뮬레이터 or 실기기
npm start         # Expo 개발 서버만 실행
```

> 상세 환경 설정 → [docs/setup.md](docs/setup.md)  
> 아키텍처 설명 → [docs/architecture.md](docs/architecture.md)

## APK 빌드

```bash
# 테스트용 APK (EAS Build)
cd app && npm run build:apk

# 로컬 빌드
cd app && expo run:android --variant release
```

## Cloud Functions 배포

```bash
# functions/ 에서
npm run deploy
# 또는
firebase deploy --only functions
```
