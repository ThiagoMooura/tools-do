
"use client";

import { Button } from "@/components/ui/button";
import { CardBoard } from "./cardBoard";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
} from "@/components/ui/sheet";
import { Plus, MoreVertical, ArrowDownNarrowWide, ArrowUpNarrowWide, TagIcon, Trash2 } from "lucide-react";
import { useState, useMemo } from "react";
import { Card, Priority, SubTask } from "@/hooks/useBoard";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import React from "react";
import { useBoardContext } from "@/app/contexts/boardContext";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { CardForm } from "@/components/ui/cardForm";

interface ColumnProps {
  columnId: "todo" | "doing" | "done";
  title: string;
  cards: Card[];
  addCard: (
    title: string,
    priority: Priority,
    description?: string,
    subTasks?: SubTask[],
    tagId?: string
  ) => void;
  editCard: (id: string, updates: Partial<Card>) => void;
  removeCard: (id: string) => void;
  moveCard: (id: string, column: "todo" | "doing" | "done") => void;
  toggleSubTask: (cardId: string, subTaskId: string) => void;
}

export const Column = React.memo(function Column({
  columnId,
  title,
  cards,
  addCard,
  editCard,
  removeCard,
  moveCard,
  toggleSubTask,
}: ColumnProps) {
  const { setNodeRef } = useDroppable({ id: columnId });
  const { activeBoard, removeCard: removeCardFromContext } = useBoardContext();

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<Card | null>(null);

  const handleOpenSheetForEdit = (card: Card) => {
    setEditingCard(card);
    setIsSheetOpen(true);
  };

  const handleOpenSheetForAdd = () => {
    setEditingCard(null);
    setIsSheetOpen(true);
  };

  const handleSaveCard = (data: {
    title: string;
    description?: string;
    priority: Priority;
    subTasks?: SubTask[];
    tagId?: string;
  }) => {
    if (editingCard) {
      editCard(editingCard.id, data);
    } else {
      addCard(data.title, data.priority, data.description, data.subTasks, data.tagId);
    }
    setIsSheetOpen(false);
    setEditingCard(null);
  };

  const handleCancelForm = () => {
    setIsSheetOpen(false);
    setEditingCard(null);
  };

  const handleDeleteAllCards = () => {
    cards.forEach(card => removeCardFromContext(card.id));
  };

  const [sortBy, setSortBy] = useState<"none" | "priority-asc" | "priority-desc" | "tag-asc" | "tag-desc">("none");

  const sortedCards = useMemo(() => {
    const sortableCards = [...cards];
    if (sortBy === "priority-asc") {
      sortableCards.sort((a, b) => {
        const priorityOrder = { low: 0, medium: 1, high: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });
    } else if (sortBy === "priority-desc") {
      sortableCards.sort((a, b) => {
        const priorityOrder = { low: 0, medium: 1, high: 2 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });
    } else if (sortBy === "tag-asc") {
      sortableCards.sort((a, b) => {
        const tagA = activeBoard?.availableTags.find(tag => tag.id === a.tagId)?.name || "";
        const tagB = activeBoard?.availableTags.find(tag => tag.id === b.tagId)?.name || "";
        return tagA.localeCompare(tagB);
      });
    } else if (sortBy === "tag-desc") {
      sortableCards.sort((a, b) => {
        const tagA = activeBoard?.availableTags.find(tag => tag.id === a.tagId)?.name || "";
        const tagB = activeBoard?.availableTags.find(tag => tag.id === b.tagId)?.name || "";
        return tagB.localeCompare(tagA);
      });
    }
    return sortableCards;
  }, [cards, sortBy, activeBoard?.availableTags]);

  return (
    <div className="rounded-xl p-4 flex flex-col">
      <div className="w-full flex justify-between items-end">
        <h2 className="font-semibold text-lg">
          <span
            className={`w-2.5 h-2.5 rounded-xs inline-block mr-2 ${
              columnId === "todo"
                ? "bg-cyan-500"
                : columnId === "doing"
                ? "bg-amber-500"
                : "bg-green-500"
            }`}
          ></span>
          {title} 
          <span className="text-muted-foreground ml-1">({cards.length})</span>
        </h2>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="-mb-1">
              <MoreVertical />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <ArrowDownNarrowWide className="w-4 h-4 mr-2" /> Ordenar por
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem onClick={() => setSortBy("none")}>Padrão</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("priority-asc")}>
                  <ArrowUpNarrowWide className="w-4 h-4 mr-2" /> Prioridade (Crescente)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("priority-desc")}>
                  <ArrowDownNarrowWide className="w-4 h-4 mr-2" /> Prioridade (Decrescente)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("tag-asc")}>
                  <TagIcon className="w-4 h-4 mr-2" /> Tag (A-Z)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("tag-desc")}>
                  <TagIcon className="w-4 h-4 mr-2" /> Tag (Z-A)
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600">
                  <Trash2 className="w-4 h-4 mr-2" /> Deletar todos os cards
                </DropdownMenuItem>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Deletar todos os cards?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem certeza que deseja excluir TODOS os cards desta coluna? Esta ação não pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAllCards}
                    className="bg-red-600 text-white hover:bg-red-700"
                  >
                    Deletar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="my-4 flex-1 flex flex-col">
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              className="px-4 py-2 mb-5 rounded-xl w-full text-3xl font-medium h-12 shadow-xl border-none"
              onClick={handleOpenSheetForAdd}
            >
              <Plus strokeWidth={3.5}/>
            </Button>
          </SheetTrigger>

          <SheetContent side="right" className="w-[450px] sm:w-[600px] lg:w-[700px] bg-sidebar border-none">
            <SheetHeader>
              <SheetTitle>
                {editingCard ? "Editar tarefa" : "Nova tarefa"}
              </SheetTitle>
              <SheetDescription>
                {editingCard
                  ? "Atualize as informações da tarefa."
                  : `Preencha as informações para adicionar uma nova to-do à coluna ${title}.`}
              </SheetDescription>
            </SheetHeader>
            <CardForm
              initialData={editingCard}
              columnId={columnId}
              onSave={handleSaveCard}
              onCancel={handleCancelForm}
            />
          </SheetContent>
        </Sheet>

        {/* Área de drop e contexto de ordenação */}
        <SortableContext
          items={sortedCards.map((c) => c.id)}
          strategy={verticalListSortingStrategy}
        >
          <div ref={setNodeRef} className="flex flex-col gap-3 flex-1">
            {sortedCards.map((card) => (
              <CardBoard
                key={card.id}
                card={card}
                onEdit={() => handleOpenSheetForEdit(card)}
                onDelete={() => removeCard(card.id)}
                onMove={moveCard}
                onToggleSubTask={toggleSubTask}
              />
            ))}
          </div>
        </SortableContext>
      </div>
    </div>
  );
})


