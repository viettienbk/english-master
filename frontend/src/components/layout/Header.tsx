'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

const navItems = [
  { href: '/', label: 'Trang chủ', icon: '🏠' },
  { href: '/vocabulary', label: 'Từ vựng', icon: '📚' },
  { href: '/grammar', label: 'Ngữ pháp', icon: '✏️' },
  { href: '/listening', label: 'Luyện nghe', icon: '🎧' },
  { href: '/conversation', label: 'Hội thoại AI', icon: '💬' },
  { href: '/profile', label: 'Cá nhân', icon: '👤' },
];

export default function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  const handleLogin = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
    window.location.href = `${apiUrl}/auth/google`;
  };

  return (
    <header className="sticky top-0 z-50 bg-primary text-primary-foreground shadow-md">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <span className="text-2xl">📖</span>
            <span>EnglishMaster</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
                    ? 'bg-white/20 text-white'
                    : 'text-white/80 hover:bg-white/10 hover:text-white',
                )}
              >
                <span className="mr-1.5">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <Link href="/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                  <img
                    src={user.image}
                    alt={user.name}
                    className="w-8 h-8 rounded-full border-2 border-white/20"
                  />
                  <span className="text-sm font-medium">{user.name}</span>
                </Link>
                <button
                  onClick={logout}
                  className="text-xs text-white/60 hover:text-white underline ml-2"
                >
                  Đăng xuất
                </button>
              </div>
            ) : (
              <Button
                onClick={handleLogin}
                variant="secondary"
                size="sm"
                className="bg-white text-primary hover:bg-white/90"
              >
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Đăng nhập
              </Button>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-white/10"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile nav */}
        {menuOpen && (
          <nav className="md:hidden pb-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={cn(
                  'block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
                    ? 'bg-white/20 text-white'
                    : 'text-white/80 hover:bg-white/10',
                )}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </Link>
            ))}
            {user ? (
              <div className="px-4 py-2 flex items-center justify-between border-t border-white/10 mt-2 pt-4">
                <Link href="/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-2">
                  <img src={user.image} alt={user.name} className="w-8 h-8 rounded-full" />
                  <span className="text-sm font-medium">{user.name}</span>
                </Link>
                <button onClick={logout} className="text-sm text-white/60">Đăng xuất</button>
              </div>
            ) : (
              <div className="px-4 pt-4 border-t border-white/10 mt-2">
                <Button onClick={handleLogin} variant="secondary" className="w-full bg-white text-primary">
                  Đăng nhập với Google
                </Button>
              </div>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
