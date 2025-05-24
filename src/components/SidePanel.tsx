import React, {useState} from 'react';
import { useFlashcardStore } from '../store/useFlashcardStore.ts';
import { db } from '../db.ts';
import { v4 as uuidv4 } from 'uuid';

export function SidePanel() {
  const environments = useFlashcardStore(s => s.environments);
  const decks = useFlashcardStore(s => s.decks);
  const flashcards = useFlashcardStore(s => s.flashcards);
  const activeDeckIds = useFlashcardStore(s => s.activeDeckIds);
  const activeTag = useFlashcardStore(s => s.activeTag);
  const setPerspective = useFlashcardStore(s => s.setPerspective);
  const setActiveTag = useFlashcardStore(s => s.setActiveTag);
  const setEnvironments = useFlashcardStore(s => s.setEnvironments);
  const setDecks = useFlashcardStore(s => s.setDecks);

  const [envName, setEnvName] = useState('');
  const [deckName, setDeckName] = useState('');
  const [deckEnvId, setDeckEnvId] = useState('');

  const allTags = Array.from(new Set(flashcards.flatMap(card => (card.tags || '').split(',').map(t => t.trim()).filter(Boolean))));

  const handlePerspectiveChange = (envId: string, deckId: string) => {
    setPerspective([envId], [deckId]);
    setActiveTag(null);
  };

  const handleTagClick = (tag: string) => {
    setActiveTag(tag);
    setPerspective([], []);
  };

  const clearFilters = () => {
    setActiveTag(null);
    setPerspective([], []);
  };

  const addEnvironment = async () => {
    const newEnv = { id: uuidv4(), name: envName, createdAt: Date.now(), updatedAt: Date.now() };
    await db.environments.add(newEnv);
    setEnvironments([...environments, newEnv]);
    setEnvName('');
  };

  const addDeck = async () => {
    const newDeck = { id: uuidv4(), name: deckName, environmentId: deckEnvId, createdAt: Date.now(), updatedAt: Date.now() };
    await db.decks.add(newDeck);
    setDecks([...decks, newDeck]);
    setDeckName('');
    setDeckEnvId('');
  };

  return (
    <div className="w-72 bg-white border-r border-gray-300 p-4 space-y-6 overflow-y-auto">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Filters</h2>
        <button onClick={clearFilters} className="text-sm text-red-500 hover:underline">Clear</button>
      </div>

      <div>
        <h3 className="text-md font-medium text-gray-700 mb-1">Environments</h3>
        {environments.map(env => (
          <div key={env.id} className="mb-2">
            <h4 className="text-sm font-medium text-gray-600">{env.name}</h4>
            <ul className="ml-3 text-sm text-gray-700">
              {decks.filter(d => d.environmentId === env.id).map(deck => (
                <li
                  key={deck.id}
                  className={`cursor-pointer px-2 py-1 rounded ${activeDeckIds.includes(deck.id) ? 'bg-blue-100 text-blue-800 font-semibold' : 'hover:text-blue-600'}`}
                  onClick={() => handlePerspectiveChange(env.id, deck.id)}
                >
                  {deck.name}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div>
        <h3 className="text-md font-medium text-gray-700 mb-1">Tags</h3>
        <ul className="flex flex-wrap gap-2 text-sm">
          {allTags.map(tag => (
            <li
              key={tag}
              className={`px-2 py-1 rounded cursor-pointer ${activeTag === tag ? 'bg-blue-100 text-blue-800 font-semibold' : 'hover:text-blue-600'}`}
              onClick={() => handleTagClick(tag)}
            >
              #{tag}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="text-md font-medium text-gray-700 mb-1">Create Environment</h3>
        <input
          className="border px-2 py-1 w-full mb-2"
          placeholder="Environment Name"
          value={envName}
          onChange={(e) => setEnvName(e.target.value)}
        />
        <button onClick={addEnvironment} className="w-full bg-green-500 text-white px-2 py-1 rounded">
          Add Environment
        </button>
      </div>

      <div>
        <h3 className="text-md font-medium text-gray-700 mb-1">Create Deck</h3>
        <input
          className="border px-2 py-1 w-full mb-2"
          placeholder="Deck Name"
          value={deckName}
          onChange={(e) => setDeckName(e.target.value)}
        />
        <select
          className="border px-2 py-1 w-full mb-2"
          value={deckEnvId}
          onChange={(e) => setDeckEnvId(e.target.value)}
        >
          <option value="">Select Environment</option>
          {environments.map(env => (
            <option key={env.id} value={env.id}>{env.name}</option>
          ))}
        </select>
        <button onClick={addDeck} className="w-full bg-green-600 text-white px-2 py-1 rounded">
          Add Deck
        </button>
      </div>
    </div>
  );
}