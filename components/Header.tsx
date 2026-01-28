
import React, { useContext, useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AdminContext } from '../App';

const Header: React.FC = () => {
  const location = useLocation();
  const { isAdmin, setIsAdmin } = useContext(AdminContext);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 관리자 로그인 모달 상태 복구
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // 모바일 메뉴 열려있을 때 스크롤 방지
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMobileMenuOpen]);

  // 페이지 이동 시 모바일 메뉴 닫기
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const navItems = [
    { label: '교회소개', path: '/pastor-message' },
    { label: '예배안내', path: '/worship-info' },
    { label: '온라인예배', path: '/online-worship' },
    { label: '은혜나눔', path: '/grace-sharing' },
    { label: '오늘의 QT', path: '/checklist' },
    { label: 'AI길잡이', path: '/ai-guide' },
    { label: '오시는길', path: '/directions' },
    { label: '새가족', path: '/newcomers' },
  ];

  useEffect(() => {
    if (isLoginModalOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isLoginModalOpen]);

  const handleAdminClick = () => {
    if (isAdmin) {
      // 즉시 종료하고 안내 표시
      setIsAdmin(false);
      alert('관리자 모드가 안전하게 종료되었습니다.');
    } else {
      setIsLoginModalOpen(true);
      setLoginError(false);
      setPasswordInput('');
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === '0191') {
      setIsAdmin(true);
      setIsLoginModalOpen(false);
      alert('관리자 모드가 활성화되었습니다.');
    } else {
      setLoginError(true);
      setPasswordInput('');
      inputRef.current?.focus();
    }
  };

  return (
    <>
      <header className={`sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b shadow-sm transition-all duration-300 ${isAdmin ? 'border-red-500 bg-red-50/30' : 'border-gray-100'}`}>
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">

          {/* Left Container (Hamburger & Desktop Nav) */}
          <div className="flex-1 flex items-center justify-start">
            <button
              className="lg:hidden p-2 text-slate-600 hover:text-blue-600 transition-colors"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <span className="material-symbols-outlined text-3xl">menu</span>
            </button>

            <div className="hidden lg:flex gap-6">
              {navItems.slice(0, 4).map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`text-sm font-bold transition-all hover:text-blue-600 hover:scale-105 ${location.pathname === item.path ? 'text-blue-600' : 'text-slate-600'
                    }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Center Logo */}
          <Link to="/" className="flex items-center gap-3 px-2 lg:px-8 text-center group">
            <div className="flex flex-col items-center transition-transform group-hover:scale-110">
              <span className={`material-symbols-outlined text-3xl md:text-4xl transition-colors duration-500 ${isAdmin ? 'text-red-600 animate-pulse' : 'text-blue-600'}`}>church</span>
              <h1 className="font-myeongjo text-xl md:text-2xl font-extrabold tracking-tight text-slate-900">성남신광교회</h1>
            </div>
          </Link>

          {/* Right Nav & Admin Button */}
          <div className="flex-1 flex justify-end items-center gap-6">
            <div className="hidden lg:flex gap-6">
              {navItems.slice(4).map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`text-sm font-bold transition-all hover:text-blue-600 hover:scale-105 ${location.pathname === item.path ? 'text-blue-600' : 'text-slate-600'
                    }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <button
              onClick={handleAdminClick}
              className={`group relative overflow-hidden rounded-full transition-all flex items-center justify-center shadow-lg active:scale-95 size-9 ${isAdmin
                ? 'bg-white text-red-600 border-2 border-red-50 shadow-red-100 animate-in fade-in zoom-in-95'
                : 'bg-slate-900 text-white hover:bg-blue-600 shadow-slate-200'
                }`}
              title={isAdmin ? '관리자 종료' : '관리자 접속'}
            >
              <span className="material-symbols-outlined text-lg transition-transform group-hover:rotate-12">
                {isAdmin ? 'admin_panel_settings' : 'lock_open'}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[100] bg-white animate-in slide-in-from-left duration-300 flex flex-col">
          <div className="h-20 px-4 flex items-center justify-between border-b border-gray-100">
            <h2 className="font-myeongjo text-2xl font-black text-slate-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-600">church</span> 성남신광교회
            </h2>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 text-slate-400 hover:text-slate-900 transition-colors"
            >
              <span className="material-symbols-outlined text-3xl">close</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-6 px-4">
            <nav className="flex flex-col gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`p-4 rounded-2xl text-lg font-bold flex items-center justify-between transition-all ${location.pathname === item.path
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-slate-600 hover:bg-gray-50'
                    }`}
                >
                  {item.label}
                  <span className="material-symbols-outlined text-slate-300">chevron_right</span>
                </Link>
              ))}
            </nav>

            <div className="mt-8 p-6 bg-slate-50 rounded-3xl text-center">
              <p className="text-sm text-slate-500 font-medium mb-1">성남시 중원구 둔촌대로 148</p>
              <p className="text-xs text-slate-400">© 2026 Seongnam Shinkwang Church</p>
            </div>
          </div>
        </div>
      )}

      {/* Admin Login Modal */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-[360px] rounded-[2.5rem] shadow-2xl p-8 border border-gray-100 animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center gap-4 mb-6">
              <div className="size-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner">
                <span className="material-symbols-outlined text-3xl">admin_panel_settings</span>
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">관리자 인증</h3>
                <p className="text-[11px] text-slate-400 font-medium mt-1">시스템 설정을 위한 비밀번호를 입력하세요.</p>
              </div>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-slate-400 ml-1 uppercase tracking-widest">비밀번호</label>
                <input
                  ref={inputRef}
                  type="password"
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    setLoginError(false);
                  }}
                  className={`w-full bg-gray-50 border-2 rounded-2xl p-3 text-center text-2xl font-bold tracking-[0.5em] outline-none transition-all ${loginError ? 'border-red-500 bg-red-50 animate-shake' : 'border-gray-100 focus:border-blue-600 focus:bg-white'
                    }`}
                  placeholder="••••"
                  maxLength={4}
                />
                {loginError && (
                  <p className="text-[10px] text-red-500 font-bold text-center mt-2">비밀번호가 일치하지 않습니다.</p>
                )}
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsLoginModalOpen(false)}
                  className="flex-1 py-3.5 rounded-xl font-bold text-slate-400 hover:bg-gray-100 transition-colors text-sm"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all text-sm"
                >
                  로그인
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.2s ease-in-out 0s 2;
        }
      `}</style>
    </>
  );
};

export default Header;
