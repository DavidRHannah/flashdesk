import React, { useState } from 'react';
import { Stage, Layer, Text } from 'react-konva';
import { useFlashcardStore } from '../store/useFlashcardStore.ts';
import { db } from '../db.ts';
import { v4 as uuidv4 } from 'uuid';

export function CanvasWorkspace() {
  const flashcards = useFlashcardStore(s => s.flashcards);
  const updateFlashcard = useFlashcardStore(s => s.updateFlashcard);
  const setFlashcards = useFlashcardStore(s => s.setFlashcards);

  const [stageRef, setStageRef] = useState<any>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFront, setEditFront] = useState<string>('');
  const [editBack, setEditBack] = useState<string>('');
  const [editColor, setEditColor] = useState<string>('');
  const [editTags, setEditTags] = useState<string>('');

  const handleDragEnd = async (e: any, id: string) => {
    const newX = e.target.x();
    const newY = e.target.y();
    updateFlashcard({ id, x: newX, y: newY });
    await db.flashcards.update(id, { x: newX, y: newY });
  };

  const handleContextMenu = async (e: any) => {
    e.evt.preventDefault();
    const stage = stageRef;
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const newCard = {
      id: uuidv4(),
      deckId: '',
      front: 'New Card',
      back: '',
      x: pointer.x,
      y: pointer.y,
      color: '#000000',
      tags: '',
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    await db.flashcards.add(newCard);
    setFlashcards([...flashcards, newCard]);
  };

  const handleDoubleClick = (card: any) => {
    setEditingId(card.id);
    setEditFront(card.front);
    setEditBack(card.back);
    setEditColor(card.color || '');
    setEditTags(card.tags || '');
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    updateFlashcard({ id: editingId, front: editFront, back: editBack, color: editColor, tags: editTags });
    await db.flashcards.update(editingId, {
      front: editFront,
      back: editBack,
      color: editColor,
      tags: editTags,
      updatedAt: Date.now()
    });
    setEditingId(null);
  };

  const handleDelete = async () => {
    if (!editingId) return;
    await db.flashcards.delete(editingId);
    setFlashcards(flashcards.filter(f => f.id !== editingId));
    setEditingId(null);
  };

  return (
    <div className="flex-1 bg-white relative">
      <Stage
        width={window.innerWidth}
        height={window.innerHeight}
        onContextMenu={handleContextMenu}
        ref={node => setStageRef(node)}
      >
        <Layer>
          {flashcards.map(card => (
            <Text
              key={card.id}
              text={card.front}
              x={card.x}
              y={card.y}
              fontSize={16}
              fill={card.color || 'black'}
              draggable
              onDragEnd={(e) => handleDragEnd(e, card.id)}
              onDblClick={() => handleDoubleClick(card)}
            />
          ))}
        </Layer>
      </Stage>

      {editingId && (
        <form
          onSubmit={handleEditSubmit}
          className="absolute left-1/2 top-4 -translate-x-1/2 bg-white border p-4 shadow z-10 space-y-2"
        >
          <div>
            <label className="block text-sm">Front</label>
            <input
              className="border px-2 py-1 w-full"
              value={editFront}
              onChange={(e) => setEditFront(e.target.value)}
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm">Back</label>
            <input
              className="border px-2 py-1 w-full"
              value={editBack}
              onChange={(e) => setEditBack(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm">Color</label>
            <input
              className="border px-2 py-1 w-full"
              type="color"
              value={editColor}
              onChange={(e) => setEditColor(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm">Tags (comma-separated)</label>
            <input
              className="border px-2 py-1 w-full"
              value={editTags}
              onChange={(e) => setEditTags(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-blue-500 text-white px-3 py-1 rounded">
              Save
            </button>
            <button type="button" onClick={handleDelete} className="bg-red-500 text-white px-3 py-1 rounded">
              Delete
            </button>
          </div>
        </form>
      )}
    </div>
  );
}