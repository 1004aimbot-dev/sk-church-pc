
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

// 성능 최적화를 위한 리스트 아이템 컴포넌트 분리 (React.memo)
const NewcomerItem = React.memo(({
    person,
    index,
    isAdmin,
    editingId,
    onEdit,
    onDelete
}: {
    person: Newcomer;
    index: number;
    isAdmin: boolean;
    editingId: number | null;
    onEdit: (item: Newcomer) => void;
    onDelete: (id: number) => void;
}) => {
    return (
        <div className={`bg-white p-5 rounded-2xl shadow-sm border transition-colors group relative
            ${editingId === person.id ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-100 hover:border-blue-200'}
        `}>
            <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg">{person.name}</h3>
                    <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                        {index === 0 ? 'N' : ''} {person.birth_date}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400">
                        {new Date(person.registration_date).toLocaleDateString()}
                    </span>
                    {isAdmin && (
                        <div className="flex gap-1 ml-2">
                            <button
                                onClick={() => onEdit(person)}
                                className="size-7 flex items-center justify-center rounded-lg bg-gray-50 text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                                title="수정"
                            >
                                <span className="material-symbols-outlined text-sm">edit</span>
                            </button>
                            <button
                                onClick={() => onDelete(person.id)}
                                className="size-7 flex items-center justify-center rounded-lg bg-gray-50 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                                title="삭제"
                            >
                                <span className="material-symbols-outlined text-sm">delete</span>
                            </button>
                        </div>
                    )}
                </div>
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
    );
});

const NewcomerRegister: React.FC = () => {
    const { isAdmin } = useContext(AdminContext);
    const [newcomers, setNewcomers] = useState<Newcomer[]>([]);
    const [editingId, setEditingId] = useState<number | null>(null); // 수정 중인 ID
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
            let updatedList: Newcomer[];

            if (editingId) {
                // 수정 모드: 기존 아이템 업데이트
                updatedList = newcomers.map(item =>
                    item.id === editingId
                        ? { ...item, ...form }
                        : item
                );
                alert("정보가 수정되었습니다.");
                setEditingId(null);
            } else {
                // 등록 모드: 새 아이템 추가
                const newItem: Newcomer = {
                    id: Date.now(),
                    ...form,
                    registration_date: new Date().toISOString()
                };
                updatedList = [newItem, ...newcomers];
                alert("새가족 등록이 완료되었습니다.");
            }

            localStorage.setItem('sgch_newcomers', JSON.stringify(updatedList));
            setForm({ name: '', phone: '', birth_date: '', address: '', description: '' });
            setNewcomers(updatedList);
        } catch (err) {
            console.error(err);
            alert("오류 발생 (브라우저 저장공간 확인 필요)");
        }
    };

    // 삭제 핸들러
    const handleDelete = (id: number) => {
        if (!window.confirm("정말로 삭제하시겠습니까?\n삭제된 정보는 복구할 수 없습니다.")) return;

        try {
            const updatedList = newcomers.filter(item => item.id !== id);
            localStorage.setItem('sgch_newcomers', JSON.stringify(updatedList));
            setNewcomers(updatedList);

            // 만약 수정 중이던 항목을 삭제했다면 폼 초기화
            if (editingId === id) {
                setEditingId(null);
                setForm({ name: '', phone: '', birth_date: '', address: '', description: '' });
            }
        } catch (err) {
            console.error(err);
            alert("삭제 중 오류가 발생했습니다.");
        }
    };

    // 수정 핸들러 (폼에 데이터 채우기)
    const handleEdit = (item: Newcomer) => {
        setEditingId(item.id);
        setForm({
            name: item.name,
            phone: item.phone,
            birth_date: item.birth_date,
            address: item.address,
            description: item.description
        });
        // 폼 있는 곳으로 스크롤 이동 (모바일 배려)
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // 수정 취소
    const handleCancelEdit = () => {
        setEditingId(null);
        setForm({ name: '', phone: '', birth_date: '', address: '', description: '' });
    };

    return (
        <div className="max-w-4xl mx-auto py-12 px-4 space-y-12">
            <div className="text-center space-y-4">
                <span className="inline-block px-4 py-1 bg-green-100 text-green-700 rounded-full text-sm font-bold">New Family</span>
                <h1 className="text-4xl font-black font-myeongjo">새가족 등록 및 관리</h1>
                <p className="text-slate-500">교회에 새로 오신 분들을 소중히 기록하고 섬깁니다.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* 등록/수정 폼 */}
                <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-gray-100 h-fit sticky top-24">
                    <h2 className="text-xl font-bold mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className={`material-symbols-outlined ${editingId ? 'text-blue-600' : 'text-green-600'}`}>
                                {editingId ? 'edit' : 'person_add'}
                            </span>
                            {editingId ? '정보 수정하기' : '새가족 등록하기'}
                        </div>
                        {editingId && (
                            <button onClick={handleCancelEdit} className="text-xs text-slate-400 underline hover:text-slate-600">
                                취소
                            </button>
                        )}
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
                        <button
                            type="submit"
                            className={`w-full font-bold py-4 rounded-xl transition-all shadow-lg mt-4 text-white
                                ${editingId
                                    ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-100'
                                    : 'bg-green-600 hover:bg-green-700 shadow-green-100'}`}
                        >
                            {editingId ? '수정 완료' : '등록하기'}
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
                            newcomers.map((person, index) => (
                                <NewcomerItem
                                    key={person.id}
                                    person={person}
                                    index={index}
                                    isAdmin={isAdmin}
                                    editingId={editingId}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                />
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NewcomerRegister;


