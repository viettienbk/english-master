# Tài liệu Thiết kế API (API Design Document)

## 1. Tổng quan

- **Base URL**: `http://localhost:3001/api`
- **Format**: JSON (Content-Type: application/json)
- **CORS**: Chỉ cho phép từ `http://localhost:3000`
- **Validation**: class-validator (NestJS pipes)

---

## 2. Vocabulary API

### GET `/api/vocabulary/topics`
Lấy danh sách tất cả chủ đề từ vựng.

**Query params:**
| Param | Kiểu | Bắt buộc | Mô tả |
|---|---|---|---|
| level | string | Không | `beginner` / `intermediate` / `advanced` |

**Response 200:**
```json
[
  {
    "id": "cmndbxvt90000l2jr...",
    "name": "Daily Life",
    "nameVi": "Cuộc sống hàng ngày",
    "description": "Common words used in everyday situations",
    "level": "beginner",
    "imageUrl": null,
    "order": 1,
    "createdAt": "2026-03-30T15:15:20.781Z",
    "_count": { "words": 20 }
  }
]
```

---

### GET `/api/vocabulary/topics/:id`
Lấy chi tiết một chủ đề kèm danh sách từ vựng.

**Response 200:**
```json
{
  "id": "cmndbxvt90000l2jr...",
  "name": "Daily Life",
  "nameVi": "Cuộc sống hàng ngày",
  "level": "beginner",
  "words": [
    {
      "id": "cmndby...",
      "word": "breakfast",
      "phonetic": "/ˈbrekfəst/",
      "partOfSpeech": "noun",
      "definition": "The first meal of the day",
      "definitionVi": "Bữa sáng",
      "example": "I usually have breakfast at 7 AM.",
      "exampleVi": "Tôi thường ăn sáng lúc 7 giờ.",
      "imageUrl": null,
      "audioUrl": null
    }
  ]
}
```

---

### GET `/api/vocabulary/topics/:id/words`
Lấy chỉ danh sách từ của một chủ đề (không có topic metadata).

---

### GET `/api/vocabulary/words/:id`
Lấy chi tiết một từ vựng.

---

### GET `/api/vocabulary/search?q=keyword`
Tìm kiếm từ theo keyword.

**Query params:**
| Param | Kiểu | Bắt buộc | Mô tả |
|---|---|---|---|
| q | string | Có | Từ khóa tìm kiếm |

---

## 3. Grammar API

### GET `/api/grammar/lessons`
Lấy danh sách bài học ngữ pháp.

**Query params:**
| Param | Kiểu | Mô tả |
|---|---|---|
| level | string | `beginner` / `intermediate` / `advanced` |
| category | string | `basic` / `structures` / `conversational` |

**Response 200:**
```json
[
  {
    "id": "cmndby...",
    "title": "Present Simple Tense",
    "titleVi": "Thì hiện tại đơn",
    "level": "beginner",
    "category": "basic",
    "content": "## Present Simple Tense\n\n...",
    "examples": "[{\"english\":\"I go to school\",\"vietnamese\":\"Tôi đi học\",\"explanation\":\"...\"}]",
    "exercises": "[{\"type\":\"multiple_choice\",\"question\":\"She ___ to work\",\"options\":[\"go\",\"goes\"],\"answer\":\"goes\"}]",
    "order": 1
  }
]
```

---

### GET `/api/grammar/lessons/:id`
Lấy chi tiết một bài học ngữ pháp.

---

## 4. Listening API

### GET `/api/listening/lessons`
Lấy danh sách bài nghe.

**Query params:**
| Param | Mô tả |
|---|---|
| level | Lọc theo cấp độ |

---

### GET `/api/listening/lessons/:id`
Lấy chi tiết một bài nghe.

