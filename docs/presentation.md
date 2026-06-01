---
marp: true
theme: default
paginate: true
size: 16:9
style: |
  /* ── 전역 ── */
  section {
    font-family: 'Apple SD Gothic Neo', 'Noto Sans KR', 'Segoe UI', sans-serif;
    background: #ffffff;
    color: #1e293b;
    padding: 56px 72px;
    font-size: 26px;
  }
  section::after { font-size: 15px; color: #94a3b8; }
  h1 { color: #4f46e5; font-size: 44px; font-weight: 900; margin-bottom: 12px; }
  h2 {
    color: #4f46e5;
    font-size: 36px;
    font-weight: 800;
    border-bottom: 3px solid #4f46e5;
    padding-bottom: 10px;
    margin-bottom: 28px;
  }
  strong { color: #4f46e5; }
  code { background: #eef2ff; color: #4f46e5; border-radius: 6px; padding: 2px 8px; font-size: 22px; }
  blockquote {
    border-left: 5px solid #4f46e5;
    background: #f0f4ff;
    margin: 0;
    padding: 20px 28px;
    border-radius: 0 12px 12px 0;
    font-size: 26px;
    color: #1e293b;
  }
  blockquote p { margin: 0; }

  /* ── 타이틀 슬라이드 ── */
  section.title {
    background: linear-gradient(135deg, #4338ca 0%, #7c3aed 100%);
    color: #fff;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    padding: 60px;
  }
  section.title h1 {
    color: #fff;
    font-size: 58px;
    text-shadow: 0 3px 12px rgba(0,0,0,0.25);
    margin-bottom: 16px;
  }
  section.title p { color: rgba(255,255,255,0.85); font-size: 26px; }
  section.title code {
    background: rgba(255,255,255,0.18);
    color: #fff;
    font-size: 20px;
    margin-top: 32px;
  }

  /* ── 문제 정의 슬라이드 ── */
  section.problem {
    background: #0f172a;
    color: #f8fafc;
  }
  section.problem h2 {
    color: #fbbf24;
    border-bottom-color: #fbbf24;
  }
  .pain-box {
    display: flex;
    align-items: flex-start;
    background: #1e293b;
    border-left: 5px solid #f59e0b;
    border-radius: 0 12px 12px 0;
    padding: 18px 24px;
    margin-bottom: 18px;
    gap: 16px;
  }
  .pain-icon { font-size: 34px; line-height: 1.2; }
  .pain-text { font-size: 24px; line-height: 1.5; color: #e2e8f0; }
  .pain-text strong { color: #fbbf24; }

  /* ── 비전 ── */
  .vision-flow {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    align-items: center;
    text-align: center;
    margin-top: 24px;
    gap: 0;
  }
  .vf-step {
    background: #f0f4ff;
    border: 2px solid #c7d2fe;
    border-radius: 14px;
    padding: 20px 10px;
    font-size: 20px;
    line-height: 1.6;
  }
  .vf-step .icon { font-size: 36px; display: block; margin-bottom: 6px; }
  .vf-step strong { color: #4f46e5; display: block; font-size: 18px; margin-bottom: 4px; }
  .vf-arrow { font-size: 30px; color: #a5b4fc; text-align: center; }

  /* ── 기술 & 진행률 ── */
  .two-col {
    display: grid;
    grid-template-columns: 1.1fr 0.9fr;
    gap: 48px;
    align-items: start;
  }
  table { border-collapse: collapse; width: 100%; font-size: 22px; }
  th {
    background: #4f46e5;
    color: #fff;
    padding: 10px 16px;
    text-align: left;
    font-weight: 700;
  }
  td { padding: 9px 16px; border-bottom: 1px solid #e2e8f0; }
  tr:last-child td { border-bottom: none; }
  .prog-wrap { background: #e2e8f0; border-radius: 999px; height: 16px; margin: 8px 0; overflow: hidden; }
  .prog-fill { background: linear-gradient(90deg, #10b981, #34d399); height: 100%; border-radius: 999px; }
  .stat-row { display: flex; gap: 20px; margin-bottom: 20px; }
  .stat-chip {
    flex: 1;
    text-align: center;
    background: #f0f4ff;
    border-radius: 12px;
    padding: 14px 0;
    border: 1.5px solid #c7d2fe;
  }
  .stat-chip .n { font-size: 36px; font-weight: 900; color: #4f46e5; }
  .stat-chip .l { font-size: 16px; color: #64748b; }

  /* ── 아웃트로 ── */
  section.outro {
    background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
    color: #fff;
    text-align: center;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
  section.outro h1 { color: #a5b4fc; font-size: 54px; }
  section.outro p { color: rgba(255,255,255,0.75); font-size: 24px; }
  section.outro code { background: rgba(165,180,252,0.15); color: #a5b4fc; }
---

<!-- _class: title -->
<!-- _paginate: false -->

# 📅 친구 스케줄 매칭 앱

**"언제 돼?" 없는 약속 문화를 만들다**

<br>

앱 프로그래밍 과제 발표 &nbsp;·&nbsp; 2026년 6월

`github.com/kmk-123/app-programming-ai`

---

<!-- _class: problem -->

## 💢 문제 정의

<div class="pain-box">
  <span class="pain-icon">😩</span>
  <span class="pain-text">단톡방에 <strong>"언제 돼?" 한 마디</strong> 남기고 — 답 취합까지 평균 <strong>3일 소요</strong></span>
</div>
<div class="pain-box">
  <span class="pain-icon">📆</span>
  <span class="pain-text"><strong>친구의 스케줄을 알 수 없어</strong> — 일정이 있는 친구에게도 무작정 초대 발송</span>
</div>

---

## 🎯 비전 & 솔루션

> **"각자의 일정을 등록하면 — 누가 되는지 한눈에, 초대부터 채팅까지 자동으로"**

<br>

<div class="vision-flow">
  <div class="vf-step">
    <span class="icon">📋</span>
    <strong>스케줄 등록</strong>
    고정 반복<br>+ 일회성
  </div>
  <div class="vf-arrow">→</div>
  <div class="vf-step">
    <span class="icon">👥</span>
    <strong>가용 확인</strong>
    날짜 선택 시<br>친구 현황 표시
  </div>
  <div class="vf-arrow">→</div>
  <div class="vf-step">
    <span class="icon">✉️</span>
    <strong>초대 & 응답</strong>
    수락 / 거절<br>사유 전달
  </div>
</div>

---

<!-- _paginate: false -->

## 🏗️ 아키텍처 설계 — 레이어드 아키텍처

```mermaid
flowchart LR
    subgraph P["📱 프레젠테이션 레이어"]
        SC["로그인 · 캘린더\n초대 · 채팅 화면 외 9개\n루트 내비게이터 · 메인 탭\n캘린더/친구/채팅 스택"]
    end
    subgraph A["⚙️ 애플리케이션 레이어"]
        ST["인증 · 스케줄\n친구 · 초대 · 채팅 스토어"]
    end
    subgraph D["🧠 도메인 레이어"]
        direction TB
        EN["엔티티: 사용자 · 스케줄\n친구 · 초대 · 채팅방 · 메시지"]
        SV["서비스: 스케줄 서비스\n(표시 날짜 계산 · 날짜별 필터)"]
    end
    subgraph DA["🗄️ 데이터 레이어"]
        direction TB
        RE["인증 · 스케줄 · 친구\n초대 · 채팅 저장소"]
        FB["Firebase 인증\nFirestore · 푸시 알림"]
    end
    P -->|"액션/이벤트"| A
    A -->|"유스케이스 호출"| D
    D -->|"저장/조회"| DA

    style P  fill:#eef2ff,stroke:#6366f1,color:#1e293b
    style A  fill:#fef3c7,stroke:#f59e0b,color:#1e293b
    style D  fill:#d1fae5,stroke:#10b981,color:#1e293b
    style DA fill:#fce7f3,stroke:#ec4899,color:#1e293b
```

---

## 🛠️ 기술 스택 & 진행 현황

<div class="two-col">

<div>

| 영역 | 기술 |
|---|---|
| 프레임워크 | React Native (Expo 54) |
| 언어 | TypeScript |
| 상태 관리 | Zustand 5 |
| 라우팅 | React Navigation v7 |
| 인증 | Firebase Auth |
| DB / 채팅 | Firestore + onSnapshot |
| 알림 (예정) | Firebase FCM |

</div>

<div>

<div class="stat-row">
  <div class="stat-chip"><div class="n">29</div><div class="l">완료 태스크</div></div>
  <div class="stat-chip"><div class="n">10</div><div class="l">예정 태스크</div></div>
</div>

**전체 진행률 — 73%**

<div class="prog-wrap"><div class="prog-fill" style="width:73%"></div></div>

남은 것: **FCM 푸시 알림**, Firestore 보안 규칙,  
Android 빌드 · 배포, 발표 자료

</div>

</div>

