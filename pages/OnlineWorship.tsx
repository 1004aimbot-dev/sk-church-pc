
import React, { useState, useEffect, useContext, useRef } from 'react';
import { AdminContext } from '../App';
import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Sermon {
  id: number;
  title: string;
  pastor: string;
  passage: string;
  series: string;
  date: string;
  youtubeUrl: string;
  startTime: number;
  endTime: number;
  duration: string;
  thumbnail: string;
}

interface OfferingAccount {
  id: number;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
}

const OnlineWorship: React.FC = () => {
  const { isAdmin } = useContext(AdminContext);
  const [isOfferingModalOpen, setIsOfferingModalOpen] = useState(false);
  const [isOfferingAdminModalOpen, setIsOfferingAdminModalOpen] = useState(false);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [isSermonModalOpen, setIsSermonModalOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiSummary, setAiSummary] = useState('');
  const [toast, setToast] = useState<{ show: boolean, message: string }>({ show: false, message: '' });
  const [showAll, setShowAll] = useState(false);

  // 헌금 계좌 데이터 상태 관리
  const [offeringAccounts, setOfferingAccounts] = useState<OfferingAccount[]>(() => {
    const saved = localStorage.getItem('sgch_offering_accounts_v2');
    return saved ? JSON.parse(saved) : [
      { id: 1, bankName: '농협은행', accountNumber: '351-0191-2603-13', accountHolder: '성남신광교회' }
    ];
  });

  const [accountFormData, setAccountFormData] = useState<OfferingAccount>({
    id: 0, bankName: '', accountNumber: '', accountHolder: '성남신광교회'
  });

  // 설교 데이터 상태 관리
  const [sermons, setSermons] = useState<Sermon[]>(() => {
    const saved = localStorage.getItem('sgch_sermons');
    return saved ? JSON.parse(saved) : [
      { id: 1, title: "오직 믿음으로 사는 삶", pastor: "이현용 담임목사", passage: "요한복음 3:16", series: "믿음의 능력 시리즈", date: "2026.01.04", youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", startTime: 0, endTime: 300, duration: "05:00", thumbnail: "https://images.unsplash.com/photo-1490730141103-6cac27aaab94?auto=format&fit=crop&q=80&w=1200" }
    ];
  });

  const [activeSermon, setActiveSermon] = useState<Sermon>(sermons[0]);
  const [editingSermon, setEditingSermon] = useState<Sermon | null>(null);
  const [formData, setFormData] = useState({
    title: '', pastor: '이현용 담임목사', passage: '', series: '', date: '', youtubeUrl: '', startTime: '0:00', endTime: '0:00', duration: '', thumbnail: ''
  });

  useEffect(() => {
    localStorage.setItem('sgch_sermons', JSON.stringify(sermons));
  }, [sermons]);

  useEffect(() => {
    localStorage.setItem('sgch_offering_accounts_v2', JSON.stringify(offeringAccounts));
  }, [offeringAccounts]);

  const secondsToTimeString = (totalSeconds: number): string => {
    if (isNaN(totalSeconds) || totalSeconds <= 0) return '0:00';
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}` : `${m}:${String(s).padStart(2, '0')}`;
  };

  const timeStringToSeconds = (timeStr: string): number => {
    if (!timeStr || typeof timeStr !== 'string') return 0;
    const parts = timeStr.split(':').map(val => parseInt(val, 10) || 0);
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    return parts[0] || 0;
  };

  const showToast = (message: string) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: '' }), 3000);
  };

  const extractVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const getEmbedUrl = (sermon: Sermon) => {
    const videoId = extractVideoId(sermon.youtubeUrl);
    if (!videoId) return null;
    let url = `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0&modestbranding=1`;
    if (sermon.startTime > 0) url += `&start=${sermon.startTime}`;
    if (sermon.endTime > 0) url += `&end=${sermon.endTime}`;
    return url;
  };

  const openOfferingAdmin = (account?: OfferingAccount) => {
    if (account) {
      setAccountFormData(account);
    } else {
      setAccountFormData({ id: 0, bankName: '', accountNumber: '', accountHolder: '성남신광교회' });
    }
    setIsOfferingAdminModalOpen(true);
  };

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (accountFormData.id === 0) {
      const newAccount = { ...accountFormData, id: Date.now() };
      setOfferingAccounts([...offeringAccounts, newAccount]);
      showToast('새 계좌 정보가 추가되었습니다.');
    } else {
      setOfferingAccounts(offeringAccounts.map(a => a.id === accountFormData.id ? accountFormData : a));
      showToast('계좌 정보가 수정되었습니다.');
    }
    setAccountFormData({ id: 0, bankName: '', accountNumber: '', accountHolder: '성남신광교회' });
  };

  const handleDeleteAccount = (id: number) => {
    if (window.confirm('이 계좌 정보를 삭제하시겠습니까?')) {
      setOfferingAccounts(offeringAccounts.filter(a => a.id !== id));
      showToast('계좌가 삭제되었습니다.');
    }
  };

  const handleAISummary = async () => {
    setIsAnalyzing(true);
    setIsSummaryModalOpen(true);
    setAiSummary('');
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `다음 설교 정보를 바탕으로 성도들을 위한 깊이 있는 '설교 요약본'을 작성해 주세요. 제목: ${activeSermon.title}, 설교자: ${activeSermon.pastor}, 본문: ${activeSermon.passage}`;
      const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
      setAiSummary(response.text || '요약본 생성 중 오류가 발생했습니다.');
    } catch (error) {
      setAiSummary('AI 분석 엔진 연결에 실패했습니다.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const openSermonModal = (sermon?: Sermon) => {
    if (sermon) {
      setEditingSermon(sermon);
      setFormData({ ...sermon, startTime: secondsToTimeString(sermon.startTime), endTime: secondsToTimeString(sermon.endTime) });
    } else {
      setEditingSermon(null);
      setFormData({ title: '', pastor: '이현용 담임목사', passage: '', series: '', date: new Date().toISOString().split('T')[0].replace(/-/g, '.'), youtubeUrl: '', startTime: '0:00', endTime: '0:00', duration: '0:00', thumbnail: 'https://images.unsplash.com/photo-1490730141103-6cac27aaab94?auto=format&fit=crop&q=80&w=1200' });
    }
    setIsSermonModalOpen(true);
  };

  const handleSaveSermon = (e: React.FormEvent) => {
    e.preventDefault();
    const startSec = timeStringToSeconds(formData.startTime);
    const endSec = timeStringToSeconds(formData.endTime);
    const sermonToSave: Sermon = { ...(editingSermon || { id: Date.now() }), ...formData, startTime: startSec, endTime: endSec };
    if (editingSermon) {
      setSermons(sermons.map(s => s.id === editingSermon.id ? sermonToSave : s));
      if (activeSermon.id === editingSermon.id) setActiveSermon(sermonToSave);
    } else {
      setSermons([sermonToSave, ...sermons]);
    }
    setIsSermonModalOpen(false);
    showToast('저장되었습니다.');
  };

  // Fix: Added missing handleDeleteSermon function
  const handleDeleteSermon = (id: number) => {
    if (window.confirm('이 설교 영상을 삭제하시겠습니까?')) {
      const filtered = sermons.filter(s => s.id !== id);
      setSermons(filtered);
      if (activeSermon.id === id && filtered.length > 0) {
        setActiveSermon(filtered[0]);
      }
      showToast('설교가 삭제되었습니다.');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => showToast('복사되었습니다!'));
  };

  const displayedSermons = showAll ? sermons : sermons.slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 space-y-12 relative">
      {toast.show && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[150] bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
          <span className="material-symbols-outlined text-blue-400">info</span>
          {toast.message}
        </div>
      )}

      {/* Main Player */}
      <div className="bg-black rounded-[2.5rem] overflow-hidden shadow-2xl aspect-video relative group border border-white/10">
        {getEmbedUrl(activeSermon) ? (
          <iframe src={getEmbedUrl(activeSermon)!} className="w-full h-full" allowFullScreen></iframe>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white/50 bg-slate-900">
            <span className="material-symbols-outlined text-6xl mb-4">video_library</span>
            <p className="font-bold">영상이 없습니다.</p>
          </div>
        )}
      </div>

      <div className="flex flex-col lg:flex-row justify-between gap-8 pb-10 border-b border-gray-100">
        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-2 text-[14px] font-black">
             <span className="text-blue-600">주일 대예배</span>
             <span className="text-slate-200">|</span>
             <span className="text-slate-500">{activeSermon.date}</span>
          </div>
          <h1 className="font-myeongjo text-3xl md:text-4xl font-black text-slate-900 leading-tight">{activeSermon.title}</h1>
          <p className="text-slate-400 text-[15px] font-medium">{activeSermon.pastor} • {activeSermon.series || '특별 설교'} • {activeSermon.passage}</p>
        </div>

        <div className="flex flex-wrap gap-3 items-start shrink-0">
           <button onClick={handleAISummary} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3.5 rounded-2xl font-black flex items-center gap-2 shadow-xl shadow-blue-100 active:scale-95 text-sm">
             <span className="material-symbols-outlined text-xl">auto_awesome</span> 설교 요약본
           </button>
           
           <div className="flex items-center gap-1">
             <button onClick={() => setIsOfferingModalOpen(true)} className="bg-white border border-gray-200 px-6 py-3.5 rounded-2xl font-black flex items-center gap-2 hover:bg-gray-50 transition-all text-slate-700 shadow-sm active:scale-95 text-sm">
               <span className="material-symbols-outlined text-xl">volunteer_activism</span> 온라인 헌금
             </button>
             {isAdmin && (
               <button onClick={() => openOfferingAdmin()} className="size-[52px] bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 hover:bg-blue-600 hover:text-white transition-all active:scale-95 border border-blue-100 shadow-lg shadow-blue-50" title="계좌 관리">
                 <span className="material-symbols-outlined">settings_suggest</span>
               </button>
             )}
           </div>
        </div>
      </div>

      {/* Offering Modal (성도용 + 관리자 이동 버튼) */}
      {isOfferingModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 border border-gray-50 text-center animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
               <div className="w-10"></div>
               <h3 className="text-xl font-black flex items-center justify-center gap-2">
                 <span className="material-symbols-outlined text-blue-600">account_balance</span> 온라인 헌금 안내
               </h3>
               <button onClick={() => setIsOfferingModalOpen(false)} className="size-10 flex items-center justify-center text-slate-300 hover:text-slate-600 transition-colors">
                 <span className="material-symbols-outlined">close</span>
               </button>
            </div>
            
            <div className="space-y-4 mb-8">
              {offeringAccounts.map(acc => (
                <div key={acc.id} className="bg-gray-50 p-6 rounded-3xl border border-gray-100 text-left group relative hover:border-blue-100 transition-colors">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{acc.bankName}</p>
                  <p className="text-lg font-black tracking-tight cursor-pointer hover:text-blue-600 transition-colors" onClick={() => copyToClipboard(acc.accountNumber)}>{acc.accountNumber}</p>
                  <p className="text-[11px] text-slate-400 font-bold mt-2">예금주: {acc.accountHolder}</p>
                  <button onClick={() => copyToClipboard(acc.accountNumber)} className="absolute top-6 right-6 text-slate-300 hover:text-blue-600 transition-colors">
                    <span className="material-symbols-outlined text-xl">content_copy</span>
                  </button>
                </div>
              ))}
            </div>
            
            <div className="space-y-3">
              <p className="text-[11px] text-slate-400 font-bold">주님께 드리는 소중한 예물, <br/>정성을 다해 섬기겠습니다.</p>
              
              {isAdmin && (
                <button 
                  onClick={() => { setIsOfferingModalOpen(false); openOfferingAdmin(); }} 
                  className="w-full mt-4 bg-blue-50 text-blue-600 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-blue-100 transition-all border border-blue-100"
                >
                  <span className="material-symbols-outlined text-lg">edit_square</span> 계좌 정보 관리하기
                </button>
              )}
              
              <button onClick={() => setIsOfferingModalOpen(false)} className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl shadow-xl hover:bg-slate-800 transition-all mt-2">닫기</button>
            </div>
          </div>
        </div>
      )}

      {/* Offering Admin Modal (추가/수정/삭제 실제 작동부) */}
      {isOfferingAdminModalOpen && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl p-8 my-8 border border-gray-100 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600">account_balance_wallet</span>
                계좌 정보 통합 관리
              </h3>
              <button onClick={() => setIsOfferingAdminModalOpen(false)} className="size-10 flex items-center justify-center text-slate-300 hover:text-slate-600">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="space-y-6">
              {/* 계좌 리스트 */}
              <div className="space-y-3">
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">현재 등록된 계좌</p>
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {offeringAccounts.map(acc => (
                    <div key={acc.id} className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl border border-gray-100 group">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{acc.bankName}</span>
                          <span className="text-sm font-bold text-slate-800">{acc.accountHolder}</span>
                        </div>
                        <p className="text-sm font-medium text-slate-500 mt-1">{acc.accountNumber}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => setAccountFormData(acc)} className="size-10 bg-white border border-gray-100 text-blue-600 rounded-xl flex items-center justify-center hover:bg-blue-50 transition-all shadow-sm">
                          <span className="material-symbols-outlined text-lg">edit</span>
                        </button>
                        <button onClick={() => handleDeleteAccount(acc.id)} className="size-10 bg-white border border-gray-100 text-red-500 rounded-xl flex items-center justify-center hover:bg-red-50 transition-all shadow-sm">
                          <span className="material-symbols-outlined text-lg">delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <hr className="border-gray-50" />

              {/* 입력 폼 */}
              <form onSubmit={handleSaveAccount} className="space-y-4">
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  {accountFormData.id === 0 ? '새 계좌 추가' : '정보 수정'}
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <input className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-100 rounded-xl p-3.5 text-sm font-bold outline-none" placeholder="은행명" value={accountFormData.bankName} onChange={e => setAccountFormData({...accountFormData, bankName: e.target.value})} required />
                  <input className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-100 rounded-xl p-3.5 text-sm font-bold outline-none" placeholder="예금주" value={accountFormData.accountHolder} onChange={e => setAccountFormData({...accountFormData, accountHolder: e.target.value})} required />
                </div>
                <input className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-100 rounded-xl p-3.5 text-sm font-bold outline-none" placeholder="계좌번호 (- 포함)" value={accountFormData.accountNumber} onChange={e => setAccountFormData({...accountFormData, accountNumber: e.target.value})} required />
                
                <div className="flex gap-2 pt-2">
                  {accountFormData.id !== 0 && (
                    <button type="button" onClick={() => setAccountFormData({ id: 0, bankName: '', accountNumber: '', accountHolder: '성남신광교회' })} className="flex-1 py-4 text-slate-400 font-bold hover:bg-gray-50 rounded-2xl">취소</button>
                  )}
                  <button type="submit" className="flex-[2] bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-xl shadow-blue-50 hover:bg-blue-700 transition-all">
                    {accountFormData.id === 0 ? '계좌 등록하기' : '수정 내용 저장'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 설교 요약/추가 등 기존 기능 유지 */}
      <section>
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600">history</span> 지난 예배 다시보기
          </h2>
          <div className="flex items-center gap-4">
            {isAdmin && (
              <button onClick={() => openSermonModal()} className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-blue-600 transition-colors">
                <span className="material-symbols-outlined text-[16px]">add_circle</span> 설교 등록
              </button>
            )}
            <button onClick={() => setShowAll(!showAll)} className="text-blue-600 text-sm font-bold flex items-center gap-1 group">
              {showAll ? '접기' : '전체 보기'} 
              <span className={`material-symbols-outlined text-[18px] transition-transform ${showAll ? 'rotate-90' : 'group-hover:translate-x-1'}`}>chevron_right</span>
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {displayedSermons.map((item) => (
             <div key={item.id} className="group cursor-pointer">
               <div className="aspect-video rounded-2xl overflow-hidden relative mb-4 shadow-sm border border-gray-100 bg-slate-100" onClick={() => { setActiveSermon(item); window.scrollTo({top: 0, behavior: 'smooth'}); }}>
                  <img src={item.thumbnail} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={item.title} />
                  <div className="absolute bottom-3 right-3 bg-black/80 text-white text-[10px] font-black px-2 py-0.5 rounded-md">{item.duration}</div>
               </div>
               <div className="flex justify-between items-start gap-2">
                 <div className="flex-1" onClick={() => { setActiveSermon(item); window.scrollTo({top: 0, behavior: 'smooth'}); }}>
                   <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1 text-[17px]">{item.title}</h3>
                   <p className="text-[11px] text-slate-400 mt-2 font-bold uppercase">{item.date} | {item.pastor}</p>
                 </div>
                 {isAdmin && (
                   <div className="flex gap-1 shrink-0">
                     <button onClick={() => openSermonModal(item)} className="p-1.5 text-slate-300 hover:text-blue-600"><span className="material-symbols-outlined text-[18px]">edit</span></button>
                     <button onClick={() => handleDeleteSermon(item.id)} className="p-1.5 text-slate-300 hover:text-red-500"><span className="material-symbols-outlined text-[18px]">delete</span></button>
                   </div>
                 )}
               </div>
             </div>
          ))}
        </div>
      </section>

      {/* Sermon Modal */}
      {isSermonModalOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl p-8 border border-gray-100 my-8">
            <h3 className="text-xl font-black mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-600">movie</span> 설교 정보 설정
            </h3>
            <form onSubmit={handleSaveSermon} className="space-y-4">
              <input className="w-full bg-gray-50 border-none rounded-xl p-3.5 text-sm font-bold outline-none" placeholder="설교 제목" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
              <div className="grid grid-cols-2 gap-3">
                <input className="w-full bg-gray-50 border-none rounded-xl p-3.5 text-sm font-bold outline-none" placeholder="설교자" value={formData.pastor} onChange={e => setFormData({...formData, pastor: e.target.value})} />
                <input className="w-full bg-gray-50 border-none rounded-xl p-3.5 text-sm font-bold outline-none" placeholder="날짜 (예: 2026.01.04)" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
              </div>
              <input className="w-full bg-gray-50 border-none rounded-xl p-3.5 text-sm font-bold outline-none" placeholder="본문 말씀 (예: 요한복음 3:16)" value={formData.passage} onChange={e => setFormData({...formData, passage: e.target.value})} />
              <input className="w-full bg-gray-50 border-none rounded-xl p-3.5 text-sm font-bold outline-none" placeholder="유튜브 URL" value={formData.youtubeUrl} onChange={e => setFormData({...formData, youtubeUrl: e.target.value})} required />
              <div className="flex gap-2 pt-4">
                <button type="button" onClick={() => setIsSermonModalOpen(false)} className="flex-1 py-4 text-slate-400 font-bold hover:bg-gray-50 rounded-2xl transition-all">취소</button>
                <button type="submit" className="flex-1 bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-xl shadow-blue-50 hover:bg-blue-700 transition-all">저장 완료</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Summary Modal */}
      {isSummaryModalOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl p-10 border border-gray-100 my-8 animate-in zoom-in-95">
             <div className="flex justify-between items-center mb-8">
               <div className="flex items-center gap-3">
                 <div className="size-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                   <span className="material-symbols-outlined text-2xl">auto_awesome</span>
                 </div>
                 <h3 className="text-xl font-black">AI 설교 요약</h3>
               </div>
               <button onClick={() => setIsSummaryModalOpen(false)} className="text-slate-300 hover:text-slate-600 transition-colors">
                 <span className="material-symbols-outlined text-3xl">close</span>
               </button>
             </div>
             
             {isAnalyzing ? (
               <div className="py-20 flex flex-col items-center justify-center gap-6">
                 <div className="flex gap-2">
                   <div className="size-3 bg-blue-600 rounded-full animate-bounce"></div>
                   <div className="size-3 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                   <div className="size-3 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.5s]"></div>
                 </div>
                 <p className="font-bold text-blue-600 animate-pulse">설교 영상을 분석하여 핵심 내용을 정리하고 있습니다...</p>
               </div>
             ) : (
               <div className="markdown-content text-slate-700 leading-relaxed max-h-[500px] overflow-y-auto pr-4 custom-scrollbar">
                 <ReactMarkdown remarkPlugins={[remarkGfm]}>{aiSummary}</ReactMarkdown>
               </div>
             )}
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default OnlineWorship;
