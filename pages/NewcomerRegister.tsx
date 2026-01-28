
import React, { useState, useEffect, useContext } from 'react';
import { AdminContext } from '../App';

interface Newcomer {
    id: number;
    name: string;
    phone: string;
    birth_date: string;
    address: string;
    description: string;
    registration_date: string;
}

const NewcomerRegister: React.FC = () => {
    const { isAdmin } = useContext(AdminContext);
    const [newcomers, setNewcomers] = useState<Newcomer[]>([]);
    const [form, setForm] = useState({
        name: '',
        phone: '',
        birth_date: '',
        address: '',
        description: ''
    });

    const fetchNewcomers = () => {
        try {
            const saved = localStorage.getItem('sgch_newcomers');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) {
                    setNewcomers(parsed);
                } else {
                    setNewcomers([]);
                }
            } else {
                setNewcomers([]);
            }
        } catch (err) {
            console.error(err);
            setNewcomers([]);
        }
    };

    useEffect(() => {
        fetchNewcomers();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name || !form.phone) {
            alert("이름과 연락처는 필수항목입니다.");
            return;
        }

        try {
            const newItem: Newcomer = {
                id: Date.now(),
                ...form,
                registration_date: new Date().toISOString()
            };

            const updatedList = [newItem, ...newcomers];
            localStorage.setItem('sgch_newcomers', JSON.stringify(updatedList));

            alert("새가족 등록이 완료되었습니다.");
            setForm({ name: '', phone: '', birth_date: '', address: '', description: '' });
            setNewcomers(updatedList);
        } catch (err) {
            console.error(err);
            alert("오류 발생 (브라우저 저장공간 확인 필요)");
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-12 px-4 space-y-12">
            <div className="text-center space-y-4">
                <span className="inline-block px-4 py-1 bg-green-100 text-green-700 rounded-full text-sm font-bold">New Family</span>
                <h1 className="text-4xl font-black font-myeongjo">새가족 등록 및 관리</h1>
                <p className="text-slate-500">교회에 새로 오신 분들을 소중히 기록하고 섬깁니다.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* 등록 폼 */}
                <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-gray-100">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <span className="material-symbols-outlined text-green-600">person_add</span>
                        새가족 등록하기
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">성함 *</label>
                            <input
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-green-200 outline-none"
                                placeholder="홍길동"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">연락처 *</label>
                            <input
                                name="phone"
                                value={form.phone}
                                onChange={handleChange}
                                className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-green-200 outline-none"
                                placeholder="010-1234-5678"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">생년월일</label>
                                <input
                                    name="birth_date"
                                    value={form.birth_date}
                                    onChange={handleChange}
                                    className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-green-200 outline-none"
                                    placeholder="1990-01-01"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">거주 지역</label>
                                <input
                                    name="address"
                                    value={form.address}
                                    onChange={handleChange}
                                    className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-green-200 outline-none"
                                    placeholder="성남시 중원구"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">비고 / 기도제목</label>
                            <textarea
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                rows={3}
                                className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-green-200 outline-none resize-none"
                                placeholder="특이사항이나 기도제목을 입력하세요."
                            />
                        </div>
                        <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-green-100 mt-4">
                            등록하기
                        </button>
                    </form>
                </div>

                {/* 목록 리스트 */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <span className="material-symbols-outlined text-blue-600">list</span>
                            등록 현황
                            <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full">{newcomers.length}명</span>
                        </h2>
                        {!isAdmin && <span className="text-xs text-slate-400">* 개인정보 보호를 위해 일부 정보만 표시됩니다.</span>}
                    </div>

                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                        {newcomers.length === 0 ? (
                            <div className="text-center py-10 text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                아직 등록된 새가족이 없습니다.
                            </div>
                        ) : (
                            newcomers.map(person => (
                                <div key={person.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:border-blue-200 transition-colors group">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-lg">{person.name}</h3>
                                            <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                                                {newcomers.indexOf(person) === 0 ? 'N' : ''} {person.birth_date}
                                            </span>
                                        </div>
                                        <span className="text-[10px] text-slate-400">
                                            {new Date(person.registration_date).toLocaleDateString()}
                                        </span>
                                    </div>

                                    {isAdmin ? (
                                        <div className="text-sm text-slate-600 space-y-1">
                                            <p className="flex items-center gap-2"><span className="material-symbols-outlined text-xs">call</span> {person.phone}</p>
                                            <p className="flex items-center gap-2"><span className="material-symbols-outlined text-xs">home</span> {person.address}</p>
                                            {person.description && (
                                                <p className="mt-2 bg-yellow-50 p-2 rounded text-xs text-yellow-800 border border-yellow-100">
                                                    {person.description}
                                                </p>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="text-sm text-slate-400 italic">
                                            관리자에게만 상세 정보가 표시됩니다.
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NewcomerRegister;
