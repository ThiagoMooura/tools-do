"use client";

import { useEffect, useState } from "react";
import { saveToStorage, loadFromStorage } from "@/lib/storage";
import { generateId } from "@/lib/utils";

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
  subTasks?: SubTask[]; // nova propriedade
}

const STORAGE_KEY = "todo-board";

export function useBoard() {
  const [board, setBoard] = useState<Card[]>([]);

  useEffect(() => {
    const data = loadFromStorage<Card[]>(STORAGE_KEY, []);
    setBoard(data);
  }, []);

  useEffect(() => {
    saveToStorage(STORAGE_KEY, board);
  }, [board]);

  function addCard(title: string, priority: Priority, description?: string) {
    const newCard: Card = {
      id: generateId(),
      title,
      description,
      priority,
      column: "todo",
      createdAt: Date.now(),
    };
    setBoard((prev) => [...prev, newCard]);
  }

  function editCard(id: string, updates: Partial<Card>) {
    setBoard((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  }

  function removeCard(id: string) {
    setBoard((prev) => prev.filter((c) => c.id !== id));
  }

  function moveCard(id: string, column: "todo" | "doing" | "done") {
    setBoard((prev) => prev.map((c) => (c.id === id ? { ...c, column } : c)));
  }

  return { board, addCard, editCard, removeCard, moveCard };
}
