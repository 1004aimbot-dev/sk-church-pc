
import React, { useContext, useEffect, useState } from 'react';
import { AdminContext } from '../App';

interface PastorProfile {
  imageUrl: string;
  name: string;
  title: string;       // 한글 직함 (예: 담임목사)
  subtitle: string;    // 영문 직함 (예: Senior Pastor)
  welcomeQuote: string; // 사진 옆 인용구
  email: string;
  greetingTitle: string; // 본문 큰 제목
  greetingBody: string;  // 본문 내용 (줄바꿈 포함)
  bibleVerseBody: string; // 성경 구절 본문
  bibleRef: string;       // 성경 장절 (예: 이사야 40:31)
}

const DEFAULT_PROFILE: PastorProfile = {
  imageUrl: 'https://raw.githubusercontent.com/1004aimbot-dev/images/main/leehy.png',
  name: '이현용',
  title: '담임목사',
  subtitle: 'Senior Pastor',
  welcomeQuote: '"주님의 사랑으로 여러분을 환영합니다"',
  email: 'pastor@sn-shinkwang.org',
  greetingTitle: '환영합니다. 성남신광교회 홈페이지를 방문해주신 여러분을 축복합니다.',
  greetingBody: `성남신광교회는 하나님의 사랑 안에서 지역사회를 섬기고, 복음의 기쁨을 나누는 신앙 공동체입니다. 우리는 현대 사회의 고단한 삶 속에서 길을 잃은 영혼들이 참된 평안과 안식을 얻을 수 있도록 돕고자 합니다.

우리 교회는 오직 말씀 위에 서서, 성령의 인도하심을 따라 나아가고 있습니다. 하나님을 깊이 만나는 예배, 성도 간의 진실한 교제, 그리고 세상을 향한 따뜻한 나눔을 통해 그리스도의 향기를 전하는 교회가 되기를 소망합니다.

이곳을 방문하신 모든 분들이 주님의 한량없는 은혜를 경험하고, 새로운 소망과 비전을 품게 되시기를 기도합니다. 성남신광교회의 문은 누구에게나 활짝 열려 있습니다. 함께 믿음의 길을 걸어가며 하나님 나라의 영광을 누리기를 원합니다.`,
  bibleVerseBody: '"오직 여호와를 앙망하는 자는 새 힘을 얻으리니 독수리가 날개치며 올라감 같을 것이요"',
  bibleRef: '— 이사야 40:31'
};

