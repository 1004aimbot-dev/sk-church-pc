
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
  role: 'model' | 'user';
  text: string;
  date?: string;
  isError?: boolean;
  isKeyError?: boolean;
}

const AIGuide: React.FC = () => {
  // 사용자 정보 상태 (로컬 스토리지에서 불러오기)
  const [userInfo, setUserInfo] = useState({
    name: localStorage.getItem('sgch_user_name') || '',
    title: localStorage.getItem('sgch_user_title') || '성도'
  });

  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      text: '안녕하세요! 성남신광교회 성도님, 주님의 평안이 함께하시길 빕니다. 저는 여러분의 신앙 여정을 돕는 **AI 성경 길잡이**입니다.\n\n오늘은 어떤 고민이나 기도가 있으신가요? 말씀 묵상이나 신앙에 대한 궁금증이 있다면 무엇이든 물어보세요.',
      date: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sharingIndex, setSharingIndex] = useState<number | null>(null);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  // 이름 변경 핸들러 (입력 즉시 저장)
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setUserInfo(prev => ({ ...prev, name: newName }));
    localStorage.setItem('sgch_user_name', newName);
  };

  // 직분 변경 핸들러 (변경 즉시 저장)
  const handleTitleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newTitle = e.target.value;
    setUserInfo(prev => ({ ...prev, title: newTitle }));
    localStorage.setItem('sgch_user_title', newTitle);
  };

  const handleChipClick = (text: string) => {
    // 칩 클릭 시 입력창에 잠시 보여줬다가 전송 후 비우기 위해,
    // 여기서는 setInput을 하지 않고 handleSend에만 전달하거나,
    // UX상 칩 클릭 -> 바로 전송 -> 입력창은 비우기가 자연스러움.
    setInput(''); // 칩 클릭 시 입력창 비우기 (어차피 말풍선으로 올라감)
    handleSend(text);
  };

  // ... (중략) ...

  const handleSend = async (overrideInput?: string) => {
    const userText = overrideInput || input;
    if (!userText.trim() || isLoading) return;

    // 전송 즉시 입력창 비우기
    setInput('');

    setMessages(prev => [...prev, {
      role: 'user',
      text: userText,
      date: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
    }]);
    setIsLoading(true);

    // ... (이후 로직 동일)
  };

  // (... 렌더링 부분 ...)

  <input
    className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-4 px-4 outline-none"
    placeholder="궁금한 사항을 입력하세요..."
    value={input}

    // 날짜별로 추천 질문을 다르게 생성하는 로직 (사용자 요청으로 고정 버튼으로 변경)
    const getDailyChips= () => {
      return [
        { label: '오늘의 말씀', query: '성도님에게 오늘 꼭 필요한 위로와 소망의 성경 구절 하나를 들려주세요.' },
        { label: '오늘의 기도', query: '오늘 하루를 시작하며 하나님께 드릴 수 있는 짧고 은혜로운 기도문을 작성해 주세요.' },
        { label: '오늘의 실천', query: '오늘 하루 크리스천으로서 실천하면 좋을 작은 선행이나 믿음의 행동 한 가지를 추천해 주세요.' }
      ];
    };

  const dailyChips = getDailyChips();

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-80px-140px)] flex flex-col px-4 py-8 relative">
      {/* Copy Feedback Toast */}
      {copyFeedback && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] bg-slate-800 text-white px-8 py-3 rounded-full text-sm font-bold shadow-2xl animate-in fade-in slide-in-from-top-4">
          {copyFeedback}
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-t-[2.5rem] p-6 border-b border-gray-50 flex flex-col sm:flex-row items-center justify-between shadow-sm relative z-30 gap-4">
        <div className="flex items-center gap-4">
          <div className="size-14 rounded-full border border-blue-50 overflow-hidden bg-blue-50">
            <img src="https://raw.githubusercontent.com/1004aimbot-dev/images/main/leehy.png" alt="AI Bible Guide" />
          </div>
          <div>
            <h2 className="font-myeongjo text-xl font-black text-slate-900">AI 성경 길잡이</h2>
            <p className="text-xs text-slate-400 font-medium tracking-tight">하나님의 말씀을 나눕니다</p>
          </div>
        </div>

        {/* User Info Inputs */}
        <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-2xl border border-gray-100 shadow-inner">
          <input
            type="text"
            value={userInfo.name}
            onChange={handleNameChange}
            placeholder="성함 입력"
            className="w-24 bg-white border-none rounded-xl text-xs font-bold px-3 py-2.5 focus:ring-1 focus:ring-blue-100 outline-none placeholder:text-slate-300 shadow-sm"
          />
          <div className="h-4 w-px bg-gray-200"></div>
          <select
            value={userInfo.title}
            onChange={handleTitleChange}
            className="bg-transparent border-none text-xs font-bold text-blue-600 px-2 py-2 cursor-pointer focus:ring-0 outline-none"
          >
            {['성도', '집사', '안수집사', '권사', '장로', '은퇴장로', '목사', '전도사', '청년'].map(title => (
              <option key={title} value={title}>{title}</option>
            ))}
          </select>
          <span className="material-symbols-outlined text-blue-200 text-lg pr-1">person_check</span>
        </div>
      </div>

      {/* Chat Area */}
      <div ref={scrollRef} className="flex-1 bg-gray-50/50 p-6 overflow-y-auto space-y-6 scrollbar-hide relative z-10">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            {msg.role === 'model' && (
              <div className="size-10 rounded-full bg-white border border-gray-100 flex-shrink-0 overflow-hidden shadow-sm">
                <img src="https://raw.githubusercontent.com/1004aimbot-dev/images/main/leehy.png" alt="AI Bible Guide" />
              </div>
            )}
            <div className={`max-w-[85%] space-y-1 ${msg.role === 'user' ? 'items-end' : ''}`}>
              <div className={`flex items-center gap-2 px-1 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <span className="text-[10px] font-bold text-slate-500">
                  {msg.role === 'model' ? 'AI 성경 길잡이' : (userInfo.name ? `${userInfo.name} ${userInfo.title}` : '성도님')}
                </span>
                <span className="text-[10px] text-slate-300">{msg.date}</span>
              </div>
              <div className="relative group">
                <div className={`p-5 text-sm shadow-sm ${msg.role === 'model'
                  ? 'bg-white rounded-3xl rounded-tl-none border border-gray-100 text-slate-800'
                  : 'bg-blue-600 rounded-3xl rounded-tr-none text-white font-medium'
                  }`}>
                  <div className={`markdown-content ${msg.role === 'user' ? 'text-white' : ''}`}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.text}
                    </ReactMarkdown>
                    {/* Debug Info Display */}
                    {msg.isError && msg.text.includes('Visible Env Keys') && (
                      <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-xl">
                        <p className="text-xs font-bold text-red-600 mb-1">🔍 디버깅 정보 (관리자 전달용)</p>
                        <pre className="text-[10px] text-red-500 whitespace-pre-wrap font-mono leading-tight bg-red-100/50 p-2 rounded">
                          {msg.text.split('Visible Env Keys:')[1] ? 'Key 목록: ' + msg.text.split('Visible Env Keys:')[1] : '상세 정보 없음'}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
                {msg.role === 'model' && (
                  <div className="flex justify-end gap-3 mt-1.5 px-2">
                    <button
                      onClick={() => copyToClipboard(msg.text)}
                      className="p-1 text-slate-300 hover:text-blue-600 transition-colors flex items-center gap-1 text-[10px] font-bold"
                      title="텍스트 복사"
                    >
                      <span className="material-symbols-outlined text-sm">content_copy</span>
                      복사하기
                    </button>
                    <button
                      onClick={() => setSharingIndex(sharingIndex === i ? null : i)}
                      className="p-1 text-slate-300 hover:text-blue-600 transition-colors flex items-center gap-1 text-[10px] font-bold"
                    >
                      <span className="material-symbols-outlined text-sm">share</span>
                      공유하기
                    </button>
                  </div>
                )}
                {sharingIndex === i && (
                  <div className="absolute top-full right-0 mt-2 z-50 bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 min-w-[140px] animate-in fade-in zoom-in duration-200">
                    <button onClick={() => copyToClipboard(msg.text)} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-blue-50 rounded-xl text-slate-700 text-xs font-bold">
                      <span className="material-symbols-outlined text-blue-600 text-sm">content_copy</span> 복사
                    </button>
                    <button onClick={() => shareByEmail(msg.text)} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-blue-50 rounded-xl text-slate-700 text-xs font-bold">
                      <span className="material-symbols-outlined text-blue-600 text-sm">mail</span> 이메일
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3">
            <div className="size-10 rounded-full bg-white border border-gray-100 flex-shrink-0 overflow-hidden shadow-sm">
              <img src="https://raw.githubusercontent.com/1004aimbot-dev/images/main/leehy.png" alt="AI Bible Guide" />
            </div>
            <div className="p-4 bg-white rounded-3xl rounded-tl-none border border-gray-100 flex gap-1 items-center shadow-sm">
              <div className="size-1.5 bg-blue-300 rounded-full animate-bounce"></div>
              <div className="size-1.5 bg-blue-300 rounded-full animate-bounce delay-75"></div>
              <div className="size-1.5 bg-blue-300 rounded-full animate-bounce delay-150"></div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area & Updated Suggestion Chips */}
      <div className="bg-white p-6 border-t border-gray-50 rounded-b-[2.5rem] shadow-sm space-y-5 relative z-20">
        <div className="flex justify-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {dailyChips.map(chip => (
            <button
              key={chip.label}
              onClick={() => handleChipClick(chip.query)}
              className="whitespace-nowrap px-5 py-2.5 rounded-full border border-gray-200 bg-white text-[13px] font-bold text-slate-600 hover:border-blue-600 hover:text-blue-600 hover:bg-blue-50/30 transition-all active:scale-95 shadow-sm"
            >
              {chip.label}
            </button>
          ))}
        </div>
        <div className="flex gap-3 items-end">
          <div className="flex-1 bg-gray-50 border border-gray-100 rounded-2xl flex items-center p-1 focus-within:ring-1 focus-within:ring-blue-100 transition-all">
            <input
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-4 px-4 outline-none"
              placeholder="궁금한 신앙 질문을 입력하세요..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
          </div>
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className="size-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all disabled:bg-slate-200"
          >
            <span className="material-symbols-outlined">send</span>
          </button>
        </div>
        <p className="text-center text-[10px] text-slate-300 font-medium tracking-tight">AI 성경 길잡이는 신앙의 궁금증을 성경을 통해 함께 풀어갑니다.</p>
      </div>
    </div>
  );
};

export default AIGuide;
