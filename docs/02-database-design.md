# Tài liệu Thiết kế Database (Database Design Document)

## 1. Tổng quan

- **ORM**: Prisma 5.x
- **Database Dev**: SQLite (`prisma/dev.db`)
- **Database Prod**: PostgreSQL 15+
- **Encoding**: UTF-8

---

## 2. Entity Relationship Diagram (ERD)

```
┌─────────────────┐       ┌─────────────────────┐       ┌──────────────┐
│      User       │       │   VocabularyTopic    │       │     Word     │
├─────────────────┤       ├─────────────────────┤       ├──────────────┤
│ id (PK)         │       │ id (PK)              │       │ id (PK)      │
│ name            │       │ name                 │       │ word         │
│ email (UNIQUE)  │       │ nameVi               │       │ phonetic     │
│ password        │       │ description          │       │ partOfSpeech │
│ image           │       │ level                │       │ definition   │
│ createdAt       │       │ imageUrl             │       │ definitionVi │
│ updatedAt       │       │ order                │       │ example      │
└────────┬────────┘       │ createdAt            │       │ exampleVi    │
         │                └──────────┬──────────┘       │ imageUrl     │
         │ 1:N                       │ 1:N              │ audioUrl     │
         │                           │                  │ topicId (FK) │
         ▼                           ▼                  └──────┬───────┘
┌─────────────────┐         ┌──────────────┐                   │
│    Progress     │◄────────│     Word     │◄──────────────────┘
├─────────────────┤  N:M    └──────────────┘
│ id (PK)         │
│ userId (FK)     │
│ wordId (FK)     │
│ easeFactor      │   SM-2 Algorithm Fields
│ interval        │   ─────────────────────
│ repetitions     │
│ nextReview      │
│ lastQuality     │
│ createdAt       │
│ updatedAt       │
│ UNIQUE(userId,  │
│        wordId)  │
└─────────────────┘

┌─────────────────┐       ┌─────────────────┐
│  Conversation   │       │    Message      │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │
│ userId (FK)     │ 1:N   │ conversationId  │
│ topic           │──────►│   (FK)          │
│ scenario        │       │ role            │
│ score           │       │ content         │
│ createdAt       │       │ audioUrl        │
└─────────────────┘       │ pronunciation   │
                          │ createdAt       │
                          └─────────────────┘

┌─────────────────────┐       ┌─────────────────────┐
│   ListeningLesson   │       │    GrammarLesson     │
├─────────────────────┤       ├─────────────────────┤
│ id (PK)             │       │ id (PK)              │
│ title               │       │ title                │
│ titleVi             │       │ titleVi              │
│ level               │       │ level                │
│ audioUrl            │       │ category             │
│ transcript          │       │ content (Markdown)   │
│ blanks (JSON str)   │       │ examples (JSON str)  │
│ translation         │       │ exercises (JSON str) │
│ order               │       │ order                │
│ createdAt           │       │ createdAt            │
└─────────────────────┘       └─────────────────────┘
```

---

## 3. Chi tiết các bảng

### 3.1 Bảng `User`

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| id | String | PK, CUID | Khóa chính tự sinh |
| name | String | Nullable | Tên hiển thị |
| email | String | UNIQUE, NOT NULL | Email đăng nhập |
| password | String | NOT NULL | Mật khẩu đã hash (bcrypt) |
| image | String | Nullable | URL ảnh đại diện |
| createdAt | DateTime | DEFAULT now() | Thời điểm tạo |
| updatedAt | DateTime | Auto-update | Thời điểm cập nhật |

---

### 3.2 Bảng `VocabularyTopic`

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| id | String | PK, CUID | Khóa chính |
| name | String | NOT NULL | Tên chủ đề (tiếng Anh) |
| nameVi | String | Nullable | Tên chủ đề (tiếng Việt) |
| description | String | Nullable | Mô tả chủ đề |
| level | String | NOT NULL | `beginner` / `intermediate` / `advanced` |
| imageUrl | String | Nullable | URL hình ảnh chủ đề |
| order | Int | DEFAULT 0 | Thứ tự hiển thị |
| createdAt | DateTime | DEFAULT now() | Thời điểm tạo |

**Dữ liệu mẫu (seed):**
| name | level | Số từ |
|---|---|---|
| Daily Life | beginner | 20 |
| Travel & Tourism | beginner | 20 |
| Business & Work | intermediate | 20 |
| Food & Restaurant | beginner | 20 |
| Health & Wellness | intermediate | 20 |

---

### 3.3 Bảng `Word`

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| id | String | PK, CUID | Khóa chính |
| word | String | NOT NULL | Từ tiếng Anh |
| phonetic | String | Nullable | Phiên âm IPA (vd: `/ˈbreɪkfəst/`) |
| partOfSpeech | String | NOT NULL | `noun`, `verb`, `adjective`, `adverb` |
| definition | String | NOT NULL | Nghĩa tiếng Anh |
| definitionVi | String | Nullable | Nghĩa tiếng Việt |
| example | String | Nullable | Câu ví dụ tiếng Anh |
| exampleVi | String | Nullable | Câu ví dụ tiếng Việt |
| imageUrl | String | Nullable | URL hình ảnh minh họa |
| audioUrl | String | Nullable | URL file audio phát âm |
| topicId | String | FK → VocabularyTopic | Chủ đề thuộc về |

---

### 3.4 Bảng `Progress` (Spaced Repetition)

