'use client';

import { useState } from 'react';
import { Sprout, Gauge, Monitor, ActivitySquare, ImagePlus, Video, Send, StopCircle, User } from 'lucide-react';
import './MainChat.css';

interface Message {
  role: 'ai' | 'user';
  text: string;
}

interface MainChatProps {
  isChatStarted: boolean;
  onStartChat: () => void;
}

export default function MainChat({ isChatStarted, onStartChat }: MainChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', text: '오늘의 작업 자세를 분석해 드릴까요? VDT 지침에 따른 최적의 환경을 찾아드립니다.' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!inputValue.trim()) return;
    
    if (!isChatStarted) onStartChat();

    const userMsg = inputValue;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInputValue('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg }),
      });
      const data = await res.json();
      
      setMessages(prev => [...prev, { role: 'ai', text: data.answer }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', text: '죄송합니다. 오류가 발생했습니다.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="main-chat">
      {isChatStarted ? (
        <div className="chat-active">
          <header className="chat-header">
            <div className="header-left">
              <span className="status-dot red-dot"></span>
              <span className="status-text red-text">RULA 정밀 분석 중</span>
            </div>
            <div className="header-right">
              <div className="pill status-pill">
                <span className="status-dot green-dot"></span>
                연결됨
              </div>
              <div className="pill action-pill text-primary">
                <Video size={16} /> Live Camera
              </div>
              <div className="pill action-pill text-danger">
                <StopCircle size={16} /> Emergency Stop
              </div>
              <img src="https://i.pravatar.cc/150?img=11" alt="User" className="user-avatar-small" />
            </div>
          </header>

          <div className="chat-messages">
            <div className="timestamp-badge">오늘, 오후 2:30</div>

            {messages.map((msg, i) => (
              <div key={i} className={`message ${msg.role === 'user' ? 'user-message' : 'ai-message'}`}>
                {msg.role === 'ai' && (
                  <div className="message-avatar">
                    <span>🤖</span>
                  </div>
                )}
                <div className="message-content">
                  <div className={`bubble ${msg.role === 'ai' ? 'ai-bubble' : 'user-bubble'}`}>
                    {msg.text}
                  </div>
                  {msg.role === 'ai' && i === 0 && (
                    <div className="suggestion-pills">
                      <span className="pill">현재 내 RULA 점수는?</span>
                      <span className="pill">모니터 높이는 적절한가요?</span>
                      <span className="pill">어깨 통증을 줄이는 자세는?</span>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="message ai-message">
                <div className="message-avatar"><span>🤖</span></div>
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span><span></span><span></span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="chat-input-container active-input-container">
            <div className="chat-input-wrapper">
              <button className="icon-btn"><ActivitySquare size={24} /></button>
              <button className="icon-btn"><ImagePlus size={24} /></button>
              <input 
                type="text" 
                placeholder="자세 분석을 위한 추가 정보나 질문을 입력하세요..." 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              />
              <button className="send-btn primary-send-btn" onClick={handleSend} disabled={isLoading}>
                전송 <Send size={16} />
              </button>
            </div>
            <p className="disclaimer">자세히봐 AI는 분석 도구일 뿐, 의학적 진단을 대체하지 않습니다.</p>
          </div>
        </div>
      ) : (
        <div className="chat-empty">
          <div className="empty-content">
            <div className="sprout-icon-container">
              <Sprout size={48} color="var(--primary)" />
            </div>
            <h2 className="empty-title">오늘의 작업 자세를<br />분석해 드릴까요?</h2>
            <p className="empty-subtitle">VDT 지침에 따른 최적의 환경을 찾아드립니다. 카메라를 연결하거나 궁금한 점을 물어보세요.</p>
            <div className="suggestion-cards">
              <div className="suggestion-card" onClick={() => { setInputValue('현재 내 RULA 점수는?'); handleSend(); }}>
                <div className="card-icon blue-icon"><Gauge size={24} /></div>
                <h3>현재 내 RULA 점수는?</h3>
                <p>빠른 평가 시작하기</p>
              </div>
              <div className="suggestion-card" onClick={() => { setInputValue('모니터 높이는 적절한가요?'); handleSend(); }}>
                <div className="card-icon lightblue-icon"><Monitor size={24} /></div>
                <h3>모니터 높이는 적절한가요?</h3>
                <p>VDT 환경 가이드</p>
              </div>
              <div className="suggestion-card" onClick={() => { setInputValue('어깨 통증을 줄이는 자세는?'); handleSend(); }}>
                <div className="card-icon red-icon"><ActivitySquare size={24} /></div>
                <h3>어깨 통증을 줄이는 자세는?</h3>
                <p>인체공학적 솔루션</p>
              </div>
            </div>
          </div>
          <div className="chat-input-container">
            <div className="chat-input-wrapper">
              <button className="icon-btn"><ImagePlus size={24} /></button>
              <button className="icon-btn"><Video size={24} /></button>
              <input 
                type="text" 
                placeholder="자세에 대해 무엇이든 물어보세요..." 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              />
              <button className="send-btn" onClick={handleSend}>
                <Send size={20} />
              </button>
            </div>
            <p className="disclaimer">자세히봐 AI는 전문적인 의학적 진단을 대체하지 않습니다.</p>
          </div>
        </div>
      )}
    </main>
  );
}
