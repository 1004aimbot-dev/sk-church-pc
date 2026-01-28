
import React, { useContext } from 'react';
import { AdminContext } from '../App';

const Footer: React.FC = () => {
  const { isAdmin, setIsAdmin } = useContext(AdminContext);

  const handleAdminLink = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isAdmin) {
      if (window.confirm('관리자 모드를 종료하시겠습니까?')) {
        setIsAdmin(false);
        alert('관리자 모드가 종료되었습니다.');
      }
      return;
    }
    const password = window.prompt('관리자 비밀번호를 입력하세요:');
    if (password === '0191') {
      setIsAdmin(true);
      alert('관리자 모드가 활성화되었습니다.');
    } else if (password !== null) {
      alert('비밀번호가 틀렸습니다.');
    }
  };

  return (
    <footer className="bg-slate-900 text-slate-400 py-6 px-4 border-t border-slate-800">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start mb-4">
          <div className="space-y-2">
            <h2 className="font-myeongjo text-lg font-bold text-white mb-1">성남신광교회</h2>
            <p className="text-[11px] leading-relaxed">
              하나님을 기쁘시게, 사람을 행복하게 하는 <br />
              은혜와 진리의 공동체입니다.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-white font-bold text-[10px] uppercase tracking-widest">Contact Info</h3>
            <p className="text-[11px] leading-relaxed">
              (13385) 경기도 성남시 중원구 둔촌대로 148 (하대원동) <br />
              T. 031-752-2603 | F. 031-752-2604 <br />
              E. office@sn-shinkwang.org
            </p>
          </div>

          <div className="md:text-right space-y-3">
            <h3 className="text-white font-bold text-xs uppercase tracking-widest">Follow Us</h3>
            <div className="flex gap-2 md:justify-end">
              <a href="#" className="size-7 rounded-full bg-slate-800 flex items-center justify-center hover:bg-blue-600 text-white transition-all"><span className="material-symbols-outlined text-sm">public</span></a>
              <a href="#" className="size-7 rounded-full bg-slate-800 flex items-center justify-center hover:bg-red-600 text-white transition-all"><span className="material-symbols-outlined text-sm">videocam</span></a>
              <a href="#" className="size-7 rounded-full bg-slate-800 flex items-center justify-center hover:bg-blue-400 text-white transition-all"><span className="material-symbols-outlined text-sm">mail</span></a>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-2">
          <p className="text-[9px] uppercase tracking-widest opacity-50">
            © 2026 Seongnam Shinkwang Church. All Rights Reserved.
          </p>
          <button
            onClick={handleAdminLink}
            className={`text-[9px] font-bold transition-colors uppercase tracking-widest flex items-center gap-1 ${isAdmin ? 'text-red-500 hover:text-red-400' : 'text-slate-600 hover:text-slate-400'}`}
          >
            <span className="material-symbols-outlined text-[10px]">shield_person</span>
            {isAdmin ? 'Exit Admin' : 'Admin'}
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
