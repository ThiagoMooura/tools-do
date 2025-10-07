"use client"
import React, { createContext, useContext, ReactNode } from 'react';
import { useBoard, BoardData, Card, Priority, SubTask } from '@/hooks/useBoard';

interface BoardContextType {
  boards: BoardData[];
  activeBoard: BoardData | undefined;
  activeBoardId: string | null;
  addBoard: (name: string) => void;
  selectBoard: (id: string) => void;
  board: Card[];
  addCard: (title: string, priority: Priority, description?: string, subTasks?: SubTask[]) => void;
  editCard: (id: string, updates: Partial<Card>) => void;
  removeCard: (id: string) => void;
  moveCard: (id: string, column: "todo" | "doing" | "done") => void;
  moveCardToOrder: (activeId: string, overId: string) => void;
  toggleSubTask: (cardId: string, subTaskId: string) => void;
}

const BoardContext = createContext<BoardContextType | undefined>(undefined);

export const BoardProvider = ({ children }: { children: ReactNode }) => {
  const { boards, activeBoard, activeBoardId, addBoard, selectBoard, board, addCard, editCard, removeCard, moveCard, moveCardToOrder, toggleSubTask } = useBoard();

  return (
    <BoardContext.Provider value={{ boards, activeBoard, activeBoardId, addBoard, selectBoard, board, addCard, editCard, removeCard, moveCard, moveCardToOrder, toggleSubTask }}>
      {children}
    </BoardContext.Provider>
  );
};

export const useBoardContext = () => {
  const context = useContext(BoardContext);
  if (context === undefined) {
    throw new Error('useBoardContext must be used within a BoardProvider');
  }
  return context;
};

