# EnglishMaster - Tài liệu hệ thống

## Danh sách tài liệu

| File | Nội dung |
|---|---|
| [01-system-design.md](01-system-design.md) | Kiến trúc tổng thể, tech stack, cấu trúc thư mục |
| [02-database-design.md](02-database-design.md) | ERD, chi tiết các bảng, seed data |
| [03-api-design.md](03-api-design.md) | Tất cả API endpoints, request/response format |
| [04-user-flows.md](04-user-flows.md) | Luồng người dùng cho từng tính năng |
| [05-setup-guide.md](05-setup-guide.md) | Hướng dẫn cài đặt, chạy, troubleshooting |

## Tóm tắt nhanh

- **Frontend**: Next.js 16 → `http://localhost:3000`
- **Backend**: NestJS 11 → `http://localhost:3001`
- **Database**: SQLite (dev) / PostgreSQL (prod)
- **AI**: Google Gemini 2.0 Flash (free tier)
- **Speech**: Browser Web Speech API

## Quick Start

```bash
# Terminal 1 - Backend
cd backend && npm run start:dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```
