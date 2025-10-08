
import { useState, useEffect } from "react";
import { arrayMove } from "@dnd-kit/sortable";

export type Priority = "low" | "medium" | "high";

export interface SubTask {
  id: string;
  title: string;
  done: boolean;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface Card {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  column: "todo" | "doing" | "done";
  createdAt: number;
  subTasks?: SubTask[];
  tags?: Tag[];
}

export interface BoardData {
  id: string;
  name: string;
  cards: Card[];
}

const STORAGE_KEY = "boardData";

export function useBoard() {
  const [boards, setBoards] = useState<BoardData[]>([]);
  const [activeBoardId, setActiveBoardId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      try {
        const parsedData = JSON.parse(data);
        if (Array.isArray(parsedData) && parsedData.length > 0) {
          setBoards(parsedData);
          setActiveBoardId(parsedData[0].id);
        } else {
          // Se não houver dados ou o formato for inválido, crie um board padrão
          const defaultBoard: BoardData = {
            id: crypto.randomUUID(),
            name: "Meu Primeiro Board",
            cards: [],
          };
          setBoards([defaultBoard]);
          setActiveBoardId(defaultBoard.id);
        }
      } catch (e) {
        console.error("Erro ao parsear boards do localStorage", e);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || boards.length === 0) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(boards));
  }, [boards]);

  const activeBoard = boards.find((b) => b.id === activeBoardId);

  const addBoard = (name: string) => {
    const newBoard: BoardData = {
      id: crypto.randomUUID(),
      name,
      cards: [],
    };
    setBoards((prev) => [...prev, newBoard]);
    setActiveBoardId(newBoard.id);
  };

  const selectBoard = (id: string) => {
    setActiveBoardId(id);
  };

  const addCard = (
    title: string,
    priority: Priority,
    description?: string,
    subTasks: SubTask[] = [],
    tags: Tag[] = []
  ) => {
    if (!activeBoardId) return;
    const newCard: Card = {
      id: crypto.randomUUID(),
      title,
      description,
      priority,
      column: "todo",
      createdAt: Date.now(),
      subTasks,
      tags,
    };
    setBoards((prev) =>
      prev.map((b) =>
        b.id === activeBoardId ? { ...b, cards: [...b.cards, newCard] } : b
      )
    );
  };

  const editCard = (id: string, updates: Partial<Card>) => {
    if (!activeBoardId) return;
    setBoards((prev) =>
      prev.map((b) =>
        b.id === activeBoardId
          ? {
              ...b,
              cards: b.cards.map((c) => (c.id === id ? { ...c, ...updates } : c)),
            }
          : b
      )
    );
  };

  const removeCard = (id: string) => {
    if (!activeBoardId) return;
    setBoards((prev) =>
      prev.map((b) =>
        b.id === activeBoardId
          ? { ...b, cards: b.cards.filter((c) => c.id !== id) }
          : b
      )
    );
  };

  const moveCard = (id: string, column: "todo" | "doing" | "done") => {
    if (!activeBoardId) return;
    setBoards((prev) =>
      prev.map((b) =>
        b.id === activeBoardId
          ? {
              ...b,
              cards: b.cards.map((c) => (c.id === id ? { ...c, column } : c)),
            }
          : b
      )
    );
  };

  const toggleSubTask = (cardId: string, subTaskId: string) => {
    if (!activeBoardId) return;
    setBoards((prev) =>
      prev.map((b) => {
        if (b.id !== activeBoardId) return b;
        const updatedCards = b.cards.map((card) => {
          if (card.id !== cardId) return card;
          const updatedSubTasks = card.subTasks?.map((st) =>
            st.id === subTaskId ? { ...st, done: !st.done } : st
          );
          return { ...card, subTasks: updatedSubTasks };
        });
        return { ...b, cards: updatedCards };
      })
    );
  };

  const moveCardToOrder = (activeId: string, overId: string) => {
    if (!activeBoardId) return;
    setBoards((prev) =>
      prev.map((b) => {
        if (b.id !== activeBoardId) return b;
        const activeIndex = b.cards.findIndex((c) => c.id === activeId);
        const overIndex = b.cards.findIndex((c) => c.id === overId);
        if (activeIndex === -1 || overIndex === -1) return b;
        return {
          ...b,
          cards: arrayMove(b.cards, activeIndex, overIndex),
        };
      })
    );
  };

  const editBoard = (id: string, newName: string) => {
    setBoards((prev) =>
      prev.map((b) => (b.id === id ? { ...b, name: newName } : b))
    );
  };

  const deleteBoard = (id: string) => {
    setBoards((prevBoards) => {
      if (!prevBoards) return []; // segurança extra, mas prevBoards nunca deve ser null
      return prevBoards.filter((b) => b.id !== id);
    });

    setActiveBoardId((prevId) => {
      // se o board ativo foi deletado, define o primeiro board existente como ativo
      if (prevId === id) {
        return boards.length > 0 ? boards[0].id : null;
      }
      return prevId;
    });
  };


  return {
    boards,
    activeBoard,
    activeBoardId,
    addBoard,
    selectBoard,
    editBoard,
    deleteBoard,
    board: activeBoard?.cards ?? [],
    addCard,
    editCard,
    removeCard,
    moveCard,
    toggleSubTask,
    moveCardToOrder,
  };
}

