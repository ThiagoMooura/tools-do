import { useState, useEffect } from "react";
import { arrayMove } from "@dnd-kit/sortable"; // Importe esta função auxiliar!

export type Priority = "low" | "medium" | "high";

export interface SubTask {
  id: string;
  title: string;
  done: boolean;
}

export interface Card {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  column: "todo" | "doing" | "done";
  createdAt: number;
  subTasks?: SubTask[];
}

const STORAGE_KEY = "boardData";

export function useBoard() {
  const [board, setBoard] = useState<Card[]>([]);

  // Carregar do localStorage ao iniciar
  useEffect(() => {
    if (typeof window === "undefined") return;
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      try {
        setBoard(JSON.parse(data));
      } catch (e) {
        console.error("Erro ao parsear board do localStorage", e);
      }
    }
  }, []);

  // Salvar no localStorage sempre que board mudar
  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(board));
  }, [board]);

  const addCard = (
    title: string,
    priority: Priority,
    description?: string,
    subTasks: SubTask[] = []
  ) => {
    const newCard: Card = {
      id: crypto.randomUUID(),
      title,
      description,
      priority,
      column: "todo",
      createdAt: Date.now(),
      subTasks,
    };
    setBoard((prev) => [...prev, newCard]);
  };

  const editCard = (id: string, updates: Partial<Card>) => {
    setBoard((prev) =>
      prev.map((card) => (card.id === id ? { ...card, ...updates } : card))
    );
  };

  const removeCard = (id: string) => {
    setBoard((prev) => prev.filter((card) => card.id !== id));
  };

  const moveCard = (id: string, column: "todo" | "doing" | "done") => {
    setBoard((prev) =>
      prev.map((card) => (card.id === id ? { ...card, column } : card))
    );
  };

  const toggleSubTask = (cardId: string, subTaskId: string) => {
    setBoard((prev) =>
      prev.map((card) => {
        if (card.id !== cardId) return card;
        const updatedSubTasks = card.subTasks?.map((st) =>
          st.id === subTaskId ? { ...st, done: !st.done } : st
        );
        return { ...card, subTasks: updatedSubTasks };
      })
    );
  };

  const moveCardToOrder = (activeId: string, overId: string) => {
    setBoard((currentBoard) => {
      const activeIndex = currentBoard.findIndex((c) => c.id === activeId);
      const overIndex = currentBoard.findIndex((c) => c.id === overId);

      // Se não encontrar os cards ou se estiverem em colunas diferentes, não faz nada.
      // A verificação de colunas diferentes é uma segurança extra.
      if (activeIndex === -1 || overIndex === -1 || currentBoard[activeIndex].column !== currentBoard[overIndex].column) {
        return currentBoard;
      }

      // Reorganiza o array usando a função arrayMove da dnd-kit
      return arrayMove(currentBoard, activeIndex, overIndex);
    });
  };

  return { board, addCard, editCard, removeCard, moveCard, toggleSubTask, moveCardToOrder };
}
