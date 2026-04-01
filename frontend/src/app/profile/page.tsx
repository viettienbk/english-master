'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ButtonLink } from '@/components/ui/button-link';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { getProfileStats, type ProfileStats } from '@/lib/api';
import { 
  User, 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  BarChart3, 
  Award, 
  PlayCircle,
  GraduationCap,
  Settings,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ProfilePage() {
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProfileStats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-8">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-muted rounded-full" />
            <div className="space-y-2">
              <div className="h-8 bg-muted rounded w-48" />
              <div className="h-4 bg-muted rounded w-64" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <div key={i} className="h-32 bg-muted rounded-xl" />)}
          </div>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const { user, vocabulary, ongoingLessons } = stats;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-12">
        <div className="relative group">
          <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center border-4 border-white shadow-xl overflow-hidden">
            {user.image ? (
              <img src={user.image} alt={user.name || ''} className="w-full h-full object-cover" />
            ) : (
              <User className="w-16 h-16 text-primary" />
            )}
          </div>
          <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg border hover:bg-slate-50 transition-colors">
            <Settings className="w-4 h-4 text-slate-600" />
          </button>
        </div>
        
        <div className="text-center md:text-left space-y-2 pt-2">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
            {user.name || 'Học viên'}
          </h1>
          <p className="text-slate-500 font-medium">{user.email}</p>
          <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-4">
            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-100 px-3 py-1">
              <Award className="w-3.5 h-3.5 mr-1.5" />
              Thành viên từ {new Date(user.createdAt).toLocaleDateString('vi-VN')}
            </Badge>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-100 px-3 py-1">
              <GraduationCap className="w-3.5 h-3.5 mr-1.5" />
              Đã thuộc {vocabulary.mastered} từ
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Progress & Stats */}
        <div className="lg:col-span-2 space-y-8">
          {/* Main Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <Card className="border-none shadow-md bg-gradient-to-br from-indigo-500 to-blue-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <BookOpen className="w-6 h-6 opacity-80" />
                  <span className="text-xs font-bold uppercase tracking-wider opacity-80">Tổng từ vựng</span>
                </div>
                <p className="text-3xl font-black">{vocabulary.learned}</p>
                <p className="text-xs mt-1 opacity-80">Trên tổng số {vocabulary.total} từ</p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <CheckCircle2 className="w-6 h-6 opacity-80" />
                  <span className="text-xs font-bold uppercase tracking-wider opacity-80">Đã thành thạo</span>
                </div>
                <p className="text-3xl font-black">{vocabulary.mastered}</p>
                <p className="text-xs mt-1 opacity-80">{vocabulary.percentage.toFixed(1)}% mục tiêu</p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md bg-gradient-to-br from-orange-500 to-amber-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Clock className="w-6 h-6 opacity-80" />
                  <span className="text-xs font-bold uppercase tracking-wider opacity-80">Đang học</span>
                </div>
                <p className="text-3xl font-black">{vocabulary.learning}</p>
                <p className="text-xs mt-1 opacity-80">Cần ôn tập thường xuyên</p>
              </CardContent>
            </Card>
          </div>

          {/* Ongoing Lessons */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <PlayCircle className="w-6 h-6 text-primary" />
                Bài học đang dang dở
              </h2>
            </div>
            
            {ongoingLessons.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ongoingLessons.map((p) => (
                  <Link 
                    key={p.id} 
                    href={`/${p.lessonType}/${p.lessonId}`}
                    className="group"
                  >
                    <Card className="hover:shadow-lg transition-all duration-300 border-slate-100 group-hover:border-primary/20">
                      <CardContent className="p-5 flex items-center gap-4">
                        <div className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                          p.lessonType === 'listening' ? "bg-blue-100 text-blue-600" : "bg-purple-100 text-purple-600"
                        )}>
                          {p.lessonType === 'listening' ? <Clock className="w-6 h-6" /> : <BookOpen className="w-6 h-6" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-[10px] uppercase px-1.5 py-0">
                              {p.lessonType === 'listening' ? 'Nghe' : 'Ngữ pháp'}
                            </Badge>
                            <span className="text-[10px] text-slate-400 font-medium">
                              {new Date(p.lastStudied).toLocaleDateString('vi-VN')}
                            </span>
                          </div>
                          <h3 className="font-bold text-slate-800 truncate group-hover:text-primary transition-colors">
                            {p.details?.titleVi || p.details?.title}
                          </h3>
                        </div>
                        <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-slate-50 rounded-2xl p-12 text-center border-2 border-dashed border-slate-200">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <PlayCircle className="w-8 h-8 text-slate-300" />
                </div>
                <p className="text-slate-500 font-medium">Bạn chưa có bài học nào đang dở. Hãy bắt đầu ngay!</p>
                <div className="flex justify-center gap-4 mt-6">
                  <ButtonLink href="/vocabulary" variant="outline" size="sm">Học từ vựng</ButtonLink>
                  <ButtonLink href="/listening" variant="outline" size="sm">Luyện nghe</ButtonLink>
                </div>
              </div>
            )}
          </section>
        </div>

        {/* Right Column: Vocabulary Analytics & Actions */}
        <div className="space-y-8">
          <Card className="shadow-md border-slate-100 overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Phân tích từ vựng
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-bold">
                    <span className="text-emerald-600">Đã thuộc</span>
                    <span>{vocabulary.mastered} từ</span>
                  </div>
                  <Progress value={(vocabulary.mastered / vocabulary.total) * 100} className="h-2 bg-slate-100" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-bold">
                    <span className="text-orange-500">Đang học</span>
                    <span>{vocabulary.learning} từ</span>
                  </div>
                  <Progress value={(vocabulary.learning / vocabulary.total) * 100} className="h-2 bg-slate-100" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-bold">
                    <span className="text-slate-400">Chưa học</span>
                    <span>{vocabulary.new} từ</span>
                  </div>
                  <Progress value={(vocabulary.new / vocabulary.total) * 100} className="h-2 bg-slate-100" />
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 flex flex-col gap-3">
                <ButtonLink 
                  href="/profile/mastered" 
                  className="w-full justify-between h-12 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-none"
                >
                  <span className="flex items-center gap-2">
                    <Award className="w-4 h-4" />
                    Ôn tập từ đã thuộc
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </ButtonLink>
                
                <ButtonLink 
                  href="/profile/new-words" 
                  className="w-full justify-between h-12 bg-blue-50 text-blue-700 hover:bg-blue-100 border-none"
                >
                  <span className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4" />
                    Học từ vựng mới
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </ButtonLink>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md border-slate-100 bg-slate-900 text-white">
            <CardContent className="p-6 text-center space-y-4">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                <Award className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-bold">Mục tiêu hằng ngày</h3>
              <p className="text-sm text-slate-400">Bạn đã hoàn thành 0/5 bài tập hôm nay. Cố gắng lên!</p>
              <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                <div className="w-0 h-full bg-primary transition-all duration-1000" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
