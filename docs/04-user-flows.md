# Tài liệu Luồng Người dùng (User Flows)

## 1. Luồng học Từ vựng (Vocabulary Flow)

```
[Trang chủ]
     │
     ▼
[/vocabulary] ── Danh sách chủ đề
     │              ┌──────────────────┐
     │              │ Daily Life       │  20 từ  [beginner]
     │              │ Travel & Tourism │  20 từ  [beginner]
     │              │ Business & Work  │  20 từ  [intermediate]
     │              │ Food & Restaurant│  20 từ  [beginner]
     │              │ Health & Wellness│  20 từ  [intermediate]
     │              └──────────────────┘
     │ Click chủ đề
     ▼
[/vocabulary/:topicId] ── Chi tiết chủ đề
     │
     │  ┌─────────────────────────────────┐
     │  │ [Học Flashcard]  [Làm bài tập] │
     │  └─────────────────────────────────┘
     │         │                │
     ▼         ▼                ▼
     │  [/flashcard]      [/quiz]
     │       │                 │
     │  Lật thẻ           Trắc nghiệm
     │  Phát âm           (4 đáp án)
     │  ← → Navigate      Tự động chấm
     │  Xem hết → Quiz    Xem kết quả
     └──────────────────────────────────
```

### 1.1 Luồng chi tiết Flashcard

```
Start
  │
  ▼
Hiển thị mặt trước thẻ:
  - Từ tiếng Anh (lớn, màu primary)
  - Phiên âm IPA
  - Loại từ (badge)
  - Nút 🔊 Phát âm
  │
  │ Click vào thẻ
  ▼
Hiển thị mặt sau thẻ (flip animation):
  - Nghĩa tiếng Anh
  - Nghĩa tiếng Việt
  - Câu ví dụ
  - Dịch câu ví dụ
  - Nút 🔊 Nghe ví dụ
  │
  ├── [← Trước]  →  Thẻ trước
  ├── [Phát âm]  →  TTS phát từ
  └── [Tiếp →]   →  Thẻ tiếp theo
             │
             │ Thẻ cuối cùng
             ▼
     ┌─────────────────────┐
     │ 🎉 Bạn đã xem hết! │
     │ [Học lại] [Quiz]   │
     └─────────────────────┘
```

### 1.2 Luồng Quiz

```
Tạo 20 câu hỏi ngẫu nhiên (shuffle)
  │
  ▼
Mỗi câu hỏi:
  ├── Type A: "Chọn nghĩa đúng của từ: [WORD]"
  │     → 4 options: đáp án đúng + 3 từ sai ngẫu nhiên
  │
  └── Type B: "Từ nào có nghĩa: [DEFINITION]"
        → 4 options: từ đúng + 3 từ khác trong topic

User click đáp án
  │
  ├── Đúng: highlight xanh ✅ + tăng score
  └── Sai:  highlight đỏ ❌ + highlight đáp án đúng màu xanh
  │
  ▼
[Câu tiếp theo] hoặc [Xem kết quả]
  │
  ▼ (câu cuối)
┌─────────────────────────────┐
│  Kết quả: X/20 (Y%)         │
│  🎉 / 👍 / 💪              │
│  [Làm lại]  [Quay lại]     │
└─────────────────────────────┘
```

---

## 2. Luồng học Ngữ pháp (Grammar Flow)

```
[/grammar] ── 3 tab: Ngữ pháp cơ bản | Cấu trúc câu | Ngữ pháp giao tiếp
     │
     │ Click bài học
     ▼
[/grammar/:lessonId]
  │
  ├── 1. Đọc nội dung bài học (Markdown render)
  │       - Tiêu đề, giải thích
  │       - Cấu trúc câu
  │       - Signal words
  │
  ├── 2. Xem ví dụ song ngữ
  │       - Câu tiếng Anh
  │       - Nghĩa tiếng Việt
  │       - Giải thích ngữ pháp
  │       - 🔊 Phát âm câu ví dụ
  │
  └── 3. Làm bài tập [optional]
          │
          │ Click [Làm bài tập]
          ▼
      Hiện form bài tập:
        ├── Multiple choice: click chọn đáp án
        └── Fill blank: nhập text vào ô
          │
          │ Click [Kiểm tra đáp án]
          ▼
      Hiện kết quả từng câu:
        - ✅ Đúng: highlight xanh
        - ❌ Sai: highlight đỏ + hiện đáp án đúng
          │
          ▼
      Điểm: X/Y (Z%)
      [Làm lại] [Bài khác]
```

---

## 3. Luồng Luyện nghe (Listening Flow)

```
[/listening] ── Danh sách bài nghe (sắp xếp theo order)
     │
     │ Click bài học
     ▼
[/listening/:lessonId]
  │
  ├── 1. Audio Player
  │       [▶ Play] → TTS đọc toàn bộ transcript
  │
  ├── 2. Transcript với ô trống
  │       "Good morning. Welcome to the [___] counter."
  │                                        ↑
  │                               Ô input điền từ
  │                               Hint: "An official travel document"
  │
  ├── 3. User điền tất cả ô trống
  │
  │ Click [Kiểm tra đáp án]
  ▼
  ├── API: POST /api/listening/lessons/:id/check
  │
  └── Hiện kết quả:
        - Score: X/Y câu đúng (Z%)
        - Từng ô: ✅/❌ + đáp án đúng
        │
        │ (sau khi xem kết quả)
        ▼
      [Xem bản dịch] (toggle)
        - Hiển thị bản dịch tiếng Việt
      │
      ▼
      [Làm lại] [Bài khác]
```

