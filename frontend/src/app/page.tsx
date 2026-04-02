'use client';

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button-link";
import { useAuth } from "@/hooks/useAuth";

const features = [
  {
    href: "/vocabulary",
    icon: "📚",
    title: "Từ vựng",
    description:
      "Học từ vựng qua flashcard với hệ thống lặp lại ngắt quãng (Spaced Repetition)",
    color: "bg-blue-50 border-blue-200",
    iconBg: "bg-blue-100",
  },
  {
    href: "/grammar",
    icon: "✏️",
    title: "Ngữ pháp",
    description: "Nắm vững ngữ pháp cơ bản và các cấu trúc câu thông dụng",
    color: "bg-green-50 border-green-200",
    iconBg: "bg-green-100",
  },
  {
    href: "/listening",
    icon: "🎧",
    title: "Luyện nghe",
    description: "Nghe và điền từ còn thiếu để cải thiện kỹ năng nghe",
    color: "bg-purple-50 border-purple-200",
    iconBg: "bg-purple-100",
  },
  {
    href: "/conversation",
    icon: "💬",
    title: "Hội thoại AI",
    description: "Luyện nói với AI trong các tình huống thực tế",
    color: "bg-orange-50 border-orange-200",
    iconBg: "bg-orange-100",
  },
];

export default function HomePage() {
  const { user } = useAuth();

  const handleAuthAction = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      window.location.href = `${apiUrl}/auth/google`;
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-blue-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Học tiếng Anh mỗi ngày
          </h1>
          <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Nền tảng học tiếng Anh toàn diện - Từ vựng, Ngữ pháp, Luyện nghe và
            Giao tiếp với AI
          </p>
          <ButtonLink
            href="/vocabulary"
            onClick={handleAuthAction}
            size="lg"
            variant="secondary"
            className="text-primary font-semibold"
          >
            Bắt đầu học ngay
          </ButtonLink>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-center mb-10">
          Các kỹ năng học tập
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <Link 
              key={feature.href} 
              href={feature.href}
              onClick={handleAuthAction}
            >
              <Card
                className={`h-full transition-all hover:shadow-lg hover:-translate-y-1 cursor-pointer border ${feature.color}`}
              >
                <CardHeader className="pb-3">
                  <div
                    className={`w-12 h-12 rounded-xl ${feature.iconBg} flex items-center justify-center text-2xl mb-3`}
                  >
                    {feature.icon}
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-muted py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-10">
            Phương pháp học hiệu quả
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Học từ mới",
                desc: "Học từ vựng qua flashcard với hình ảnh, phiên âm và ví dụ thực tế",
              },
              {
                step: "2",
                title: "Luyện tập",
                desc: "Ôn tập qua bài tập trắc nghiệm, điền từ và luyện phát âm",
              },
              {
                step: "3",
                title: "Giao tiếp",
                desc: "Thực hành nói với AI trong các tình huống giao tiếp thực tế",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
