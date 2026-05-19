# 개발 환경 설정 — 친구 스케줄 매칭 앱

> 이 문서만 보고 5분 안에 앱을 실행할 수 있어야 합니다.

## 필요한 도구

| 도구 | 버전 | 설치 링크 |
|---|---|---|
| Node.js | 20.x 이상 | https://nodejs.org |
| npm | 10.x 이상 (Node와 함께 설치) | — |
| Git | 최신 | https://git-scm.com |
| Android Studio | 최신 | Android 에뮬레이터용 |
| Xcode | 15 이상 (macOS만) | iOS 시뮬레이터용 |

## 1. 저장소 클론

```bash
git clone <저장소 URL>
cd app-programming-ai
```

## 2. 의존성 설치

```bash
npm install
```

## 3. 환경 변수 설정

`.env.example`을 복사해 `.env` 파일을 생성합니다.

```bash
# Windows
copy .env.example .env

# macOS / Linux
cp .env.example .env
```

`.env` 파일에 Firebase 설정값을 입력합니다:

```
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
```

> Firebase 설정값은 Firebase 콘솔 → 프로젝트 설정 → 앱 등록에서 확인합니다.

## 4. 첫 실행

### Android

```bash
npx react-native run-android
```

### iOS (macOS만)

```bash
cd ios && pod install && cd ..
npx react-native run-ios
```

### Expo 사용 시 (개발 편의)

```bash
npx expo start
```

## 5. 문제 해결 (FAQ)

**Q. `npx react-native run-android` 실행 시 에뮬레이터가 없다는 오류**
A. Android Studio → Device Manager에서 에뮬레이터를 먼저 실행 후 다시 시도하세요.

**Q. `npm install` 후 `node_modules` 관련 오류**
A. `node_modules` 폴더를 삭제 후 `npm install`을 다시 실행하세요.

**Q. Metro bundler가 포트 8081 충돌**
A. `npx react-native start --port 8082`로 다른 포트 사용.

**Q. Firebase 연결 오류 (permission-denied)**
A. Firebase 콘솔에서 Firestore 보안 규칙이 테스트 모드인지 확인하세요.

**Q. iOS 빌드 시 `pod install` 실패**
A. `sudo gem install cocoapods` 후 재시도하세요.