Lưu trữ tiến trình học của mỗi user với từng từ theo thuật toán SM-2.

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| id | String | PK, CUID | Khóa chính |
| userId | String | FK → User | User học |
| wordId | String | FK → Word | Từ đang học |
| easeFactor | Float | DEFAULT 2.5 | Hệ số dễ (SM-2), min 1.3 |
| interval | Int | DEFAULT 0 | Số ngày đến lần ôn tiếp theo |
| repetitions | Int | DEFAULT 0 | Số lần đã ôn thành công |
| nextReview | DateTime | DEFAULT now() | Thời điểm cần ôn tiếp |
| lastQuality | Int | DEFAULT 0 | Chất lượng lần ôn cuối (0-5) |
| createdAt | DateTime | DEFAULT now() | Thời điểm tạo |
| updatedAt | DateTime | Auto-update | Thời điểm cập nhật |

**Unique constraint:** `(userId, wordId)` — mỗi user chỉ có 1 bản ghi tiến trình cho mỗi từ.

**Giải thích SM-2:**
| quality | Ý nghĩa |
|---|---|
| 0-1 | Không nhớ, blackout |
| 2 | Nhớ nhưng sai nghiêm trọng |
| 3 | Nhớ với khó khăn |
| 4 | Nhớ sau khi do dự |
| 5 | Nhớ hoàn toàn, tự nhiên |

---

### 3.5 Bảng `Conversation`

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| id | String | PK, CUID | Khóa chính |
| userId | String | FK → User | User thực hiện |
| topic | String | NOT NULL | ID chủ đề (travel, restaurant, ...) |
| scenario | String | Nullable | Mô tả tình huống cụ thể |
| score | Float | Nullable | Điểm tổng kết phiên hội thoại |
| createdAt | DateTime | DEFAULT now() | Thời điểm bắt đầu |

**Các topic hội thoại:**
| topic | Tên tiếng Việt | Tình huống |
|---|---|---|
| travel | Du lịch | Sân bay, check-in |
| restaurant | Nhà hàng | Gọi món, thanh toán |
| shopping | Mua sắm | Tìm sản phẩm, hỏi giá |
| job_interview | Phỏng vấn | Phỏng vấn xin việc |
| doctor | Khám bệnh | Mô tả triệu chứng |
| daily_chat | Hội thoại hàng ngày | Trò chuyện đồng nghiệp |

---

### 3.6 Bảng `Message`

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| id | String | PK, CUID | Khóa chính |
| conversationId | String | FK → Conversation | Thuộc phiên hội thoại |
| role | String | NOT NULL | `user` hoặc `assistant` |
| content | String | NOT NULL | Nội dung tin nhắn |
| audioUrl | String | Nullable | URL audio ghi âm của user |
| pronunciation | Float | Nullable | Điểm phát âm (0-100) |
| createdAt | DateTime | DEFAULT now() | Thời điểm gửi |

---

### 3.7 Bảng `ListeningLesson`

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| id | String | PK, CUID | Khóa chính |
| title | String | NOT NULL | Tiêu đề bài (tiếng Anh) |
| titleVi | String | Nullable | Tiêu đề bài (tiếng Việt) |
| level | String | NOT NULL | Cấp độ |
| audioUrl | String | NOT NULL | URL file audio |
| transcript | String | NOT NULL | Toàn bộ nội dung bài nghe |
| blanks | String | NOT NULL | JSON: `[{position, answer, hint}]` |
| translation | String | Nullable | Bản dịch tiếng Việt |
| order | Int | DEFAULT 0 | Thứ tự hiển thị |

**Cấu trúc JSON `blanks`:**
```json
[
  { "position": 0, "answer": "passport", "hint": "An official travel document" },
  { "position": 3, "answer": "gate", "hint": "Where you board the plane" }
]
```
> `position` là index của từ trong transcript (split by space)

---

### 3.8 Bảng `GrammarLesson`

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| id | String | PK, CUID | Khóa chính |
| title | String | NOT NULL | Tiêu đề bài |
| titleVi | String | Nullable | Tiêu đề tiếng Việt |
| level | String | NOT NULL | `beginner` / `intermediate` / `advanced` |
| category | String | NOT NULL | `basic` / `structures` / `conversational` |
| content | String | NOT NULL | Nội dung bài học (Markdown) |
| examples | String | NOT NULL | JSON: `[{english, vietnamese, explanation}]` |
| exercises | String | NOT NULL | JSON: `[{type, question, options, answer}]` |
| order | Int | DEFAULT 0 | Thứ tự hiển thị |

**Cấu trúc JSON `exercises`:**
```json
[
  {
    "type": "multiple_choice",
    "question": "She ___ to work by bus.",
    "options": ["go", "goes", "going", "gone"],
    "answer": "goes"
  },
  {
    "type": "fill_blank",
    "question": "___ you like pizza?",
    "answer": "Do"
  }
]
```

---

## 4. Indexes và Constraints

| Bảng | Index | Mục đích |
|---|---|---|
| User | `email` UNIQUE | Đăng nhập không trùng |
| Progress | `(userId, wordId)` UNIQUE | 1 bản ghi / user / từ |
| Word | `topicId` FK | Truy vấn từ theo chủ đề |
| Message | `conversationId` FK | Lấy lịch sử chat |

---

## 5. Cascade Delete

| Quan hệ | Hành vi khi xóa cha |
|---|---|
| VocabularyTopic → Word | Xóa tất cả Word trong topic |
| Word → Progress | Xóa Progress của Word |
| User → Progress | Xóa Progress của User |
| User → Conversation | Xóa tất cả Conversation |
| Conversation → Message | Xóa tất cả Message trong Conversation |

---

## 6. Seed Data

Chạy lệnh để seed dữ liệu mẫu:
```bash
cd backend
npx prisma db seed
```

Dữ liệu được seed:
- **5 chủ đề từ vựng** × 20 từ = **100 từ vựng**
- **5 bài ngữ pháp** (basic × 3, structures × 1, conversational × 1)
- **3 bài nghe** (beginner × 2, intermediate × 1)