**Response 200:**
```json
{
  "id": "...",
  "title": "At the Airport",
  "titleVi": "Tại sân bay",
  "level": "beginner",
  "audioUrl": "/audio/at-the-airport.mp3",
  "transcript": "Good morning. Welcome to the check-in counter...",
  "blanks": "[{\"position\":0,\"answer\":\"passport\",\"hint\":\"An official travel document\"},{\"position\":1,\"answer\":\"luggage\",\"hint\":\"Bags for traveling\"}]",
  "translation": "Chào buổi sáng. Chào mừng đến quầy check-in..."
}
```

---

### POST `/api/listening/lessons/:id/check`
Kiểm tra đáp án bài nghe.

**Request body:**
```json
{
  "answers": {
    "0": "passport",
    "1": "luggage",
    "2": "suitcase"
  }
}
```
> Key là position (dạng string), value là đáp án user nhập.

**Response 200:**
```json
{
  "score": 80,
  "correct": 4,
  "total": 5,
  "results": [
    { "position": 0, "correctAnswer": "passport", "userAnswer": "passport", "isCorrect": true },
    { "position": 1, "correctAnswer": "luggage", "userAnswer": "luggage", "isCorrect": true },
    { "position": 2, "correctAnswer": "suitcase", "userAnswer": "suitecase", "isCorrect": false }
  ]
}
```

---

## 5. Conversation API

### GET `/api/conversation/topics`
Lấy danh sách chủ đề hội thoại.

**Response 200:**
```json
[
  { "id": "travel", "name": "Du lịch", "nameEn": "Travel", "scenario": "You are at an airport checking in for a flight to London." },
  { "id": "restaurant", "name": "Nhà hàng", "nameEn": "Restaurant", "scenario": "You are ordering food at a restaurant." }
]
```

---

### POST `/api/conversation/start`
Bắt đầu phiên hội thoại mới với AI.

**Request body:**
```json
{
  "topicId": "travel",
  "userId": "optional-user-id"
}
```

**Response 200:**
```json
{
  "conversation": {
    "id": "conv123...",
    "userId": "guest",
    "topic": "travel",
    "scenario": "You are at an airport..."
  },
  "message": "Good morning! Welcome to Heathrow Airport check-in. May I see your passport please?\n\n💡 Suggested:\n- Here is my passport.\n- I also have my boarding pass.\n- Where do I check in my luggage?"
}
```

> **Lưu ý**: Frontend lưu message này vào `sessionStorage` trước khi redirect sang trang hội thoại.

---

### POST `/api/conversation/:id/message`
Gửi tin nhắn trong phiên hội thoại.

**Request body:**
```json
{
  "message": "Here is my passport. I have one suitcase to check in."
}
```

**Response 200:**
```json
{
  "message": "Thank you! Your passport looks good. How many bags are you checking in today?\n\n💡 Suggested:\n- I have one suitcase.\n- I only have carry-on luggage.\n- Could I check in two bags?"
}
```

---

### GET `/api/conversation/:id`
Lấy chi tiết và lịch sử tin nhắn của một phiên hội thoại.

---

## 6. Error Responses

| HTTP Status | Mô tả |
|---|---|
| 400 | Bad Request - Dữ liệu đầu vào không hợp lệ |
| 404 | Not Found - Không tìm thấy resource |
| 500 | Internal Server Error - Lỗi server hoặc Gemini API |

**Format lỗi:**
```json
{
  "statusCode": 404,
  "message": "Topic not found",
  "error": "Not Found"
}
```

---

## 7. Luồng gọi API từ Frontend

```
Frontend (api.ts)
      │
      ├── getTopics()           → GET /api/vocabulary/topics
      ├── getTopicById(id)      → GET /api/vocabulary/topics/:id
      ├── searchWords(q)        → GET /api/vocabulary/search?q=...
      │
      ├── getGrammarLessons()   → GET /api/grammar/lessons
      ├── getGrammarLessonById()→ GET /api/grammar/lessons/:id
      │
      ├── getListeningLessons() → GET /api/listening/lessons
      ├── checkListeningAnswers → POST /api/listening/lessons/:id/check
      │
      ├── getConversationTopics → GET /api/conversation/topics
      ├── startConversation()   → POST /api/conversation/start
      └── sendMessage()         → POST /api/conversation/:id/message
```
