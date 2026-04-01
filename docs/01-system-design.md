# Tài liệu Thiết kế Hệ thống (System Design Document)

## 1. Tổng quan hệ thống

**EnglishMaster** là nền tảng học tiếng Anh trực tuyến toàn diện, bao gồm 4 kỹ năng chính:
- Học từ vựng qua Flashcard với Spaced Repetition
- Luyện ngữ pháp với bài tập tương tác
- Luyện nghe với điền từ còn thiếu
- Hội thoại với AI (Gemini) theo tình huống thực tế

---

## 2. Kiến trúc hệ thống

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                         │
│   ┌───────────────────────────────────────────────────────┐    │
│   │              Next.js Frontend (port 3000)             │    │
│   │  - Trang chủ    - Từ vựng    - Ngữ pháp              │    │
│   │  - Luyện nghe   - Hội thoại  - Dashboard             │    │
│   │                                                       │    │
│   │  Web APIs: SpeechSynthesis, SpeechRecognition         │    │
│   └───────────────────────────────────────────────────────┘    │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTP REST API
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              NestJS Backend (port 3001)                         │
│                                                                 │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐           │
│  │  Vocabulary  │ │   Grammar    │ │  Listening   │           │
│  │   Module     │ │   Module     │ │   Module     │           │
│  └──────────────┘ └──────────────┘ └──────────────┘           │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐           │
│  │ Conversation │ │   Progress   │ │    Auth      │           │
│  │   Module     │ │   Module     │ │   Module     │           │
│  └──────────────┘ └──────────────┘ └──────────────┘           │
│                         │                                       │
│               ┌─────────▼─────────┐                            │
│               │   Prisma ORM      │                            │
│               └─────────┬─────────┘                            │
└─────────────────────────┼───────────────────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
   ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
   │  SQLite DB  │ │ Gemini API  │ │  Web Speech │
   │  (dev.db)   │ │  (Google)   │ │  API (TTS)  │
   └─────────────┘ └─────────────┘ └─────────────┘
```

---

## 3. Tech Stack

| Thành phần | Công nghệ | Phiên bản | Mục đích |
|---|---|---|---|
| Frontend Framework | Next.js | 16.x | SSR, routing, UI |
| UI Library | React | 19.x | Component-based UI |
| CSS Framework | TailwindCSS | 4.x | Styling |
| UI Components | shadcn/ui (base-ui) | latest | Accessible components |
| Backend Framework | NestJS | 11.x | REST API server |
| ORM | Prisma | 5.x | Database access |
| Database (Dev) | SQLite | - | Local development |
| Database (Prod) | PostgreSQL | 15+ | Production |
| AI Conversation | Google Gemini | 2.0 Flash | AI chat |
| Speech (TTS) | Web Speech API | Browser | Text-to-speech |
| Speech (STT) | Web Speech API | Browser | Recognition |
| Language | TypeScript | 5.x | Type safety |

---

## 4. Cấu trúc thư mục

```
english/
├── docs/                        # Tài liệu hệ thống
│   ├── 01-system-design.md
│   ├── 02-database-design.md
│   ├── 03-api-design.md
│   └── 04-user-flows.md
│
├── frontend/                    # Next.js Application
│   ├── src/
│   │   ├── app/                 # App Router pages
│   │   │   ├── page.tsx         # Trang chủ
│   │   │   ├── vocabulary/      # Từ vựng
│   │   │   │   └── [topicId]/
│   │   │   │       ├── flashcard/
│   │   │   │       └── quiz/
│   │   │   ├── grammar/         # Ngữ pháp
│   │   │   │   └── [lessonId]/
│   │   │   ├── listening/       # Luyện nghe
│   │   │   │   └── [lessonId]/
│   │   │   └── conversation/    # Hội thoại AI
│   │   │       └── [sessionId]/
│   │   ├── components/
│   │   │   ├── layout/          # Header, Footer
│   │   │   ├── vocabulary/      # FlashCard component
│   │   │   ├── ui/              # shadcn/ui components
│   │   │   └── shared/          # ButtonLink, v.v.
│   │   ├── hooks/               # Custom React hooks
│   │   │   ├── useSpeechSynthesis.ts
│   │   │   └── useSpeechRecognition.ts
│   │   ├── lib/
│   │   │   ├── api.ts           # API client (fetch wrapper)
│   │   │   └── utils.ts
│   │   └── types/               # TypeScript types
│   └── .env.local               # NEXT_PUBLIC_API_URL
│
└── backend/                     # NestJS Application
    ├── src/
    │   ├── main.ts              # Entrypoint, CORS, pipe
    │   ├── app.module.ts        # Root module
    │   ├── prisma/              # Database service
    │   ├── vocabulary/          # Vocabulary CRUD
    │   ├── grammar/             # Grammar lessons
    │   ├── listening/           # Listening lessons
    │   ├── conversation/        # AI conversation
    │   └── progress/            # Spaced repetition
    ├── prisma/
    │   ├── schema.prisma        # Database schema
    │   └── seed/                # Seed data
    │       ├── seed.ts
    │       ├── vocabulary.json  # 100 từ vựng
    │       └── grammar.json     # 5 bài ngữ pháp
    └── .env                     # DATABASE_URL, GEMINI_API_KEY
```

---

## 5. Các module Backend

### 5.1 VocabularyModule
- Quản lý chủ đề từ vựng và danh sách từ
- Hỗ trợ lọc theo level (beginner/intermediate/advanced)
- Tìm kiếm từ theo keyword

### 5.2 GrammarModule
- Quản lý bài học ngữ pháp
- Lọc theo category: basic, structures, conversational
- Bài tập: multiple_choice, fill_blank

### 5.3 ListeningModule
- Quản lý bài nghe
- Transcript với các ô trống (blanks)
- API chấm điểm đáp án

### 5.4 ConversationModule
- Tích hợp Google Gemini API
- Quản lý phiên hội thoại và lịch sử tin nhắn
- 6 chủ đề tình huống: Travel, Restaurant, Shopping, Interview, Doctor, Daily Chat

### 5.5 ProgressModule (Planned)
- Thuật toán SM-2 (Spaced Repetition)
- Theo dõi tiến trình học từng từ
- Dashboard thống kê

---

## 6. Bảo mật

| Vấn đề | Giải pháp |
|---|---|
| API Key | Lưu trong `.env`, không commit git |
| CORS | Chỉ cho phép origin từ frontend |
| Input Validation | `class-validator` trong NestJS |
| SQL Injection | Prisma ORM (parameterized queries) |
| Auth (Planned) | JWT + bcrypt |

---

## 7. Môi trường triển khai

| Môi trường | Frontend | Backend | Database |
|---|---|---|---|
| Development | `localhost:3000` | `localhost:3001` | SQLite |
| Production | Vercel | Railway / Render | PostgreSQL |

---

## 8. Scalability (tương lai)

- Chuyển từ SQLite sang PostgreSQL cho production
- Thêm Redis cache cho vocabulary data
- CDN cho audio/image assets
- Rate limiting cho Gemini API calls
