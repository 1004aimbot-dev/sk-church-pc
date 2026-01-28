
import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AdminContext } from '../App';

const Home: React.FC = () => {
  const { isAdmin } = useContext(AdminContext);
  const churchAddress = "경기도 성남시 중원구 둔촌대로 148";

  // 상태 관리 (DB 연동)
  const [content, setContent] = useState({
    heroTitle: "하나님을 기쁘시게,\n 사람을 행복하게",
    heroSub: "성남신광교회에 오신 여러분을 환영합니다.\n온 성도가 사랑으로 여러분을 맞이합니다.",
    heroImg: "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&q=80&w=1600",
    worshipBadge: "주일 대예배 오전 11:00"
  });

  useEffect(() => {
    // 로컬 스토리지에서 콘텐츠 불러오기
    const savedContent = localStorage.getItem('sgch_home_content');
    if (savedContent) {
      try {
        setContent(prev => ({ ...prev, ...JSON.parse(savedContent) }));
      } catch (e) {
        console.error("Failed to parse local content", e);
      }
    }
  }, []);

  const handleEdit = (key: string, label: string) => {
    const newValue = prompt(`${label} 수정:`, content[key as keyof typeof content]);
    if (newValue !== null) {
      const updatedContent = { ...content, [key]: newValue };
      setContent(updatedContent); // UI 즉시 반영

      // 로컬 스토리지 저장
      localStorage.setItem('sgch_home_content', JSON.stringify(updatedContent));
    }
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className={`relative h-[600px] flex items-center justify-center bg-slate-900 overflow-hidden text-center text-white transition-all ${isAdmin ? 'ring-2 ring-red-500/20' : ''}`}>
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40 scale-105"
          style={{ backgroundImage: `url("${content.heroImg}")` }}
        ></div>

        {isAdmin && (
          <button
            onClick={() => handleEdit('heroImg', '배경 이미지 URL')}
            className="absolute top-10 right-10 bg-white text-slate-900 px-4 py-2 rounded-full text-xs font-bold shadow-2xl flex items-center gap-2 hover:bg-gray-100 z-50"
          >
            <span className="material-symbols-outlined text-sm">image</span> 이미지 변경
          </button>
        )}

        <div className="relative z-10 px-4 max-w-4xl flex flex-col items-center gap-6">
          <div className="group relative">
            <span className="inline-block px-4 py-1.5 bg-blue-600/90 rounded-full text-sm font-bold mb-4">{content.worshipBadge}</span>
            {isAdmin && (
              <button onClick={() => handleEdit('worshipBadge', '예배 시간 뱃지')} className="absolute -right-10 top-0 text-white/50 hover:text-white"><span className="material-symbols-outlined">edit</span></button>
            )}
          </div>

          <div className="group relative">
            <h1 className="font-myeongjo text-4xl md:text-6xl font-black leading-tight break-keep whitespace-pre-line">
              {content.heroTitle}
            </h1>
            {isAdmin && (
              <button onClick={() => handleEdit('heroTitle', '메인 타이틀')} className="absolute -right-10 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"><span className="material-symbols-outlined">edit</span></button>
            )}
          </div>

          <div className="group relative">
            <p className="text-lg md:text-xl text-white/90 font-medium whitespace-pre-line">
              {content.heroSub}
            </p>
            {isAdmin && (
              <button onClick={() => handleEdit('heroSub', '서브 설명')} className="absolute -right-10 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"><span className="material-symbols-outlined">edit</span></button>
            )}
          </div>

          <div className="flex flex-wrap gap-4 mt-6">
            <Link to="/online-worship" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded-xl font-bold transition-all shadow-xl shadow-blue-900/40">
              <span className="material-symbols-outlined">play_circle</span>
              실시간 예배 참여
            </Link>
            <Link to="/worship-info" className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 px-8 py-4 rounded-xl font-bold transition-all">
              교회 안내 보기
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Links Section - Strict 1px border applied */}
      <section className="max-w-7xl mx-auto w-full px-4 -mt-20 relative z-20 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1: Sermon */}
          <div className="bg-white rounded-[2rem] shadow-xl p-4 border border-white ring-1 ring-gray-100 flex flex-col gap-4 group hover:-translate-y-2 transition-transform duration-300">
            <div className="h-48 rounded-xl overflow-hidden relative bg-gray-100">
              <img
                src="https://raw.githubusercontent.com/1004aimbot-dev/images/main/1.png"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                alt="Sermon"
              />
              <div className="absolute top-4 left-4 bg-red-600 text-white px-2 py-1 rounded text-[10px] font-bold animate-pulse">LIVE</div>
            </div>
            <div className="px-3 pb-4">
              <h3 className="text-lg font-bold mb-1">최근 설교 영상</h3>
              <p className="text-slate-500 text-[13px] leading-relaxed mb-6">실시간 유튜브 스트리밍 예배를 제공합니다.</p>
              <Link to="/online-worship" className="flex items-center justify-center w-full py-2.5 bg-gray-50 text-blue-600 font-bold rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors text-xs">
                예배 시청하기
              </Link>
            </div>
          </div>

          {/* Card 2: Bible Meditation */}
          <div className="bg-white rounded-[2rem] shadow-xl p-4 border border-white ring-1 ring-gray-100 flex flex-col gap-4 group hover:-translate-y-2 transition-transform duration-300">
            <div className="h-48 rounded-xl overflow-hidden relative bg-gray-100">
              <img
                src="https://raw.githubusercontent.com/1004aimbot-dev/images/main/6.png"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                alt="Meditation"
              />
            </div>
            <div className="px-3 pb-4">
              <h3 className="text-lg font-bold mb-1">말씀 묵상</h3>
              <p className="text-slate-500 text-[13px] leading-relaxed mb-6">매일 아침 배달되는 생명의 말씀으로 시작하세요.</p>
              <Link to="/grace-sharing" className="flex items-center justify-center w-full py-2.5 bg-gray-50 text-blue-600 font-bold rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors text-xs">
                오늘의 말씀 보기
              </Link>
            </div>
          </div>

          {/* Card 3: Directions */}
          <div className="bg-white rounded-[2rem] shadow-xl p-4 border border-white ring-1 ring-gray-100 flex flex-col gap-4 group hover:-translate-y-2 transition-transform duration-300">
            <div className="h-48 rounded-xl overflow-hidden relative border border-gray-50 bg-gray-50">
              <iframe
                title="교회 위치 지도"
                width="100%"
                height="100%"
                frameBorder="0"
                style={{ border: 0 }}
                src={`https://maps.google.com/maps?q=${encodeURIComponent(churchAddress)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                allowFullScreen
                loading="lazy"
                className="grayscale-[0.2] contrast-[1.1]"
              ></iframe>
            </div>
            <div className="px-3 pb-4">
              <h3 className="text-lg font-bold mb-1">오시는 길</h3>
              <p className="text-slate-500 text-[13px] leading-relaxed mb-6">성남시 중원구 둔촌대로 148에 위치합니다.</p>
              <Link to="/directions" className="flex items-center justify-center w-full py-2.5 bg-gray-50 text-blue-600 font-bold rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors text-xs">
                길찾기 안내
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured AI Guide */}
      <section className="bg-slate-50 py-20 px-4 overflow-hidden relative">
        <div className="max-w-7xl mx-auto bg-white rounded-[3rem] p-8 md:p-16 border border-gray-100 shadow-xl flex flex-col md:flex-row items-center gap-12 relative">
          <div className="absolute top-10 right-10 opacity-5 pointer-events-none">
            <span className="material-symbols-outlined text-[160px] text-blue-600">auto_awesome</span>
          </div>
          <div className="flex-1 z-10 text-center md:text-left">
            <span className="inline-block px-4 py-1.5 bg-blue-100 text-blue-600 rounded-full text-xs font-bold mb-6">SPECIAL FEATURE</span>
            <h2 className="font-myeongjo text-3xl md:text-5xl font-black mb-8 leading-tight">
              신앙의 든든한 동반자<br />
              <span className="text-blue-600">AI 성경 길잡이</span>
            </h2>
            <p className="text-lg text-slate-600 mb-10 leading-relaxed font-medium">
              "신앙의 궁금증, 무엇이든 물어보세요."<br />
              성경의 깊은 지혜가 담긴 AI가<br />
              여러분의 발걸음을 따뜻하게 안내합니다.
            </p>
            <div className="flex flex-col md:flex-row items-center gap-4">
              <Link to="/ai-guide" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-5 px-10 rounded-2xl shadow-xl shadow-blue-200 transition-all flex items-center gap-2 w-full md:w-auto justify-center">
                <span className="material-symbols-outlined">chat_bubble</span>
                채팅 시작하기
              </Link>
            </div>
          </div>
          <div className="shrink-0 z-10">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-200 blur-3xl opacity-30 rounded-full"></div>
              {/* Image Frame Strict 1px border applied */}
              <div className="relative size-64 md:size-80 rounded-[3rem] overflow-hidden border border-white shadow-2xl bg-white">
                <img src="https://raw.githubusercontent.com/1004aimbot-dev/images/main/leehy.png" className="w-full h-full object-cover" alt="AI Bible Guide" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
