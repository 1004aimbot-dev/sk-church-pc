
import React, { useState, useContext, useEffect } from 'react';
import { AdminContext } from '../App';

interface Post {
  id: number;
  author: string;
  date: string;
  content: string;
  likes: number;
  comments: number;
}

const GraceSharing: React.FC = () => {
  const { isAdmin } = useContext(AdminContext);
  const MAX_LENGTH = 1000;
  const storedName = localStorage.getItem('sgch_user_name') || '';
  const storedTitle = localStorage.getItem('sgch_user_title') || '성도';

  // 사용자가 '아멘'을 누른 게시글 ID 목록 (로컬 사용자 구분용)
  const [userLikedIds, setUserLikedIds] = useState<number[]>(() => {
    const saved = localStorage.getItem('sgch_user_liked_ids');
    return saved ? JSON.parse(saved) : [];
  });

  const [posts, setPosts] = useState<Post[]>([]); // 초기값 빈 배열 Or 로딩 표시

  // 게시글 목록 불러오기
  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/posts');
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      }
    } catch (err) {
      console.error("Failed to fetch posts:", err);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    localStorage.setItem('sgch_user_liked_ids', JSON.stringify(userLikedIds));
  }, [userLikedIds]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showToast, setShowToast] = useState<{ show: boolean, message: string }>({ show: false, message: '' });

  // 임시 저장된 글 불러오기
  const [newPostContent, setNewPostContent] = useState(() => {
    return localStorage.getItem('sgch_grace_draft') || '';
  });

  const [authorName, setAuthorName] = useState(storedName);
  const [authorTitle, setAuthorTitle] = useState(storedTitle);
  const [activeMoreMenu, setActiveMoreMenu] = useState<number | null>(null);

  // 내용 변경 시 자동 임시 저장
  useEffect(() => {
    localStorage.setItem('sgch_grace_draft', newPostContent);
  }, [newPostContent]);

  const triggerToast = (message: string) => {
    setShowToast({ show: true, message });
    setTimeout(() => setShowToast({ show: false, message: '' }), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    const now = new Date();
    const dateStr = `${now.getFullYear()}년 ${now.getMonth() + 1}월 ${now.getDate()}일 • ${now.getHours() >= 12 ? '오후' : '오전'} ${String(now.getHours() % 12 || 12).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    try {
      await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authorName: authorName || '익명의 성도',
          authorTitle,
          content: newPostContent,
          dateStr
        })
      });

      await fetchPosts(); // 목록 갱신
      setNewPostContent('');
      localStorage.removeItem('sgch_grace_draft');
      setIsModalOpen(false);
      triggerToast('아멘! 은혜가 성공적으로 나뉘었습니다.');
    } catch (err) {
      console.error(err);
      triggerToast('등록 실패');
    }
  };

  const handleLike = async (id: number) => {
    if (userLikedIds.includes(id)) {
      triggerToast('이미 아멘으로 응답하신 글입니다.');
      return;
    }

    // UI 즉시 반영 (낙관적 업데이트)
    setPosts(prev => prev.map(post =>
      post.id === id ? { ...post, likes: post.likes + 1 } : post
    ));
    setUserLikedIds(prev => [...prev, id]);

    try {
      await fetch('/api/posts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, type: 'like' })
      });
      triggerToast('아멘! 은혜를 함께 나눕니다.');
    } catch (err) {
      console.error(err);
      // 실패 시 롤백 로직이 필요하지만 간단하게 처리
    }
  };

  const adminDeletePost = async (id: number) => {
    if (confirm('관리자 권한으로 이 게시글을 삭제하시겠습니까?')) {
      try {
        await fetch(`/api/posts?id=${id}`, { method: 'DELETE' });
        setPosts(posts.filter(p => p.id !== id));
        triggerToast('게시글이 삭제되었습니다.');
        setActiveMoreMenu(null);
      } catch (err) {
        console.error(err);
        triggerToast('삭제 실패');
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 flex flex-col lg:flex-row gap-8 relative">
      {showToast.show && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[150] bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
          <span className="material-symbols-outlined">info</span>
          {showToast.message}
        </div>
      )}

      {/* Write Post Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl p-8 border border-gray-100 animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-black mb-6 flex justify-between items-center">
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600">edit_note</span>
                은혜 나누기
              </span>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-300 hover:text-slate-600 transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <input
                  value={authorName}
                  onChange={e => {
                    const val = e.target.value;
                    setAuthorName(val);
                    localStorage.setItem('sgch_user_name', val);
                  }}
                  placeholder="성함"
                  className="w-full bg-gray-50 p-4 rounded-2xl border-none outline-none focus:ring-2 focus:ring-blue-100 font-bold"
                  required
                />
                <select
                  value={authorTitle}
                  onChange={e => {
                    const val = e.target.value;
                    setAuthorTitle(val);
                    localStorage.setItem('sgch_user_title', val);
                  }}
                  className="w-full bg-gray-50 p-4 rounded-2xl border-none outline-none focus:ring-2 focus:ring-blue-100 font-bold text-slate-600"
                >
                  {['성도', '집사', '안수집사', '권사', '장로', '목사', '전도사', '청년'].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div className="relative">
                <textarea
                  value={newPostContent}
                  onChange={e => setNewPostContent(e.target.value.slice(0, MAX_LENGTH))}
                  placeholder="오늘 주신 주님의 은혜를 따뜻하게 적어주세요..."
                  className="w-full bg-gray-50 p-5 rounded-[2rem] min-h-[200px] outline-none border-none focus:ring-2 focus:ring-blue-100 leading-relaxed transition-all"
                  required
                />
                <div className={`absolute bottom-6 right-8 text-[11px] font-bold transition-colors ${newPostContent.length >= MAX_LENGTH ? 'text-red-500' : 'text-slate-300'}`}>
                  {newPostContent.length.toLocaleString()} / {MAX_LENGTH.toLocaleString()}
                </div>
              </div>

              <div className="flex flex-col gap-2 px-2">
                <p className="text-[10px] text-slate-400 font-medium">
                  * 작성 중인 내용은 자동으로 임시 저장됩니다.
                </p>
                <button type="submit" className="w-full bg-blue-600 text-white font-bold py-5 rounded-[1.5rem] shadow-xl shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all mt-2">
                  등록하기 (아멘)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex-1 space-y-8">
        {/* Top Call-to-Action Card */}
        <div className="bg-white rounded-[2.5rem] p-12 text-center shadow-xl border border-gray-100 flex flex-col items-center gap-6 group relative overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-20 group-hover:scale-105 transition-transform duration-1000"
            style={{ backgroundImage: 'url("https://raw.githubusercontent.com/1004aimbot-dev/images/main/8.png")' }}
          ></div>
          <div
            className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-soft-light group-hover:scale-110 transition-transform duration-[2000ms]"
            style={{ backgroundImage: 'url("https://raw.githubusercontent.com/1004aimbot-dev/images/main/14.png")' }}
          ></div>
          <div
            className="absolute inset-0 bg-cover bg-center opacity-30 group-hover:scale-105 transition-transform duration-[3000ms]"
            style={{ backgroundImage: 'url("https://raw.githubusercontent.com/1004aimbot-dev/images/main/18.jpg")' }}
          ></div>
          <div className="absolute inset-0 bg-white/60"></div>

          <div className="relative z-10 flex flex-col items-center gap-6">
            <div className="size-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shadow-inner mb-2">
              <span className="material-symbols-outlined text-4xl">favorite</span>
            </div>
            <h2 className="font-myeongjo text-3xl md:text-4xl font-black text-slate-900 drop-shadow-sm">
              오늘 받은 은혜를 나누어보세요
            </h2>
            <p className="text-slate-500 font-medium max-w-md leading-relaxed">
              작은 나눔이 누군가에게는 큰 힘이 됩니다. <br />
              성남신광교회 성도님들과 주님의 은혜를 함께 나누세요.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 text-white font-bold py-4 px-12 rounded-full shadow-2xl shadow-blue-200 hover:scale-110 active:scale-95 transition-all mt-2 flex items-center gap-2"
            >
              <span className="material-symbols-outlined">edit_note</span>
              은혜 글쓰기
            </button>
          </div>
        </div>

        {/* Posts Feed */}
        <div className="space-y-6 pb-20">
          {posts.map((post) => {
            const isLiked = userLikedIds.includes(post.id);
            return (
              <div key={post.id} className={`bg-white rounded-[2.5rem] p-8 md:p-10 border shadow-sm space-y-6 relative transition-all animate-in fade-in slide-in-from-bottom-4 ${isAdmin ? 'border-red-100 bg-red-50/5' : 'border-gray-50'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="size-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-100">
                      {post.author.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 text-lg">{post.author}</h4>
                      <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">{post.date}</p>
                    </div>
                  </div>
                  <div className="relative">
                    <button
                      onClick={() => setActiveMoreMenu(activeMoreMenu === post.id ? null : post.id)}
                      className="size-10 rounded-full flex items-center justify-center text-slate-300 hover:bg-gray-100 transition-colors"
                    >
                      <span className="material-symbols-outlined">more_horiz</span>
                    </button>

                    {activeMoreMenu === post.id && (
                      <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 z-50 animate-in fade-in zoom-in duration-200">
                        {isAdmin && (
                          <button onClick={() => adminDeletePost(post.id)} className="w-full flex items-center gap-3 px-4 py-3 bg-red-50 text-red-600 rounded-xl font-bold text-sm hover:bg-red-100 transition-colors">
                            <span className="material-symbols-outlined text-sm">delete_forever</span> 관리자 삭제
                          </button>
                        )}
                        <button onClick={() => { setActiveMoreMenu(null); triggerToast('신고가 접수되었습니다.'); }} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-xl text-slate-700 text-sm font-bold mt-1">
                          <span className="material-symbols-outlined text-sm">report</span> 신고하기
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50/50 p-6 md:p-8 rounded-[2rem] border border-gray-50/50">
                  <p className="text-slate-700 leading-loose text-base md:text-[17px] font-medium whitespace-pre-wrap">{post.content}</p>
                </div>

                <div className="pt-2 flex items-center justify-between px-2">
                  <button
                    onClick={() => handleLike(post.id)}
                    className={`flex items-center gap-2.5 font-black group px-4 py-2 rounded-full transition-all ${isLiked ? 'text-blue-600 bg-blue-50' : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50'}`}
                  >
                    <span className={`material-symbols-outlined text-[22px] transition-transform group-hover:scale-125 ${isLiked ? 'fill-1' : ''}`} style={{ fontVariationSettings: `'FILL' ${isLiked ? 1 : 0}, 'wght' 600, 'GRAD' 0, 'opsz' 24` }}>favorite</span>
                    <span className="text-sm">아멘 {post.likes}</span>
                  </button>

                  <div className="flex items-center gap-4 text-slate-300">
                    <span className="material-symbols-outlined text-[18px] cursor-pointer hover:text-blue-400">share</span>
                    <span className="material-symbols-outlined text-[18px] cursor-pointer hover:text-blue-400">bookmark</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default GraceSharing;
