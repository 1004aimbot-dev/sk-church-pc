
import React, { useState, useEffect } from 'react';

interface DailyRecord {
  checkedItems: {
    bible: boolean;
    prayer: boolean;
    gratitude: boolean;
  };
  prayerTime: string;
  bibleText: string;
  gratitudeTexts: string[];
}

const Checklist: React.FC = () => {
  // 현재 달력 뷰를 위한 상태
  const [currentViewDate, setCurrentViewDate] = useState(new Date());
  // 실제 선택된 날짜 (데이터 로딩 기준)
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [checkedItems, setCheckedItems] = useState({
    bible: false,
    prayer: false,
    gratitude: false,
  });

  const [prayerTime, setPrayerTime] = useState('30분');
  const [bibleText, setBibleText] = useState('');
  const [gratitudeTexts, setGratitudeTexts] = useState(['', '', '']);
  const [showToast, setShowToast] = useState(false);

  const today = new Date();

  // 선택된 날짜가 변경될 때마다 해당 날짜의 데이터를 서버에서 불러옴
  useEffect(() => {
    const dateKey = `${selectedDate.getFullYear()}-${selectedDate.getMonth() + 1}-${selectedDate.getDate()}`;

    fetch(`/api/qt?date=${dateKey}`)
      .then(res => res.json())
      .then(data => {
        if (data) {
          // DB에 데이터가 있는 경우
          setCheckedItems(data.checkedItems || { bible: false, prayer: false, gratitude: false });
          setPrayerTime(data.prayerTime || '30분');
          setBibleText(data.bibleText || '');
          setGratitudeTexts(data.gratitudeTexts || ['', '', '']);
        } else {
          // 데이터가 없는 날은 초기화
          setCheckedItems({ bible: false, prayer: false, gratitude: false });
          setPrayerTime('30분');
          setBibleText('');
          setGratitudeTexts(['', '', '']);
        }
      })
      .catch(err => console.error("Failed to load qt record:", err));
  }, [selectedDate]);

  const toggleItem = (key: keyof typeof checkedItems) => {
    setCheckedItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    const dateKey = `${selectedDate.getFullYear()}-${selectedDate.getMonth() + 1}-${selectedDate.getDate()}`;
    const dataToSave: DailyRecord = {
      checkedItems,
      prayerTime,
      bibleText,
      gratitudeTexts
    };

    try {
      const res = await fetch('/api/qt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date_key: dateKey, data: dataToSave })
      });

      if (res.ok) {
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      } else {
        alert("저장에 실패했습니다.");
      }
    } catch (err) {
      console.error("Failed to save qt record:", err);
      alert("서버 오류로 저장에 실패했습니다.");
    }
  };

  const handlePrayerSelect = (time: string) => {
    setPrayerTime(time);
    if (!checkedItems.prayer) {
      setCheckedItems(prev => ({ ...prev, prayer: true }));
    }
  };

  const handleGratitudeChange = (index: number, value: string) => {
    const newTexts = [...gratitudeTexts];
    newTexts[index] = value;
    setGratitudeTexts(newTexts);
    if (value.trim() !== '' && !checkedItems.gratitude) {
      setCheckedItems(prev => ({ ...prev, gratitude: true }));
    }
  };

  const progress = Math.round((Object.values(checkedItems).filter(Boolean).length / 3) * 100);

  // 달력 계산 로직
  const year = currentViewDate.getFullYear();
  const month = currentViewDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => {
    setCurrentViewDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentViewDate(new Date(year, month + 1, 1));
  };

  const handleDateClick = (day: number) => {
    setSelectedDate(new Date(year, month, day));
  };

  const isToday = (day: number) => {
    return today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
  };

  const isSelected = (day: number) => {
    return selectedDate.getFullYear() === year && selectedDate.getMonth() === month && selectedDate.getDate() === day;
  };

  const isPast = (day: number) => {
    const checkDate = new Date(year, month, day);
    const comparisonToday = new Date(today);
    comparisonToday.setHours(0, 0, 0, 0);
    return checkDate < comparisonToday;
  };

  const years = Array.from({ length: 81 }, (_, i) => 1980 + i);
  const months = Array.from({ length: 12 }, (_, i) => i);

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 space-y-10 relative">
      {showToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
          <span className="material-symbols-outlined">check_circle</span>
          기록이 주님 앞에 안전하게 저장되었습니다!
        </div>
      )}

      <div className="flex flex-wrap justify-between items-end gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-black">오늘의 QT</h1>
          <p className="text-blue-600 font-medium text-lg">
            {selectedDate.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}의 기록
          </p>
        </div>
        <button
          onClick={handleSave}
          className="bg-blue-600 text-white font-bold px-8 py-4 rounded-xl shadow-xl shadow-blue-100 hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
        >
          <span className="material-symbols-outlined">save</span>
          오늘의 기록 저장
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm text-center">
            <div className="flex justify-between items-center mb-6 px-2">
              <button onClick={prevMonth} className="text-slate-300 hover:text-blue-600 transition-colors p-1">
                <span className="material-symbols-outlined text-2xl">chevron_left</span>
              </button>

              <div className="flex items-center gap-1 group">
                <div className="relative">
                  <select
                    value={year}
                    onChange={(e) => setCurrentViewDate(new Date(parseInt(e.target.value), month, 1))}
                    className="appearance-none bg-transparent font-black text-xl px-2 py-1 rounded-xl cursor-pointer hover:bg-blue-50 hover:text-blue-600 transition-all outline-none border border-transparent hover:border-blue-100"
                  >
                    {years.map(y => (
                      <option key={y} value={y}>{y}년</option>
                    ))}
                  </select>
                </div>
                <div className="relative">
                  <select
                    value={month}
                    onChange={(e) => setCurrentViewDate(new Date(year, parseInt(e.target.value), 1))}
                    className="appearance-none bg-transparent font-black text-xl px-2 py-1 rounded-xl cursor-pointer hover:bg-blue-50 hover:text-blue-600 transition-all outline-none border border-transparent hover:border-blue-100"
                  >
                    {months.map(m => (
                      <option key={m} value={m}>{m + 1}월</option>
                    ))}
                  </select>
                </div>
                <span className="material-symbols-outlined text-lg text-slate-300 group-hover:text-blue-500 transition-colors">unfold_more</span>
              </div>

              <button onClick={nextMonth} className="text-slate-300 hover:text-blue-600 transition-colors p-1">
                <span className="material-symbols-outlined text-2xl">chevron_right</span>
              </button>
            </div>

            <div className="grid grid-cols-7 text-xs font-bold text-slate-400 gap-y-2">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                <div key={d} className={i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : ''}>{d}</div>
              ))}

              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`empty-${i}`} className="size-10"></div>
              ))}

              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dayOfWeek = (firstDayOfMonth + i) % 7;
                const active = isToday(day);
                const selected = isSelected(day);
                const past = isPast(day);

                return (
                  <div
                    key={day}
                    onClick={() => handleDateClick(day)}
                    className={`size-10 flex items-center justify-center rounded-full mx-auto cursor-pointer transition-all duration-200 text-sm font-medium relative
                      ${selected ? 'ring-2 ring-blue-400 ring-offset-2' : ''}
                      ${active ? 'bg-blue-600 text-white font-black shadow-lg shadow-blue-100 scale-110' :
                        past ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50 text-slate-600'}
                      ${dayOfWeek === 0 && !active ? 'text-red-400' : ''}
                      ${dayOfWeek === 6 && !active ? 'text-blue-400' : ''}
                    `}
                  >
                    {day}
                    {/* 기록이 있는 날짜 표시용 점 (API 연동 시 별도 로직 필요, 현재는 생략) */}
                    {/* 
                    {localStorage.getItem(`sgch_qt_${year}-${month + 1}-${day}`) && !active && (
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 size-1 bg-blue-400 rounded-full"></div>
                    )} 
                    */}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold">이날의 영적 성장도</h3>
              <span className="bg-blue-50 text-blue-600 text-xs font-bold px-2 py-1 rounded">{progress}% 완료</span>
            </div>
            <div className="h-3 bg-gray-50 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 transition-all duration-700" style={{ width: `${progress}%` }}></div>
            </div>
            <p className="text-xs text-blue-600 font-bold flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">auto_awesome</span>
              {progress === 100 ? '영적 성장을 완수하셨습니다!' : '말씀과 기도로 거룩해지는 하루입니다!'}
            </p>
          </div>
        </div>

        <div className="md:col-span-7 space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-blue-600">event_available</span>
            <h2 className="text-2xl font-bold">활동 점검</h2>
          </div>

          <div className="space-y-4">
            {/* 성경 통독 카드 */}
            <div className={`bg-white rounded-3xl p-6 border transition-all cursor-pointer ${checkedItems.bible ? 'border-blue-100 shadow-md ring-2 ring-blue-50/50' : 'border-gray-100 shadow-sm opacity-60'}`}>
              <div className="flex items-start justify-between">
                <div className="flex gap-4" onClick={() => toggleItem('bible')}>
                  <div className={`size-12 rounded-xl flex items-center justify-center transition-colors ${checkedItems.bible ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600'}`}>
                    <span className="material-symbols-outlined">menu_book</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">성경 통독</h4>
                    <p className="text-xs text-slate-400">말씀은 내 발의 등이요 내 길의 빛이니이다</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={checkedItems.bible}
                  onChange={() => toggleItem('bible')}
                  className="size-6 rounded text-blue-600 focus:ring-blue-600 border-gray-200 cursor-pointer"
                />
              </div>
              <div className="mt-6" onClick={(e) => e.stopPropagation()}>
                <input
                  className="w-full bg-gray-50 border-none rounded-xl p-4 text-sm focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                  placeholder="오늘 읽은 본문을 기록하세요"
                  value={bibleText}
                  onChange={(e) => setBibleText(e.target.value)}
                />
              </div>
            </div>

            {/* 기도 시간 카드 */}
            <div className={`bg-white rounded-3xl p-6 border transition-all cursor-pointer ${checkedItems.prayer ? 'border-blue-100 shadow-md ring-2 ring-blue-50/50' : 'border-gray-100 shadow-sm opacity-60'}`}>
              <div className="flex items-start justify-between">
                <div className="flex gap-4" onClick={() => toggleItem('prayer')}>
                  <div className={`size-12 rounded-xl flex items-center justify-center transition-colors ${checkedItems.prayer ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600'}`}>
                    <span className="material-symbols-outlined">self_improvement</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">기도 시간</h4>
                    <p className="text-xs text-slate-400">쉬지 말고 기도하십시오</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={checkedItems.prayer}
                  onChange={() => toggleItem('prayer')}
                  className="size-6 rounded text-blue-600 focus:ring-blue-600 border-gray-200 cursor-pointer"
                />
              </div>
              <div className="mt-6 flex gap-2" onClick={(e) => e.stopPropagation()}>
                {['15분', '30분', '1시간+'].map(t => (
                  <button
                    key={t}
                    onClick={() => handlePrayerSelect(t)}
                    className={`flex-1 px-4 py-3 rounded-lg text-xs font-bold border transition-all ${prayerTime === t && checkedItems.prayer
                      ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100 scale-105'
                      : 'bg-white border-gray-100 text-slate-500 hover:border-blue-200'
                      }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* 오늘의 감사 카드 */}
            <div className={`bg-white rounded-3xl p-6 border transition-all cursor-pointer ${checkedItems.gratitude ? 'border-blue-100 shadow-md ring-2 ring-blue-50/50' : 'border-gray-100 shadow-sm opacity-60'}`}>
              <div className="flex items-start justify-between">
                <div className="flex gap-4" onClick={() => toggleItem('gratitude')}>
                  <div className={`size-12 rounded-xl flex items-center justify-center transition-colors ${checkedItems.gratitude ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600'}`}>
                    <span className="material-symbols-outlined">favorite</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">오늘의 감사</h4>
                    <p className="text-xs text-slate-400">범사에 감사하라</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={checkedItems.gratitude}
                  onChange={() => toggleItem('gratitude')}
                  className="size-6 rounded text-blue-600 focus:ring-blue-600 border-gray-200 cursor-pointer"
                />
              </div>
              <div className="mt-6 space-y-2" onClick={(e) => e.stopPropagation()}>
                {[0, 1, 2].map(i => (
                  <input
                    key={i}
                    className="w-full bg-transparent border-b border-gray-100 py-3 text-sm focus:border-blue-600 transition-colors outline-none"
                    placeholder={`${i + 1}. 감사한 일 기록하기...`}
                    value={gratitudeTexts[i]}
                    onChange={(e) => handleGratitudeChange(i, e.target.value)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 rounded-[2rem] p-10 border-l-8 border-blue-600 relative overflow-hidden">
        <span className="material-symbols-outlined text-[100px] text-blue-600 opacity-5 absolute -right-4 -bottom-4">church</span>
        <div className="relative z-10 space-y-6">
          <p className="font-myeongjo italic text-2xl text-blue-900 leading-relaxed">
            "영적 성장은 매일의 작은 실천들이 모여 이루어집니다. 오늘 주님 앞에 엎드린 당신의 그 시간이 가장 귀한 열매가 될 것입니다. 오늘도 말씀 안에서 승리하십시오."
          </p>
          <div className="flex items-center gap-4">
            <div className="size-14 rounded-full border-2 border-blue-600 overflow-hidden">
              <img src="https://raw.githubusercontent.com/1004aimbot-dev/images/main/leehy.png" alt="이현용 담임목사" />
            </div>
            <div>
              <p className="font-bold">이현용 담임목사</p>
              <p className="text-xs text-blue-600 font-bold">성남신광교회</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checklist;
