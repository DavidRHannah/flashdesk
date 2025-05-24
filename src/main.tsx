import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { db } from './db.ts';
import { useFlashcardStore } from './store/useFlashcardStore.ts';

const Init = () => {
  const setEnvironments = useFlashcardStore(s => s.setEnvironments);
  const setDecks = useFlashcardStore(s => s.setDecks);
  const setFlashcards = useFlashcardStore(s => s.setFlashcards);

  useEffect(() => {
    const load = async () => {
      setEnvironments(await db.environments.toArray());
      setDecks(await db.decks.toArray());
      setFlashcards(await db.flashcards.toArray());
    };
    load();
  }, []);

  return <App />;
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Init />
  </React.StrictMode>
);