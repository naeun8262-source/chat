'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import MainChat from '@/components/MainChat';

export default function Home() {
  const [isChatStarted, setIsChatStarted] = useState(false);

  return (
    <div className="app-container">
      <Sidebar isChatStarted={isChatStarted} />
      <MainChat 
        isChatStarted={isChatStarted} 
        onStartChat={() => setIsChatStarted(true)} 
      />
    </div>
  );
}
