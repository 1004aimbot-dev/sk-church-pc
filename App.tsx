
import React, { useState, createContext, useContext, useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import WorshipInfo from './pages/WorshipInfo';
import OnlineWorship from './pages/OnlineWorship';
import GraceSharing from './pages/GraceSharing';
import Directions from './pages/Directions';
import PastorMessage from './pages/PastorMessage';
import AIGuide from './pages/AIGuide';
import Checklist from './pages/Checklist';
import NewcomerRegister from './pages/NewcomerRegister';
import Header from './components/Header';
import Footer from './components/Footer';

// 관리자 모드 컨텍스트 생성
interface AdminContextType {
  isAdmin: boolean;
  setIsAdmin: (val: boolean) => void;
}
export const AdminContext = createContext<AdminContextType>({ isAdmin: false, setIsAdmin: () => { } });

const App: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState(() => {
    return localStorage.getItem('sgch_admin_mode') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('sgch_admin_mode', isAdmin.toString());
  }, [isAdmin]);

  return (
    <AdminContext.Provider value={{ isAdmin, setIsAdmin }}>
      <Router>
        <div className="flex flex-col min-h-screen bg-gray-50 text-slate-900">
          {isAdmin && (
            <div className="bg-red-600 text-white text-[10px] font-black py-1 text-center sticky top-0 z-[60] tracking-widest animate-pulse">
              ADMINISTRATOR MODE ACTIVE - 모든 콘텐츠 수정 권한이 활성화되었습니다.
            </div>
          )}
          <Header />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/worship-info" element={<WorshipInfo />} />
              <Route path="/online-worship" element={<OnlineWorship />} />
              <Route path="/grace-sharing" element={<GraceSharing />} />
              <Route path="/directions" element={<Directions />} />
              <Route path="/pastor-message" element={<PastorMessage />} />
              <Route path="/ai-guide" element={<AIGuide />} />
              <Route path="/checklist" element={<Checklist />} />
              <Route path="/newcomers" element={<NewcomerRegister />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AdminContext.Provider>
  );
};

export default App;
