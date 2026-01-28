
import React from 'react';

const PastorMessage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 space-y-12">
      <nav className="flex items-center gap-2 text-sm">
        <span className="text-blue-600 font-medium">홈</span>
        <span className="material-symbols-outlined text-sm text-slate-300">chevron_right</span>
        <span className="text-blue-600 font-medium">교회소개</span>
        <span className="material-symbols-outlined text-sm text-slate-300">chevron_right</span>
        <span className="text-slate-900 font-bold">담임목사 인사말</span>
      </nav>

      <section className="bg-white rounded-[2rem] p-8 md:p-12 shadow-xl border border-gray-100 flex flex-col md:flex-row items-center md:items-start gap-12">
        <div className="shrink-0">
          <div className="size-64 md:size-80 rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
            <img src="https://raw.githubusercontent.com/1004aimbot-dev/images/main/leehy.png" className="w-full h-full object-cover" alt="이현용 담임목사" />
          </div>
        </div>
        <div className="flex-1 flex flex-col justify-center gap-4 py-4 text-center md:text-left">
           <span className="text-blue-600 font-bold text-sm tracking-widest uppercase">Senior Pastor</span>
           <h1 className="text-4xl md:text-5xl font-black">이현용 담임목사</h1>
           <p className="text-slate-500 text-xl font-medium italic">"주님의 사랑으로 여러분을 환영합니다"</p>
           <div className="flex items-center justify-center md:justify-start gap-2 text-slate-400 text-sm mt-4">
             <span className="material-symbols-outlined text-blue-600">mail</span>
             pastor@sn-shinkwang.org
           </div>
        </div>
      </section>

      <article className="space-y-10">
        <h2 className="font-myeongjo text-3xl font-black leading-snug border-l-8 border-blue-600 pl-8">
          환영합니다. 성남신광교회 홈페이지를 방문해주신 여러분을 축복합니다.
        </h2>
        <div className="space-y-6 text-lg text-slate-600 leading-relaxed font-medium">
          <p>
            성남신광교회는 하나님의 사랑 안에서 지역사회를 섬기고, 복음의 기쁨을 나누는 신앙 공동체입니다. 우리는 현대 사회의 고단한 삶 속에서 길을 잃은 영혼들이 참된 평안과 안식을 얻을 수 있도록 돕고자 합니다. 
          </p>
          <p>
            우리 교회는 오직 말씀 위에 서서, 성령의 인도하심을 따라 나아가고 있습니다. 하나님을 깊이 만나는 예배, 성도 간의 진실한 교제, 그리고 세상을 향한 따뜻한 나눔을 통해 그리스도의 향기를 전하는 교회가 되기를 소망합니다.
          </p>
          <p>
            이곳을 방문하신 모든 분들이 주님의 한량없는 은혜를 경험하고, 새로운 소망과 비전을 품게 되시기를 기도합니다. 성남신광교회의 문은 누구에게나 활짝 열려 있습니다. 함께 믿음의 길을 걸어가며 하나님 나라의 영광을 누리기를 원합니다.
          </p>
        </div>
        
        <div className="bg-blue-50/50 p-12 rounded-[2rem] border-l-8 border-blue-600 text-center space-y-4 shadow-sm">
          <p className="font-myeongjo text-2xl font-black text-blue-900 leading-relaxed">
             "오직 여호와를 앙망하는 자는 새 힘을 얻으리니 독수리가 날개치며 올라감 같을 것이요"
          </p>
          <p className="text-blue-600 font-bold">— 이사야 40:31</p>
        </div>

        <div className="text-right pt-10 border-t border-gray-100">
           <p className="text-slate-400 mb-2">성령의 인도하심을 따라,</p>
           <p className="text-2xl font-bold">성남신광교회 담임목사 <span className="text-blue-600 text-4xl ml-2">이현용</span> 올림</p>
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
