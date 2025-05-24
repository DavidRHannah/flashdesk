import React from 'react';
import { CanvasWorkspace } from './components/CanvasWorkspace';
import { SidePanel } from './components/SidePanel.tsx';

export default function App() {
  return (
    <div className="flex h-screen w-screen">
      <SidePanel />
      <CanvasWorkspace />
    </div>
  );
}