---

## 4. Luồng Hội thoại AI (Conversation Flow)

```
[/conversation] ── Chọn chủ đề
     │              ┌───────────────────────────┐
     │              │ ✈️ Du lịch - Travel       │
     │              │ 🍽️ Nhà hàng - Restaurant  │
     │              │ 🛍️ Mua sắm - Shopping     │
     │              │ 💼 Phỏng vấn - Interview  │
     │              │ 🏥 Khám bệnh - Doctor      │
     │              │ ☕ Hội thoại hàng ngày     │
     │              └───────────────────────────┘
     │ Click [Bắt đầu hội thoại]
     ▼
API: POST /api/conversation/start { topicId }
     │
     ├── Backend: Tạo Conversation record
     ├── Backend: Gọi Gemini API với system prompt
     └── Backend: Lưu AI message đầu tiên
     │
     │ Redirect → /conversation/:sessionId
     │ (Initial message lưu trong sessionStorage)
     ▼
[/conversation/:sessionId]
     │
     ├── Hiển thị tin nhắn AI đầu tiên
     │   ┌──────────────────────────────────────┐
     │   │ AI: Good morning! Welcome to...      │
     │   │ 🔊 Nghe                              │
     │   │                                      │
     │   │ Gợi ý câu trả lời:                   │
     │   │ [Here is my passport]                │
     │   │ [I have one suitcase]                │
     │   └──────────────────────────────────────┘
     │
     │ User nhập hoặc click gợi ý
     ▼
[Input box] → Enter / Click [Gửi]
     │
     ├── Hiển thị tin nhắn user (bubble phải, màu primary)
     ├── Hiển thị typing indicator (...)
     │
     │ API: POST /api/conversation/:id/message { message }
     ├── Backend: Lưu user message
     ├── Backend: Gọi Gemini với full history
     └── Backend: Lưu AI response
     │
     ▼
Hiển thị AI response:
  - Nội dung phản hồi
  - 🔊 Nút nghe (TTS)
  - 💡 Gợi ý câu tiếp theo (3 câu)
     │
     └── Vòng lặp: User nhập → AI trả lời
```

### 4.1 Cấu trúc AI Response

```
AI response được parse thành 2 phần:

"Thank you! I can see your passport.
 Are you checking any luggage today?

💡 Suggested:
- Yes, I have one suitcase.
- No, I only have carry-on luggage.
- How much does extra luggage cost?"

                    │
                    ▼ parseAIMessage()
┌────────────────────────────────────────┐
│ main: "Thank you! I can see your..."  │  → Hiển thị trong bubble
│ suggestions: [                         │
│   "Yes, I have one suitcase.",         │  → Hiển thị dưới dạng
│   "No, I only have carry-on luggage.", │    button gợi ý
│   "How much does extra luggage cost?" │
│ ]                                      │
└────────────────────────────────────────┘
```

---

## 5. Luồng Text-to-Speech (TTS)

```
User click 🔊 (bất kỳ nơi nào)
     │
     ▼
useSpeechSynthesis hook
     │
     ├── window.speechSynthesis.cancel()  (hủy audio đang chạy)
     ├── new SpeechSynthesisUtterance(text)
     ├── utterance.lang = 'en-US'
     ├── utterance.rate = 0.9 (chậm hơn chút cho người học)
     └── Tìm voice tiếng Anh (Google voice ưu tiên)
     │
     ▼
window.speechSynthesis.speak(utterance)
     │
     └── Audio phát qua loa/tai nghe
```

---

## 6. Luồng dữ liệu Backend → Frontend

```
Browser (Next.js)
    │
    │ 1. Page render / useEffect()
    ▼
api.ts fetchApi()
    │
    │ 2. fetch(`${API_BASE}/vocabulary/topics`)
    ▼
NestJS (port 3001)
    │
    │ 3. VocabularyController.getTopics()
    ▼
VocabularyService.getTopics()
    │
    │ 4. prisma.vocabularyTopic.findMany({
    │      include: { _count: { select: { words: true } } }
    │    })
    ▼
SQLite (dev.db)
    │
    │ 5. SQL: SELECT * FROM VocabularyTopic...
    ▼
Kết quả trả về ngược lại: DB → Service → Controller → HTTP Response → Frontend
```

---

## 7. Luồng Gemini AI

```
Frontend
    │ POST /api/conversation/:id/message
    │ { message: "Here is my passport" }
    ▼
ConversationController
    │
    ▼
ConversationService.sendMessage()
    │
    ├── Lưu user message vào DB
    ├── Lấy lịch sử hội thoại từ DB
    │
    ▼
GoogleGenerativeAI (Gemini 2.0 Flash)
    │
    ├── System instruction: scenario + rules
    ├── History: toàn bộ tin nhắn trước đó
    └── Tin nhắn mới: "Here is my passport"
    │
    ▼
Gemini API response
    │
    ├── Lưu AI message vào DB
    └── Return { message: "AI response text" }
    │
    ▼
Frontend hiển thị AI response
```

---

## 8. State Management

Frontend không dùng global state (Redux/Zustand). Thay vào đó:

| Loại state | Cách quản lý |
|---|---|
| API data (topics, words) | `useState` + `useEffect` trong từng page |
| UI state (flipped, answers) | `useState` local trong component |
| Initial AI message | `sessionStorage` (tạm thời khi redirect) |
| Speech | Browser Web Speech API (không cần state) |
| URL params | `useParams()` từ Next.js |