const PastorMessage: React.FC = () => {
  const { isAdmin } = useContext(AdminContext);
  const [profile, setProfile] = useState<PastorProfile>(DEFAULT_PROFILE);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  // 서버에서 데이터 불러오기
  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/content');
      if (res.ok) {
        const data = await res.json();
        if (data.pastor_profile) {
          const parsed = JSON.parse(data.pastor_profile);
          setProfile(prev => ({ ...prev, ...parsed }));
        }
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 초기 로드
  useEffect(() => {
    fetchProfile();
  }, []);

  // 관리자 모드가 꺼지면 편집 모드도 종료
  useEffect(() => {
    if (!isAdmin) setIsEditing(false);
  }, [isAdmin]);

  const handleCreate = async () => {
    try {
      // 서버에 저장
      const res = await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: 'pastor_profile',
          value: JSON.stringify(profile)
        })
      });

      if (res.ok) {
        alert('인사말이 서버에 저장되었습니다. 모든 사용자에게 반영됩니다.');
        setIsEditing(false);
        fetchProfile();
      } else {
        const errText = await res.text();
        throw new Error(`저장 실패: ${res.status} ${errText}`);
      }
    } catch (error: any) {
      console.error('Save failed:', error);
      alert(`저장에 실패했습니다.\n오류 내용: ${error.message}`);
    }
  };

  const handleReset = () => {
    if (window.confirm('정말로 초기 값으로 되돌리시겠습니까? 저장하지 않으면 반영되지 않습니다.')) {
      setProfile(DEFAULT_PROFILE);
    }
  }

  // 입력 핸들러
  const handleChange = (field: keyof PastorProfile, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 space-y-12 relative">
      {/* Admin Controls */}
      {isAdmin && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 animate-in slide-in-from-bottom-4">
          {isEditing ? (
            <>
              <button
                onClick={handleCreate}
                className="bg-blue-600 text-white font-bold py-3 px-6 rounded-full shadow-xl hover:bg-blue-700 transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined">save</span>
                저장하기
              </button>
              <button
                onClick={handleReset}
                className="bg-red-100 text-red-600 font-bold py-3 px-6 rounded-full shadow-lg hover:bg-red-200 transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined">restart_alt</span>
                초기화
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="bg-slate-800 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:bg-slate-900 transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined">close</span>
                취소
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-slate-900 text-white font-black py-4 px-6 rounded-full shadow-2xl hover:bg-slate-800 transition-all flex items-center gap-2 ring-4 ring-slate-100"
            >
              <span className="material-symbols-outlined">edit_note</span>
              인사말 수정
            </button>
          )}
        </div>
      )}

      <nav className="flex items-center gap-2 text-sm">
        <span className="text-blue-600 font-medium">홈</span>
        <span className="material-symbols-outlined text-sm text-slate-300">chevron_right</span>
        <span className="text-blue-600 font-medium">교회소개</span>
        <span className="material-symbols-outlined text-sm text-slate-300">chevron_right</span>
        <span className="text-slate-900 font-bold">담임목사 인사말</span>
      </nav>

      <section className="bg-white rounded-[2rem] p-8 md:p-12 shadow-xl border border-gray-100 flex flex-col md:flex-row items-center md:items-start gap-12 relative overflow-hidden">
        {isEditing && <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 animate-pulse"></div>}

        <div className="shrink-0 flex flex-col gap-3">
          <div className="size-64 md:size-80 rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-gray-100 relative group">
            <img src={profile.imageUrl} className="w-full h-full object-cover" alt={profile.name} />
            {isEditing && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-white font-bold text-xs">이미지 URL 수정은 아래 입력창 이용</span>
              </div>
            )}
          </div>
          {isEditing && (
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 pl-1">이미지 URL</label>
              <input
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 outline-none focus:border-blue-500"
                value={profile.imageUrl}
                onChange={e => handleChange('imageUrl', e.target.value)}
                placeholder="https://..."
              />
            </div>
          )}
        </div>

        <div className="flex-1 flex flex-col justify-center gap-4 py-4 text-center md:text-left w-full">
          <div className="space-y-1">
            {isEditing ? (
              <input
                className="text-blue-600 font-bold text-sm tracking-widest uppercase bg-blue-50/50 border-b border-blue-200 outline-none w-full text-center md:text-left"
                value={profile.subtitle}
                onChange={e => handleChange('subtitle', e.target.value)}
              />
            ) : (
              <span className="text-blue-600 font-bold text-sm tracking-widest uppercase">{profile.subtitle}</span>
            )}
          </div>

          <div className="flex flex-col md:flex-row items-center gap-2">
            {isEditing ? (
              <div className="flex gap-2 w-full justify-center md:justify-start">
                <input
                  className="text-4xl md:text-5xl font-black bg-slate-50 border-b border-slate-200 outline-none w-40 text-center md:text-left"
                  value={profile.name}
                  onChange={e => handleChange('name', e.target.value)}
                />
                <input
                  className="text-4xl md:text-5xl font-black bg-slate-50 border-b border-slate-200 outline-none w-48 text-center md:text-left"
                  value={profile.title}
                  onChange={e => handleChange('title', e.target.value)}
                />
              </div>
            ) : (
              <h1 className="text-4xl md:text-5xl font-black">{profile.name} {profile.title}</h1>
            )}
          </div>

          <div className="w-full">
            {isEditing ? (
              <input
                className="text-slate-500 text-xl font-medium italic bg-slate-50 border-b border-slate-200 outline-none w-full text-center md:text-left p-1"
                value={profile.welcomeQuote}
                onChange={e => handleChange('welcomeQuote', e.target.value)}
              />
            ) : (
              <p className="text-slate-500 text-xl font-medium italic">{profile.welcomeQuote}</p>
            )}
          </div>

          <div className="flex items-center justify-center md:justify-start gap-2 text-slate-400 text-sm mt-4">
            <span className="material-symbols-outlined text-blue-600">mail</span>
            {isEditing ? (
              <input
                className="bg-slate-50 border-b border-slate-200 outline-none text-slate-600 font-bold w-64"
                value={profile.email}
                onChange={e => handleChange('email', e.target.value)}
              />
            ) : (
              profile.email
            )}
          </div>
        </div>
      </section>

      <article className="space-y-10">
        <div className="border-l-8 border-blue-600 pl-8">
          {isEditing ? (
            <textarea
              className="font-myeongjo text-3xl font-black leading-snug w-full h-32 bg-slate-50 p-4 border rounded-xl outline-none focus:ring-2 focus:ring-blue-100 resize-none"
              value={profile.greetingTitle}
              onChange={e => handleChange('greetingTitle', e.target.value)}
            />
          ) : (
            <h2 className="font-myeongjo text-3xl font-black leading-snug">
              {profile.greetingTitle}
            </h2>
          )}
        </div>

        <div className="text-lg text-slate-600 leading-relaxed font-medium">
          {isEditing ? (
            <textarea
              className="w-full h-96 bg-slate-50 p-6 border rounded-xl outline-none focus:ring-2 focus:ring-blue-100 text-lg leading-relaxed resize-none"
              value={profile.greetingBody}
              onChange={e => handleChange('greetingBody', e.target.value)}
            />
          ) : (
            profile.greetingBody.split('\n\n').map((paragraph, idx) => (
              <p key={idx} className="mb-6 last:mb-0">{paragraph}</p>
            ))
          )}
        </div>

        <div className="bg-blue-50/50 p-12 rounded-[2rem] border-l-8 border-blue-600 text-center space-y-4 shadow-sm">
          {isEditing ? (
            <>
              <textarea
                className="font-myeongjo text-2xl font-black text-blue-900 leading-relaxed bg-white/50 w-full h-24 text-center border-none outline-none resize-none"
                value={profile.bibleVerseBody}
                onChange={e => handleChange('bibleVerseBody', e.target.value)}
              />
              <input
                className="text-blue-600 font-bold bg-white/50 text-center w-full border-none outline-none"
                value={profile.bibleRef}
                onChange={e => handleChange('bibleRef', e.target.value)}
              />
            </>
          ) : (
            <>
              <p className="font-myeongjo text-2xl font-black text-blue-900 leading-relaxed">
                {profile.bibleVerseBody}
              </p>
              <p className="text-blue-600 font-bold">{profile.bibleRef}</p>
            </>
          )}
        </div>

        <div className="text-right pt-10 border-t border-gray-100">
          <p className="text-slate-400 mb-2">성령의 인도하심을 따라,</p>
          <p className="text-2xl font-bold">성남신광교회 {profile.title} <span className="text-blue-600 text-4xl ml-2">{profile.name}</span> 올림</p>
        </div>
      </article>

      <section className="pt-20 space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-blue-600 text-3xl">play_circle</span>
            <h3 className="text-2xl font-bold">최근 설교 영상</h3>
          </div>
          <button className="text-blue-600 text-sm font-bold flex items-center gap-1">설교 게시판 바로가기 <span className="material-symbols-outlined text-[16px]">arrow_forward</span></button>
        </div>
        <div className="bg-white rounded-[2rem] overflow-hidden shadow-xl border border-gray-100 group flex flex-col md:flex-row">
          <div className="md:w-1/2 aspect-video relative">
            <img src="https://raw.githubusercontent.com/1004aimbot-dev/images/main/1.png" className="w-full h-full object-cover group-hover:scale-105 transition-transform" alt="Recent Sermon Video" />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <div className="size-16 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-xl">
                <span className="material-symbols-outlined text-4xl fill-1">play_arrow</span>
              </div>
            </div>
          </div>
          <div className="p-8 md:p-12 flex flex-col justify-center gap-4 flex-1">
            <span className="bg-blue-50 text-blue-600 text-xs font-bold px-3 py-1 rounded-full w-fit">주일예배</span>
            <h4 className="text-2xl font-bold leading-tight">참된 소망을 붙드는 신앙의 자세</h4>
            <p className="text-slate-500 text-sm leading-relaxed line-clamp-2">지치고 곤비한 삶의 현장 속에서도 우리를 결코 포기하지 않으시는 하나님의 사랑을 묵상하며...</p>
            <button className="bg-blue-600 text-white font-bold py-3 px-8 rounded-xl w-fit shadow-xl shadow-blue-100 hover:scale-105 transition-all">영상 보기</button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PastorMessage;
