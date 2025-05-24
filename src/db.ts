import Dexie, { type Table } from 'dexie';

export interface Environment {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
}

export interface Deck {
  id: string;
  name: string;
  environmentId: string;
  createdAt: number;
  updatedAt: number;
}

export interface Flashcard {
  id: string;
  deckId: string;
  front: string;
  back: string;
  x: number;
  y: number;
  color?: string;
  createdAt: number;
  updatedAt: number;
  tags: string;
}

export class FlashcardDB extends Dexie {
  environments!: Table<Environment, string>;
  decks!: Table<Deck, string>;
  flashcards!: Table<Flashcard, string>;

  constructor() {
    super('FlashcardDB');
    this.version(1).stores({
      environments: 'id',
      decks: 'id, environmentId',
      flashcards: 'id, deckId',
    });
  }
}

export const db = new FlashcardDB();
