
import React from 'react';

const Directions: React.FC = () => {
  const churchAddress = "경기도 성남시 중원구 둔촌대로 148";
  const churchName = "성남신광교회";

  // 지도 서비스별 검색 결과 링크
  const naverMapUrl = `https://map.naver.com/v5/search/${encodeURIComponent(churchAddress)}`;
  const kakaoMapUrl = `https://map.kakao.com/link/search/${encodeURIComponent(churchName)}`;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-12">
      <div className="space-y-2">
        <div className="flex gap-2 text-sm text-slate-400 font-medium">
          <span>Home</span> / <span className="text-slate-900 font-bold">오시는 길</span>
        </div>
        <h1 className="text-4xl font-black">오시는 길</h1>
        <p className="text-lg text-slate-500">성남신광교회는 주님의 이름으로 여러분을 환영합니다.</p>
      </div>

      {/* Real Google Map Container (Very thin white border applied) */}
      <div className="relative h-[550px] rounded-[3rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.08)] border border-white ring-1 ring-gray-100 group transition-all duration-500 hover:shadow-[0_30px_60px_rgba(0,0,0,0.12)]">
        <iframe
          title="성남신광교회 지도"
          width="100%"
          height="100%"
          frameBorder="0"
          style={{ border: 0 }}
          src={`https://maps.google.com/maps?q=${encodeURIComponent(churchAddress)}&t=&z=16&ie=UTF8&iwloc=&output=embed`}
          allowFullScreen
          loading="lazy"
          className="grayscale-[0.1] contrast-[1.05]"
        ></iframe>

        {/* Floating Address Info Card */}
        <div className="absolute top-6 left-6 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/50 flex items-center gap-4 z-10 pointer-events-none sm:pointer-events-auto transition-transform group-hover:scale-105">
          <div className="size-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-100">
            <span className="material-symbols-outlined text-xl">location_on</span>
          </div>
          <div>
            <p className="text-[9px] text-blue-600 font-black uppercase tracking-widest mb-0.5">CHURCH ADDRESS</p>
            <p className="text-sm font-black text-slate-900">(13385) 경기도 성남시 중원구 둔촌대로 148 (하대원동)</p>
          </div>
        </div>

        {/* Zoom Guide Overlay */}
        <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-10">
           <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-white shadow-lg text-[10px] font-black text-slate-400 text-center tracking-tight">
             지도 이동/확대 가능
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm space-y-8">
            <h3 className="text-xl font-bold flex items-center gap-2"><span className="material-symbols-outlined text-blue-600">home_pin</span> 주소 안내</h3>
            
            <div className="space-y-6">
              <div>
                <p className="text-[13px] text-slate-400 font-medium mb-2">도로명 주소</p>
                <p className="text-[15px] font-bold leading-relaxed text-slate-900">
                  (13385) 경기도 성남시 중원구 둔촌대로 148 (하대원동)
                </p>
              </div>
              
              <div className="h-px bg-gray-50"></div>
              
              <div>
                <p className="text-[13px] text-slate-400 font-medium mb-2">전화번호</p>
                <p className="text-lg font-black text-slate-900">031-752-2603</p>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <a 
                href={naverMapUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex-1 bg-[#03C75A] text-white font-black py-4 rounded-2xl text-[15px] shadow-lg shadow-green-100 flex items-center justify-center transition-all hover:scale-[1.02] active:scale-95"
              >
                네이버 지도
              </a>
              <a 
                href={kakaoMapUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex-1 bg-[#FEE500] text-[#3C1E1E] font-black py-4 rounded-2xl text-[15px] shadow-lg shadow-yellow-100 flex items-center justify-center transition-all hover:scale-[1.02] active:scale-95"
              >
                카카오 맵
              </a>
            </div>
          </div>

          <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2"><span className="material-symbols-outlined text-blue-600">local_parking</span> 주차 안내</h3>
            <div className="bg-blue-50/50 p-5 rounded-3xl border border-blue-100 text-sm">
               <div className="flex items-center gap-2 text-blue-600 font-bold mb-2">
                 <span className="material-symbols-outlined text-lg">garage_home</span>
                 <p>교회 전용 주차장 (B1-B2)</p>
               </div>
               <p className="text-slate-600 leading-relaxed">주일 및 수요일/주중 예배 시 성도님들을 위해 상시 개방합니다.</p>
            </div>
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-3xl border border-gray-100">
              <span className="material-symbols-outlined text-amber-500 text-xl">info</span>
              <p className="text-xs text-slate-500 leading-relaxed">
                <span className="font-bold text-slate-700">공영 주차장 안내:</span><br />
                교회 주차장 만차 시 맞은편 공영주차장을 이용해 주세요. (주일은 무료 이용이 가능합니다)
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-[2rem] p-8 md:p-12 border border-gray-100 shadow-sm space-y-10">
           <div className="pb-6 border-b border-gray-50">
             <h3 className="text-2xl font-black flex items-center gap-3"><span className="material-symbols-outlined text-blue-600 text-3xl">directions_bus</span> 대중교통 상세 안내</h3>
             <p className="text-slate-400 text-sm mt-1">지하철 8호선/수인분당선 모란역에서 접근이 매우 용이합니다.</p>
           </div>
           
           <div className="space-y-6">
             <h4 className="font-bold flex items-center gap-2 text-lg"><span className="material-symbols-outlined text-slate-900">subway</span> 지하철 이용 시</h4>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="p-5 bg-white rounded-2xl flex items-center gap-4 border border-gray-100 shadow-sm hover:border-blue-200 transition-colors">
                 <div className="size-12 bg-[#D4003B] text-white rounded-full flex items-center justify-center font-black text-lg shadow-lg shadow-red-100">8</div>
                 <div>
                   <p className="font-bold text-slate-900">모란역 (8호선)</p>
                   <p className="text-xs text-slate-400 font-medium">2번 출구에서 성남동 행정복지센터 방향 도보 10분</p>
                 </div>
               </div>
               <div className="p-5 bg-white rounded-2xl flex items-center gap-4 border border-gray-100 shadow-sm hover:border-blue-200 transition-colors">
                 <div className="size-12 bg-[#FFB300] text-white rounded-full flex items-center justify-center font-black text-lg shadow-lg shadow-amber-100">K</div>
                 <div>
                   <p className="font-bold text-slate-900">모란역 (수인분당선)</p>
                   <p className="text-xs text-slate-400 font-medium">3번 출구 방면 • 하대원동 방향으로 도보 약 12분</p>
                 </div>
               </div>
             </div>
           </div>

           <div className="space-y-6">
             <h4 className="font-bold flex items-center gap-2 text-lg"><span className="material-symbols-outlined text-slate-900">directions_bus</span> 버스 노선 안내</h4>
             <div className="space-y-4">
                <div className="p-6 bg-gray-50/50 border border-gray-100 rounded-2xl flex flex-col md:flex-row gap-6 md:items-center group hover:bg-white hover:shadow-md transition-all">
                  <span className="inline-block px-4 py-1.5 bg-green-100 text-green-700 text-[10px] font-black rounded-full w-fit uppercase tracking-tighter">마을버스</span>
                  <div className="flex-1">
                    <p className="font-bold mb-2 text-slate-900">성남신광교회 정류장 (하차 즉시 보임)</p>
                    <div className="flex gap-2">
                       {['3-1', '32', '76'].map(n => (
                         <span key={n} className="px-3 py-1 bg-white border border-gray-200 text-slate-600 rounded-lg text-xs font-black shadow-sm group-hover:border-green-200">{n}</span>
                       ))}
                    </div>
                  </div>
                </div>
                <div className="p-6 bg-gray-50/50 border border-gray-100 rounded-2xl flex flex-col md:flex-row gap-6 md:items-center group hover:bg-white hover:shadow-md transition-all">
                  <span className="inline-block px-4 py-1.5 bg-blue-100 text-blue-700 text-[10px] font-black rounded-full w-fit uppercase tracking-tighter">일반 시내버스</span>
                  <div className="flex-1">
                    <p className="font-bold mb-2 text-slate-900">모란고개 / 모란시장 정류장 (도보 5분)</p>
                    <div className="flex flex-wrap gap-2">
                       {['55', '100', '200', '220', '330', '500-1', '500-2'].map(n => (
                         <span key={n} className="px-3 py-1 bg-white border border-gray-200 text-slate-600 rounded-lg text-xs font-black shadow-sm group-hover:border-blue-200">{n}</span>
                       ))}
                    </div>
                  </div>
                </div>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Directions;
