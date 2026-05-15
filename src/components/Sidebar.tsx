import { LayoutDashboard, History, Settings2, BookOpen, Activity, Plus, HelpCircle, Settings } from 'lucide-react';
import './Sidebar.css';

interface SidebarProps {
  isChatStarted: boolean;
}

export default function Sidebar({ isChatStarted }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1 className="logo-title">자세히봐 <span>AI</span></h1>
        <p className="logo-subtitle">Ergonomic Analysis System</p>
      </div>

      <div className="sidebar-action">
        <button className="start-btn">
          <Plus size={18} />
          <span>Start New Session</span>
        </button>
        <button 
          className="index-btn" 
          onClick={async () => {
            const res = await fetch('/api/ingest', { method: 'POST' });
            const data = await res.json();
            if (data.success) alert(`${data.count}개의 샘플 데이터 인덱싱 완료!`);
            else alert('인덱싱 실패: ' + data.error);
          }}
          style={{
            marginTop: '8px',
            width: '100%',
            backgroundColor: 'transparent',
            border: '1px solid var(--primary)',
            color: 'var(--primary)',
            borderRadius: '8px',
            padding: '12px',
            fontSize: '14px',
            fontWeight: '600'
          }}
        >
          <span>샘플 데이터 인덱싱</span>
        </button>
      </div>

      <nav className="sidebar-nav">
        <a href="#" className={`nav-item ${!isChatStarted ? 'active' : ''}`}>
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </a>
        <a href="#" className="nav-item">
          <History size={20} />
          <span>Pose History</span>
        </a>
        <a href="#" className="nav-item">
          <Settings2 size={20} />
          <span>Equipment Settings</span>
        </a>
        <a href="#" className="nav-item">
          <BookOpen size={20} />
          <span>VDT Guidelines</span>
        </a>
        <a href="#" className={`nav-item ${isChatStarted ? 'active' : ''}`}>
          <Activity size={20} />
          <span>RULA Analysis</span>
        </a>
      </nav>

      <div className="sidebar-footer">
        <div className="footer-links">
          <a href="#" className="footer-link">
            <HelpCircle size={18} />
            <span>Support</span>
          </a>
          <a href="#" className="footer-link">
            <Settings size={18} />
            <span>Settings</span>
          </a>
        </div>
        
        <div className="user-profile">
          {isChatStarted ? (
            <>
              <div className="avatar ai-avatar">
                <span style={{ fontSize: '20px' }}>🤖</span>
              </div>
              <div className="profile-info">
                <p className="profile-name">AI Assistant</p>
                <p className="profile-role">Online</p>
              </div>
            </>
          ) : (
            <>
              <img src="https://i.pravatar.cc/150?img=47" alt="Dr. Sarah" className="avatar" />
              <div className="profile-info">
                <p className="profile-name">Dr. Sarah</p>
                <p className="profile-role">Ergonomist</p>
              </div>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
