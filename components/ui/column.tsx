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
import { Plus, MoreVertical, Tag as TagIcon, X } from "lucide-react";
import { useState } from "react";
import { Card, Priority, SubTask, Tag } from "@/hooks/useBoard";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import React from "react"; // Importe React


interface ColumnProps {
  columnId: "todo" | "doing" | "done";
  title: string;
  cards: Card[];
  addCard: (
    title: string,
    priority: Priority,
    description?: string,
    subTasks?: SubTask[],
    tags?: Tag[]
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

  const [isOpen, setIsOpen] = useState(false);
  const [titleInput, setTitleInput] = useState("");
  const [descInput, setDescInput] = useState("");
  const [priority, setPriority] = useState<Priority>("low");
  const [editingCard, setEditingCard] = useState<Card | null>(null);

  const [subTasksInput, setSubTasksInput] = useState<SubTask[]>([]);
  const [subTaskInputText, setSubTaskInputText] = useState("");

  const [tagsInput, setTagsInput] = useState<Tag[]>([]);
  const [tagInputText, setTagInputText] = useState("");
  const [tagInputColor, setTagInputColor] = useState("#60a5fa"); // Cor padrão azul

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

  const handleAddTagTemp = () => {
    if (!tagInputText.trim()) return;
    setTagsInput((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name: tagInputText, color: tagInputColor },
    ]);
    setTagInputText("");
  };

  const handleRemoveTagTemp = (id: string) => {
    setTagsInput((prev) => prev.filter((tag) => tag.id !== id));
  };

  const handleSave = () => {
    if (!titleInput.trim()) return;

    const newCardData = {
      title: titleInput,
      description: descInput,
      priority,
      subTasks: subTasksInput,
      tags: tagsInput,
    };

    if (editingCard) {
      editCard(editingCard.id, newCardData);
    } else {
      addCard(titleInput, priority, descInput, subTasksInput, tagsInput);
    }

    setIsOpen(false);
    setTitleInput("");
    setDescInput("");
    setPriority("low");
    setSubTasksInput([]);
    setSubTaskInputText("");
    setTagsInput([]);
    setTagInputText("");
    setTagInputColor("#60a5fa");
    setEditingCard(null);
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
          {title} ({cards.length})
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

              <div className="flex flex-col gap-2">
                <h3 className="text-sm font-medium">Sub-tarefas</h3>
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
                      <X className="w-4 h-4" />
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

              <div className="flex flex-col gap-2">
                <h3 className="text-sm font-medium">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {tagsInput.map((tag) => (
                    <div
                      key={tag.id}
                      className="flex items-center gap-1 px-2 py-1 rounded-full text-xs text-white"
                      style={{ backgroundColor: tag.color }}
                    >
                      {tag.name}
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-4 w-4 text-white hover:bg-white hover:text-black"
                        onClick={() => handleRemoveTagTemp(tag.id)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={tagInputColor}
                    onChange={(e) => setTagInputColor(e.target.value)}
                    className="w-10 h-9 p-0 border-none rounded-md overflow-hidden cursor-pointer"
                  />
                  <input
                    placeholder="Nome da tag"
                    value={tagInputText}
                    onChange={(e) => setTagInputText(e.target.value)}
                    className="border rounded-md px-3 py-2 flex-1"
                  />
                  <Button onClick={handleAddTagTemp}>Adicionar Tag</Button>
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
                  setTagsInput(card.tags || []);
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
