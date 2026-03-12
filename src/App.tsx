import { useState } from 'react';
import Chat from './components/Chat';
import Settings from './components/Settings';

type Page = 'chat' | 'settings';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('chat');

  return (
    <>
      {currentPage === 'chat' && (
        <Chat onOpenSettings={() => setCurrentPage('settings')} />
      )}
      {currentPage === 'settings' && (
        <Settings onBack={() => setCurrentPage('chat')} />
      )}
    </>
  );
}

export default App;
