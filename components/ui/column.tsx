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
import { Card, Priority } from "@/hooks/useBoard";

interface ColumnProps {
  columnId: "todo" | "doing" | "done";
  title: string;
  cards: Card[];
  addCard: (title: string, priority: Priority, description?: string) => void;
  editCard: (id: string, updates: Partial<Card>) => void;
  removeCard: (id: string) => void;
  moveCard: (id: string, column: "todo" | "doing" | "done") => void;
}

export function Column({
  columnId,
  title,
  cards,
  addCard,
  editCard,
  removeCard,
  moveCard,
}: ColumnProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [titleInput, setTitleInput] = useState("");
  const [descInput, setDescInput] = useState("");
  const [priority, setPriority] = useState<Priority>("low");
  const [editingCard, setEditingCard] = useState<Card | null>(null);

  const handleSave = () => {
    if (!titleInput.trim()) return;
    if (editingCard) {
      editCard(editingCard.id, {
        title: titleInput,
        description: descInput,
        priority,
      });
    } else {
      addCard(titleInput, priority, descInput);
    }
    setIsOpen(false);
    setTitleInput("");
    setDescInput("");
    setPriority("low");
    setEditingCard(null);
  };

  return (
    <div className="backdrop-blur-md rounded-xl p-4 flex flex-col">
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

      <div className="my-4">
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
              <Button onClick={handleSave}>
                {editingCard ? "Salvar alterações" : "Adicionar"}
              </Button>
            </div>
          </SheetContent>
        </Sheet>

        <div className="flex flex-col gap-3">
          {cards.map((card) => (
            <CardBoard
              key={card.id}
              card={card}
              onEdit={() => {
                setEditingCard(card);
                setTitleInput(card.title);
                setDescInput(card.description || "");
                setPriority(card.priority);
                setIsOpen(true);
              }}
              onDelete={() => removeCard(card.id)}
              onMove={(newColumn) => moveCard(card.id, newColumn)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
