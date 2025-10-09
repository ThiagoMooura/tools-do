
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
import { Plus, MoreVertical } from "lucide-react";
import { useState } from "react";
import { Card, Priority, SubTask, Tag } from "@/hooks/useBoard";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import React from "react";
import { useBoardContext } from "@/app/contexts/boardContext";
import { Badge } from "@/components/ui/badge"; // Importar Badge

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
  const { availableTags, addTag } = useBoardContext();

  const [isOpen, setIsOpen] = useState(false);
  const [titleInput, setTitleInput] = useState("");
  const [descInput, setDescInput] = useState("");
  const [priority, setPriority] = useState<Priority>("low");
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [selectedTagId, setSelectedTagId] = useState<string | undefined>(undefined);
  const [newTagName, setNewTagName] = useState("");

  const [subTasksInput, setSubTasksInput] = useState<SubTask[]>([]);
  const [subTaskInputText, setSubTaskInputText] = useState("");

  const handleAddSubTaskTemp = () => {
    if (!subTaskInputText.trim()) return;
    setSubTasksInput((prev) => [
      ...prev,
      { id: crypto.randomUUID(), title: subTaskInputText, done: false },
    ]);
    setSubTaskInputText("");
  };

  const handleRemoveSubTaskTemp = (id: string) => {
    setSubTasksInput((prev) => prev.filter((st) => st.id !== id));
  };

  const handleAddNewTag = () => {
    if (newTagName.trim()) {
      const existingTag = availableTags.find(tag => tag.name.toLowerCase() === newTagName.trim().toLowerCase());
      if (existingTag) {
        setSelectedTagId(existingTag.id);
      } else {
        const createdTag = addTag(newTagName.trim());
        setSelectedTagId(createdTag.id);
      }
      setNewTagName("");
    }
  };

  const handleSave = () => {
    if (!titleInput.trim()) return;

    const newCardData = {
      title: titleInput,
      description: descInput,
      priority,
      subTasks: subTasksInput,
      tagId: selectedTagId,
    };

    if (editingCard) {
      editCard(editingCard.id, newCardData);
    } else {
      addCard(titleInput, priority, descInput, subTasksInput, selectedTagId);
    }

    setIsOpen(false);
    setTitleInput("");
    setDescInput("");
    setPriority("low");
    setSubTasksInput([]);
    setSubTaskInputText("");
    setEditingCard(null);
    setSelectedTagId(undefined);
    setNewTagName("");
  };

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
          <span className="text-muted-foreground ml-1">  
            ({cards.length})
          </span>
        </h2>

        <Button variant="ghost" className="-mb-1">
          <MoreVertical />
        </Button>
      </div>

      <div className="my-4 flex-1 flex flex-col">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              className="px-4 py-2 mb-5 rounded-xl w-full text-3xl font-medium h-12"
            >
              <Plus strokeWidth={3.5} />
            </Button>
          </SheetTrigger>

          <SheetContent side="right" className="w-[400px] sm:w-[500px]">
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

            <div className="flex flex-col gap-4 mt-6">
              <input
                placeholder="Título"
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                className="border rounded-md px-3 py-2"
              />
              <textarea
                placeholder="Descrição (opcional)"
                value={descInput}
                onChange={(e) => setDescInput(e.target.value)}
                className="border rounded-md px-3 py-2"
              />
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="border rounded-md px-3 py-2"
              >
                <option value="low">Baixa</option>
                <option value="medium">Média</option>
                <option value="high">Alta</option>
              </select>

              {/* Seleção de Tags com Badges Clicáveis */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Tag (opcional)</label>
                <div className="flex flex-wrap gap-2">
                  {availableTags.map((tag) => (
                    <Badge
                      key={tag.id}
                      style={{ backgroundColor: tag.color, cursor: 'pointer' }}
                      className={`text-white ${selectedTagId === tag.id ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`}
                      onClick={() => setSelectedTagId(selectedTagId === tag.id ? undefined : tag.id)}
                    >
                      {tag.name}
                    </Badge>
                  ))}
                  {selectedTagId && !availableTags.some(tag => tag.id === selectedTagId) && (
                    <Badge
                      style={{ backgroundColor: '#6B7280', cursor: 'pointer' }}
                      className="text-white ring-2 ring-offset-2 ring-blue-500"
                      onClick={() => setSelectedTagId(undefined)}
                    >
                      Tag Removida
                    </Badge>
                  )}
                </div>
                <div className="flex gap-2 mt-2">
                  <input
                    placeholder="Criar nova tag..."
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddNewTag()}
                    className="border rounded-md px-3 py-2 flex-1"
                  />
                  <Button onClick={handleAddNewTag} disabled={!newTagName.trim()}>Criar Tag</Button>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                {subTasksInput.map((st) => (
                  <div
                    key={st.id}
                    className="flex justify-between items-center"
                  >
                    <span>{st.title}</span>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleRemoveSubTaskTemp(st.id)}
                    >
                      ×
                    </Button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <input
                    placeholder="Adicionar sub-tarefa"
                    value={subTaskInputText}
                    onChange={(e) => setSubTaskInputText(e.target.value)}
                    className="border rounded-md px-3 py-2 flex-1"
                  />
                  <Button onClick={handleAddSubTaskTemp}>Adicionar</Button>
                </div>
              </div>

              <Button onClick={handleSave}>
                {editingCard ? "Salvar alterações" : "Adicionar"}
              </Button>
            </div>
          </SheetContent>
        </Sheet>

        {/* Área de drop e contexto de ordenação */}
        <SortableContext
          items={cards.map((c) => c.id)}
          strategy={verticalListSortingStrategy}
        >
          <div ref={setNodeRef} className="flex flex-col gap-3 flex-1">
            {cards.map((card) => (
              <CardBoard
                key={card.id}
                card={card}
                onEdit={() => {
                  setEditingCard(card);
                  setTitleInput(card.title);
                  setDescInput(card.description || "");
                  setPriority(card.priority);
                  setSubTasksInput(card.subTasks || []);
                  setSelectedTagId(card.tagId);
                  setIsOpen(true);
                }}
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

