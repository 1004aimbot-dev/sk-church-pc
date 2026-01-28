
import React, { useState, useEffect, useContext } from 'react';
import { AdminContext } from '../App';

interface WorshipRow {
  id: number;
  name: string;
  time: string;
  place: string;
  teacher?: string; // 교회학교용 담당 교역자 필드
}

const WorshipInfo: React.FC = () => {
  const { isAdmin } = useContext(AdminContext);

  // 일반 예배 데이터
  const [generalWorship, setGeneralWorship] = useState<WorshipRow[]>([
    { id: 1, name: '주일오전1부예배', place: '본당', time: '오전 9시' },
    { id: 2, name: '주일오전2부예배', place: '본당', time: '오전 11시' },
    { id: 3, name: '주일오후찬양예배', place: '본당', time: '오후 2시' },
    { id: 4, name: '수요예배', place: '본당', time: '오후 7시' },
    { id: 5, name: '금요성령집회', place: '본당', time: '오후 8시' },
    { id: 6, name: '새벽기도회', place: '비전센터 2층', time: '오전 5시(월~토)' },
  ]);

  // 교회학교 데이터
  const [schoolWorship, setSchoolWorship] = useState<WorshipRow[]>([
    { id: 101, name: '영유아유치부', place: '비전센터 2층', time: '주일 오전 11시', teacher: '민진홍 교육전도사' },
    { id: 102, name: '초등부', place: '비전센터 3층', time: '주일 오전 11시', teacher: '박종우 교육전도사' },
    { id: 103, name: '청소년부', place: '비전센터 4층', time: '주일 오전 11시', teacher: '오정신 교육전도사' },
    { id: 104, name: '청년부', place: '비전센터 2층', time: '주일 오후 2시', teacher: '최찬규 목사' },
  ]);

  // 모달 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'general' | 'school'>('general');
  const [editingRow, setEditingRow] = useState<WorshipRow | null>(null);
  const [formData, setFormData] = useState({ name: '', time: '', place: '', teacher: '' });
  const [toast, setToast] = useState<{ show: boolean, message: string }>({ show: false, message: '' });

  // DB 데이터 로드
  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await fetch('/api/content');
        if (res.ok) {
          const data = await res.json();
          if (data.general_worship) setGeneralWorship(JSON.parse(data.general_worship));
          if (data.school_worship) setSchoolWorship(JSON.parse(data.school_worship));
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchContent();
  }, []);

  const showToast = (message: string) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: '' }), 3000);
  };

  const openModal = (type: 'general' | 'school', row?: WorshipRow) => {
    setModalType(type);
    if (row) {
      setEditingRow(row);
      setFormData({ name: row.name, time: row.time, place: row.place, teacher: row.teacher || '' });
    } else {
      setEditingRow(null);
      setFormData({ name: '', time: '', place: '', teacher: '' });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const rowToSave = { ...(editingRow || { id: Date.now() }), ...formData };

    let updatedGeneral = generalWorship;
    let updatedSchool = schoolWorship;

    if (modalType === 'general') {
      if (editingRow) {
        updatedGeneral = generalWorship.map(r => r.id === editingRow.id ? rowToSave : r);
      } else {
        updatedGeneral = [...generalWorship, rowToSave];
      }
      setGeneralWorship(updatedGeneral);
    } else {
      if (editingRow) {
        updatedSchool = schoolWorship.map(r => r.id === editingRow.id ? rowToSave : r);
      } else {
        updatedSchool = [...schoolWorship, rowToSave];
      }
      setSchoolWorship(updatedSchool);
    }

    // DB 저장
    try {
      await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: modalType === 'general' ? 'general_worship' : 'school_worship',
          value: JSON.stringify(modalType === 'general' ? updatedGeneral : updatedSchool)
        })
      });
      showToast('저장되었습니다.');
    } catch (err) {
      console.error(err);
      showToast('저장 실패');
    }

    setIsModalOpen(false);
  };

  const handleDelete = async (id: number, type: 'general' | 'school') => {
    if (window.confirm('삭제하시겠습니까?')) {
      let updatedGeneral = generalWorship;
      let updatedSchool = schoolWorship;

      if (type === 'general') {
        updatedGeneral = generalWorship.filter(r => r.id !== id);
        setGeneralWorship(updatedGeneral);
      } else {
        updatedSchool = schoolWorship.filter(r => r.id !== id);
        setSchoolWorship(updatedSchool);
      }

      // DB 저장
      try {
        await fetch('/api/content', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            key: type === 'general' ? 'general_worship' : 'school_worship',
            value: JSON.stringify(type === 'general' ? updatedGeneral : updatedSchool)
          })
        });
        showToast('삭제되었습니다.');
      } catch (err) {
        console.error(err);
        showToast('삭제 실패');
      }
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-12 px-4 space-y-16 relative">
      {toast.show && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[150] bg-slate-900 text-white px-8 py-3 rounded-2xl font-bold shadow-2xl animate-in fade-in slide-in-from-top-2">
          {toast.message}
        </div>
      )}

      {/* Hero Header */}
      <div className="text-center space-y-4">
        <h1 className="font-myeongjo text-4xl font-black text-slate-900 tracking-tight flex items-center justify-center gap-3">
          <span className="material-symbols-outlined text-teal-600 text-4xl">church</span>
          예배 안내
        </h1>
        <div className="h-1 w-20 bg-teal-500 mx-auto rounded-full"></div>
        <p className="text-slate-500 font-medium">성남신광교회의 예배 시간을 안내해 드립니다.</p>
      </div>

      {/* 예배 섹션 */}
      <section className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-50 rounded-xl">
              <span className="material-symbols-outlined text-teal-600">calendar_month</span>
            </div>
            <h2 className="text-2xl font-black text-slate-800">예배</h2>
          </div>
          {isAdmin && (
            <button onClick={() => openModal('general')} className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-teal-600 transition-colors">행 추가</button>
          )}
        </div>

        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl overflow-hidden">
          <table className="w-full text-center border-collapse">
            <thead>
              <tr className="bg-teal-600 text-white">
                <th className="py-3 px-4 font-bold text-sm border-r border-teal-500/30">구분</th>
                <th className="py-3 px-4 font-bold text-sm border-r border-teal-500/30">장소</th>
                <th className="py-3 px-4 font-bold text-sm">예배시간</th>
                {isAdmin && <th className="py-3 px-4 font-bold text-sm">관리</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {generalWorship.map((row) => (
                <tr key={row.id} className="hover:bg-teal-50/30 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-700 text-sm border-r border-gray-50">{row.name}</td>
                  <td className="py-3.5 px-4 text-slate-600 text-sm border-r border-gray-50">{row.place}</td>
                  <td className="py-3.5 px-4 text-slate-600 text-sm font-medium">{row.time}</td>
                  {isAdmin && (
                    <td className="py-2 px-4">
                      <div className="flex justify-center gap-1">
                        <button onClick={() => openModal('general', row)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><span className="material-symbols-outlined text-sm">edit</span></button>
                        <button onClick={() => handleDelete(row.id, 'general')} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><span className="material-symbols-outlined text-sm">delete</span></button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 교회학교 섹션 */}
      <section className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-50 rounded-xl">
              <span className="material-symbols-outlined text-teal-600">school</span>
            </div>
            <h2 className="text-2xl font-black text-slate-800">교회학교</h2>
          </div>
          {isAdmin && (
            <button onClick={() => openModal('school')} className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-teal-600 transition-colors">행 추가</button>
          )}
        </div>

        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl overflow-hidden">
          <table className="w-full text-center border-collapse">
            <thead>
              <tr className="bg-teal-600 text-white">
                <th className="py-3 px-4 font-bold text-sm border-r border-teal-500/30">부서</th>
                <th className="py-3 px-4 font-bold text-sm border-r border-teal-500/30">장소</th>
                <th className="py-3 px-4 font-bold text-sm border-r border-teal-500/30">예배시간</th>
                <th className="py-3 px-4 font-bold text-sm">담당교역자</th>
                {isAdmin && <th className="py-3 px-4 font-bold text-sm">관리</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {schoolWorship.map((row) => (
                <tr key={row.id} className="hover:bg-teal-50/30 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-700 text-sm border-r border-gray-50">{row.name}</td>
                  <td className="py-3.5 px-4 text-slate-600 text-sm border-r border-gray-50">{row.place}</td>
                  <td className="py-3.5 px-4 text-slate-600 text-sm border-r border-gray-50">{row.time}</td>
                  <td className="py-3.5 px-4 text-slate-500 text-sm font-medium italic">{row.teacher}</td>
                  {isAdmin && (
                    <td className="py-2 px-4">
                      <div className="flex justify-center gap-1">
                        <button onClick={() => openModal('school', row)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><span className="material-symbols-outlined text-sm">edit</span></button>
                        <button onClick={() => handleDelete(row.id, 'school')} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><span className="material-symbols-outlined text-sm">delete</span></button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Admin Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl p-8 border border-gray-100">
            <h3 className="text-xl font-black mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-teal-600">edit_note</span>
              정보 수정
            </h3>
            <form onSubmit={handleSave} className="space-y-4">
              <input className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm font-bold outline-none" placeholder="명칭 (예: 주일오전1부예배)" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
              <input className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm font-bold outline-none" placeholder="장소 (예: 본당)" value={formData.place} onChange={e => setFormData({ ...formData, place: e.target.value })} required />
              <input className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm font-bold outline-none" placeholder="시간 (예: 오전 9시)" value={formData.time} onChange={e => setFormData({ ...formData, time: e.target.value })} required />
              {modalType === 'school' && (
                <input className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm font-bold outline-none" placeholder="담당 교역자 (예: 최찬규 목사)" value={formData.teacher} onChange={e => setFormData({ ...formData, teacher: e.target.value })} />
              )}
              <div className="flex gap-2 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 text-slate-400 font-bold hover:bg-gray-50 rounded-xl">취소</button>
                <button type="submit" className="flex-1 bg-teal-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-teal-100 hover:bg-teal-700">저장</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorshipInfo;
