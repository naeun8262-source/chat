import { useState } from 'react';
import Sidebar from './components/Sidebar';
import MainChat from './components/MainChat';


function App() {
  const [isChatStarted, setIsChatStarted] = useState(false);

  return (
    <div className="app-container">
      <Sidebar isChatStarted={isChatStarted} />
      <MainChat isChatStarted={isChatStarted} onStartChat={() => setIsChatStarted(true)} />
    </div>
  );
}

export default App;
