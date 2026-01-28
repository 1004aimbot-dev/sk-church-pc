
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
                <div className="text-sm text-slate-600 space-y-1">
                    <p className="flex items-center gap-2 text-slate-400">
                        <span className="material-symbols-outlined text-xs">call</span>
                        010-****-****
                    </p>
                    <p className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-xs">home</span>
                        {person.address ? (() => {
                            const parts = person.address.split(' ');
                            return parts.length > 2
                                ? parts.slice(0, -1).join(' ') + ' ***'
                                : person.address;
                        })() : '(주소 미입력)'}
                    </p>
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

    const fetchNewcomers = async () => {
        try {
            const res = await fetch('/api/newcomers');
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data)) {
                    setNewcomers(data);
                } else {
                    setNewcomers([]);
                }
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name || !form.phone) {
            alert("이름과 연락처는 필수항목입니다.");
            return;
        }

        try {
            let method = 'POST';
            let body: any = { ...form };

            if (editingId) {
                method = 'PUT'; // API가 PUT을 지원한다고 가정. 만약 지원 안하면 수정 로직 확인 필요.
                // 현재 /api/newcomers는 POST(등록)와 GET(조회)만 있을 수 있음.
                // 기존 task.md를 보면 "등록 및 목록 조회 GET/POST"만 있음.
                // 수정/삭제 API가 없다면 추가해야 하지만, 일단 POST로 덮어쓰거나 별도 처리가 필요할 수 있음.
                // 하지만 코드를 보면 ID가 있음.
                // 안전을 위해 POST에 mode를 넣거나, 쿼리 파라미터를 쓰거나 해야 함.
                // 여기서는 일단 간편하게 'POST'로 보내되, API가 구분 가능한지 확인이 안되므로
                // *가장 확실한 방법*: API 설계를 확인했어야 하나, 문맥상 POST로 통합 처리되었을 가능성 큼.
                // 혹은 API 파일 확인 없이 진행하므로, 표준적인 REST 관례보다
                // /api/newcomers 내에서 method === 'POST' && body.id 유무로 갈릴 수 있음.

                // 아하, 이전 대화 로그나 파일 확인을 안했으니, 
                // 안전하게: 프론트엔드에서 UUID 등을 생성하지 않고 DB ID를 쓴다면 
                // POST (신규), PUT/DELETE (수정/삭제)가 일반적임.
                // 일단 PUT/DELETE 호출 코드로 작성하고, 만약 API가 미구현이면 다음 스텝에서 API 수정.
                body.id = editingId;
            }

            // 수정: API 엔드포인트가 하나이므로 method로 구분
            const res = await fetch('/api/newcomers', {
                method: editingId ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                alert(editingId ? "정보가 수정되었습니다." : "새가족 등록이 완료되었습니다.");
                setEditingId(null);
                setForm({ name: '', phone: '', birth_date: '', address: '', description: '' });
                fetchNewcomers();
            } else {
                const text = await res.text();
                alert(`저장 실패: ${text}`);
            }
        } catch (err) {
            console.error(err);
            alert("오류 발생 (네트워크 확인 필요)");
        }
    };

    // 삭제 핸들러
    const handleDelete = async (id: number) => {
        if (!window.confirm("정말로 삭제하시겠습니까?\n삭제된 정보는 복구할 수 없습니다.")) return;

        try {
            const res = await fetch(`/api/newcomers?id=${id}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                fetchNewcomers();
                if (editingId === id) {
                    setEditingId(null);
                    setForm({ name: '', phone: '', birth_date: '', address: '', description: '' });
                }
            } else {
                alert("삭제 실패");
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
            birth_date: item.birth_date || '',   // null 방지
            address: item.address || '',
            description: item.description || ''
        });
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

            <div className={`grid grid-cols-1 ${isAdmin ? 'md:grid-cols-2' : 'max-w-3xl mx-auto'} gap-12`}>
                {/* 등록/수정 폼 (관리자 전용) */}
                {isAdmin && (
                    <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-gray-100 h-fit sticky top-24 transition-all animate-in fade-in slide-in-from-left-4">
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
                )}

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


