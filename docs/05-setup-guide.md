# Hướng dẫn Cài đặt & Chạy hệ thống (Setup Guide)

## 1. Yêu cầu hệ thống

| Phần mềm | Phiên bản tối thiểu |
|---|---|
| Node.js | 20.11+ |
| npm | 10+ |
| Git | Bất kỳ |
| Trình duyệt | Chrome / Edge (hỗ trợ Web Speech API tốt nhất) |

---

## 2. Lấy Gemini API Key (miễn phí)

1. Truy cập **aistudio.google.com**
2. Đăng nhập Google account
3. Click **Get API Key** → **Create API key**
4. Copy key (bắt đầu bằng `AIza...`)

**Giới hạn free tier:**
- 15 requests / phút
- 1 triệu tokens / ngày
- Hoàn toàn miễn phí

---

## 3. Cài đặt Backend (NestJS)

```bash
# Di chuyển vào thư mục backend
cd english/backend

# Cài dependencies
npm install

# Cấu hình environment
# Mở file .env và thay your_gemini_api_key_here bằng key thực
# DATABASE_URL="file:./dev.db"
# PORT=3001
# CORS_ORIGIN=http://localhost:3000
# GEMINI_API_KEY=AIza...

# Tạo database và chạy migration
npx prisma migrate dev

# Seed dữ liệu mẫu (100 từ vựng, 5 bài ngữ pháp, 3 bài nghe)
npx prisma db seed

# Chạy backend (development mode với hot-reload)
npm run start:dev
# → Server chạy tại http://localhost:3001
```

---

## 4. Cài đặt Frontend (Next.js)

```bash
# Di chuyển vào thư mục frontend
cd english/frontend

# Cài dependencies
npm install

# File .env.local đã có sẵn:
# NEXT_PUBLIC_API_URL=http://localhost:3001/api

# Chạy frontend (development mode)
npm run dev
# → Mở http://localhost:3000
```

---

## 5. Kiểm tra hệ thống

### Kiểm tra Backend API:
```bash
# Lấy danh sách chủ đề từ vựng
curl http://localhost:3001/api/vocabulary/topics

# Lấy bài nghe
curl http://localhost:3001/api/listening/lessons

# Lấy bài ngữ pháp
curl http://localhost:3001/api/grammar/lessons

# Lấy chủ đề hội thoại
curl http://localhost:3001/api/conversation/topics
```

### Kiểm tra tính năng:
1. Mở Chrome/Edge → `http://localhost:3000`
2. **Từ vựng**: Vào "Daily Life" → Click "Học Flashcard" → Lật thẻ, nghe phát âm
3. **Quiz**: Click "Làm bài tập" → Chọn đáp án → Xem kết quả
4. **Ngữ pháp**: Vào bài "Present Simple Tense" → Đọc + Làm bài tập
5. **Luyện nghe**: Vào "At the Airport" → Play → Điền từ → Kiểm tra
6. **Hội thoại**: Chọn "Du lịch" → Chat với AI

---

## 6. Cấu trúc file `.env`

### Backend (`backend/.env`):
```env
DATABASE_URL="file:./dev.db"
PORT=3001
CORS_ORIGIN=http://localhost:3000
GEMINI_API_KEY=AIzaSy...  # Bắt buộc cho tính năng Hội thoại AI
```

### Frontend (`frontend/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

---

## 7. Các lệnh hữu ích

### Backend:
```bash
# Chạy development
npm run start:dev

# Build production
npm run build

# Chạy production
npm run start:prod

# Xem database với Prisma Studio
npx prisma studio  # → http://localhost:5555

# Reset và seed lại database
npx prisma migrate reset  # Cẩn thận! Xóa toàn bộ data
npx prisma db seed
```

### Frontend:
```bash
# Chạy development
npm run dev

# Build production
npm run build

# Kiểm tra TypeScript
npm run lint
```

---

## 8. Troubleshooting

### Lỗi "CORS error" trên frontend:
- Kiểm tra backend đang chạy tại port 3001
- Kiểm tra `CORS_ORIGIN` trong `backend/.env` là `http://localhost:3000`

### Lỗi "Conversation failed" / AI không phản hồi:
- Kiểm tra `GEMINI_API_KEY` trong `backend/.env` đã được set
- Kiểm tra key hợp lệ tại aistudio.google.com

### Lỗi "Cannot find module @prisma/client":
```bash
cd backend
npx prisma generate
```

### Web Speech API không hoạt động:
- Dùng Chrome hoặc Edge (Firefox hỗ trợ hạn chế)
- Cấp quyền microphone khi trình duyệt hỏi

---

## 9. Thêm dữ liệu mới

### Thêm từ vựng mới:
Mở `backend/prisma/seed/vocabulary.json`, thêm topic hoặc từ vào topic có sẵn, sau đó chạy lại seed:
```bash
cd backend
npx prisma db seed
```

### Thêm bài ngữ pháp:
Mở `backend/prisma/seed/grammar.json`, thêm bài mới với cấu trúc:
```json
{
  "title": "Future Simple Tense",
  "titleVi": "Thì tương lai đơn",
  "level": "beginner",
  "category": "basic",
  "order": 6,
  "content": "## Future Simple...",
  "examples": [...],
  "exercises": [...]
}
```
