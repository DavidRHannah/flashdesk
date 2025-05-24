import { create } from 'zustand';
import { type Flashcard, type Environment, type Deck } from '../db.ts';

interface FlashcardState {
  environments: Environment[];
  decks: Deck[];
  flashcards: Flashcard[];
  activeEnvironmentIds: string[];
  activeDeckIds: string[];

  setEnvironments: (envs: Environment[]) => void;
  setDecks: (decks: Deck[]) => void;
  setFlashcards: (cards: Flashcard[]) => void;
  updateFlashcard: (card: Partial<Flashcard> & { id: string }) => void;
  setPerspective: (envIds: string[], deckIds: string[]) => void;
}

export const useFlashcardStore = create<FlashcardState>((set, get) => ({
  environments: [],
  decks: [],
  flashcards: [],
  activeEnvironmentIds: [],
  activeDeckIds: [],

  setEnvironments: (envs) => set({ environments: envs }),
  setDecks: (decks) => set({ decks }),
  setFlashcards: (cards) => set({ flashcards: cards }),

  updateFlashcard: (updatedCard) => {
    set((state) => ({
      flashcards: state.flashcards.map(card =>
        card.id === updatedCard.id ? { ...card, ...updatedCard } : card
      ),
    }));
  },

  setPerspective: (envIds, deckIds) => {
    set({ activeEnvironmentIds: envIds, activeDeckIds: deckIds });
  },
}));
