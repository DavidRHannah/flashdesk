import React, { useState } from 'react';
import { Stage, Layer, Group, Rect, Text } from 'react-konva';
import { useFlashcardStore } from '../store/useFlashcardStore.ts';
import { db } from '../db.ts';
import { v4 as uuidv4 } from 'uuid';

export function CanvasWorkspace() {
  const flashcards = useFlashcardStore(s => s.flashcards);
  const updateFlashcard = useFlashcardStore(s => s.updateFlashcard);
  const setFlashcards = useFlashcardStore(s => s.setFlashcards);
  const activeDeckIds = useFlashcardStore(s => s.activeDeckIds);
  const activeTag = useFlashcardStore(s => s.activeTag);

  const [stageRef, setStageRef] = useState<any>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFront, setEditFront] = useState<string>('');
  const [editBack, setEditBack] = useState<string>('');
  const [editColor, setEditColor] = useState<string>('');
  const [editTags, setEditTags] = useState<string>('');
  const [snapEnabled, setSnapEnabled] = useState<boolean>(false);

  const filteredCards = flashcards.filter(card => {
    if (activeTag) {
      return (card.tags || '').split(',').map(t => t.trim()).includes(activeTag);
    }
    if (activeDeckIds.length > 0) {
      return activeDeckIds.includes(card.deckId);
    }
    return true;
  });

  const snapToGrid = (x: number, y: number) => {
    const gridSize = 180;
    return {
      x: Math.max(300, Math.round(x / gridSize) * gridSize),
      y: Math.max(60, Math.round(y / gridSize) * gridSize),
    };
  };

  const handleDragEnd = async (e: any, id: string) => {
    const x = Math.max(300, e.target.x());
    const y = Math.max(60, e.target.y());
    const pos = snapEnabled ? snapToGrid(x, y) : { x, y };
    updateFlashcard({ id, ...pos });
    await db.flashcards.update(id, pos);
  };

  const handleContextMenu = async (e: any) => {
    e.evt.preventDefault();
    const stage = stageRef;
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const { x, y } = snapToGrid(pointer.x, pointer.y);
    const newCard = {
      id: uuidv4(),
      deckId: '',
      front: 'New Card',
      back: '',
      x,
      y,
      color: '#e0f2fe',
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

  const recenterCards = async () => {
    const updated = flashcards.map((card, i) => {
      const x = 300 + (i % 5) * 180;
      const y = 60 + Math.floor(i / 5) * 120;
      return { ...card, x, y };
    });
    setFlashcards(updated);
    for (const card of updated) {
      await db.flashcards.update(card.id, { x: card.x, y: card.y });
    }
  };

  return (
    <div className="flex-1 bg-gradient-to-br from-sky-50 to-white relative">
      <div className="absolute top-4 right-4 z-20 space-x-2">
        <button
          onClick={recenterCards}
          className="bg-gray-800 text-white text-sm px-3 py-1 rounded shadow"
        >
          Recenter Cards
        </button>
        <label className="inline-flex items-center text-sm text-gray-700">
          <input
            type="checkbox"
            checked={snapEnabled}
            onChange={(e) => setSnapEnabled(e.target.checked)}
            className="mr-2"
          />
          Snap to Grid
        </label>
      </div>

      <Stage
        width={window.innerWidth}
        height={window.innerHeight}
        onContextMenu={handleContextMenu}
        ref={node => setStageRef(node)}
      >
        <Layer>
          {filteredCards.map(card => (
            <Group
              key={card.id}
              x={card.x}
              y={card.y}
              draggable
              onDragEnd={(e) => handleDragEnd(e, card.id)}
              onDblClick={() => handleDoubleClick(card)}
              dragBoundFunc={(pos) => snapEnabled ? snapToGrid(pos.x, pos.y) : { x: Math.max(300, pos.x), y: Math.max(60, pos.y) }}
            >
              <Rect
                width={160}
                height={80}
                fill={card.color || '#e5e7eb'}
                cornerRadius={12}
                shadowBlur={6}
              />
              <Text
                text={card.front}
                fontSize={14}
                padding={8}
                width={160}
                height={60}
                verticalAlign="middle"
              />
              {card.tags && (
                <Text
                  text={card.tags}
                  fontSize={10}
                  fill="#6b7280"
                  y={66}
                  x={8}
                  width={144}
                />
              )}
            </Group>
          ))}
        </Layer>
      </Stage>

      {editingId && (
        <form
          onSubmit={handleEditSubmit}
          className="absolute left-1/2 top-4 -translate-x-1/2 bg-white border p-4 rounded-xl shadow-xl z-10 space-y-3 w-96"
        >
          <h3 className="text-lg font-semibold text-gray-700">Edit Flashcard</h3>
          <div>
            <label className="block text-sm mb-1">Front</label>
            <input
              className="border px-3 py-2 w-full rounded-md"
              value={editFront}
              onChange={(e) => setEditFront(e.target.value)}
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Back</label>
            <input
              className="border px-3 py-2 w-full rounded-md"
              value={editBack}
              onChange={(e) => setEditBack(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Color</label>
            <input
              className="w-full"
              type="color"
              value={editColor}
              onChange={(e) => setEditColor(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Tags (comma-separated)</label>
            <input
              className="border px-3 py-2 w-full rounded-md"
              value={editTags}
              onChange={(e) => setEditTags(e.target.value)}
            />
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md">
              Save
            </button>
            <button type="button" onClick={handleDelete} className="bg-red-500 text-white px-4 py-2 rounded-md">
              Delete
            </button>
          </div>
        </form>
      )}
    </div>
  );
}