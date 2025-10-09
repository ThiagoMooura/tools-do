
import { useState, useEffect } from "react";
import { arrayMove } from "@dnd-kit/sortable";

export type Priority = "low" | "medium" | "high";

export type Tag = {
  id: string;
  name: string;
  color: string;
};

type Board = {
  id: string;
  name: string;
};

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
  tagId?: string; // Nova propriedade para a tag
}

export interface BoardData {
  id: string;
  name: string;
  cards: Card[];
  availableTags: Tag[]; // Nova propriedade para tags disponíveis no board
}

const STORAGE_KEY = "boardData";

const DEFAULT_TAGS: Omit<Tag, 'id'>[] = [
  { name: "Estudo", color: "#EF4444" }, // red-500
  { name: "Trabalho", color: "#3B82F6" }, // blue-500
  { name: "Diversão", color: "#EC4899" }, // pink-500
  { name: "Academia", color: "#22C55E" }, // green-500
  { name: "Casa", color: "#F59E0B" }, // amber-500
  { name: "Finanças", color: "#6366F1" }, // indigo-500
  { name: "Projetos Pessoais", color: "#06B6D4" }, // cyan-500
  { name: "Saúde", color: "#F97316" }, // orange-500
  { name: "Urgente", color: "#DC2626" }, // red-600
];

function generateRandomColor(): string {
  const colors = [
    "#EF4444", "#F97316", "#F59E0B", "#EAB308", "#84CC16", "#22C55E",
    "#10B981", "#14B8A6", "#06B6D4", "#0EA5E9", "#3B82F6", "#6366F1",
    "#8B5CF6", "#A855F7", "#D946EF", "#EC4899", "#F43F5E", "#FB7185",
    "#F87171", "#FBBF24", "#A3E635", "#34D399", "#2DD4BF", "#22D3EE",
    "#60A5FA", "#818CF8", "#C084FC", "#E879F9", "#F472B6", "#FB923C"
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

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
          // Garante que cada board tenha availableTags e preenche com DEFAULT_TAGS se estiver vazio
          const boardsWithTags = parsedData.map((board: BoardData) => ({
            ...board,
            availableTags: board.availableTags && board.availableTags.length > 0
              ? board.availableTags
              : DEFAULT_TAGS.map(tag => ({ ...tag, id: crypto.randomUUID() }))
          }));
          setBoards(boardsWithTags);
          setActiveBoardId(boardsWithTags[0].id);
        } else {
          const defaultBoard: BoardData = {
            id: crypto.randomUUID(),
            name: "Meu Primeiro Board",
            cards: [],
            availableTags: DEFAULT_TAGS.map(tag => ({ ...tag, id: crypto.randomUUID() }))
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
      availableTags: DEFAULT_TAGS.map(tag => ({ ...tag, id: crypto.randomUUID() }))
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
    tagId?: string // Nova propriedade para a tag
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
      tagId,
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
      if (!prevBoards) return [];
      return prevBoards.filter((b) => b.id !== id);
    });

    setActiveBoardId((prevId) => {
      if (prevId === id) {
        // Encontra o primeiro board disponível que não seja o deletado
        const remainingBoards = boards.filter(b => b.id !== id);
        return remainingBoards.length > 0 ? remainingBoards[0].id : null;
      }
      return prevId;
    });
  };

  const addTag = (name: string): Tag => {
    if (!activeBoardId) throw new Error("Nenhum board ativo para adicionar tag.");

    const newTag: Tag = {
      id: crypto.randomUUID(),
      name,
      color: generateRandomColor(),
    };

    setBoards((prev) =>
      prev.map((b) =>
        b.id === activeBoardId
          ? { ...b, availableTags: [...b.availableTags, newTag] }
          : b
      )
    );
    return newTag;
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
    availableTags: activeBoard?.availableTags ?? [], // Exporta as tags disponíveis
    addTag, // Exporta a função para adicionar tags
    addCard,
    editCard,
    removeCard,
    moveCard,
    toggleSubTask,
    moveCardToOrder,
  };
}

