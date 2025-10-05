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
import { Card, Priority, SubTask } from "@/hooks/useBoard";

interface ColumnProps {
  columnId: "todo" | "doing" | "done";
  title: string;
  cards: Card[];
  addCard: (title: string, priority: Priority, description?: string, subTasks?: SubTask[]) => void;
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
  const [subTasks, setSubTasks] = useState<SubTask[]>([]);
  const [editingCard, setEditingCard] = useState<Card | null>(null);

  const handleSave = () => {
    if (!titleInput.trim()) return;

    if (editingCard) {
      editCard(editingCard.id, {
        title: titleInput,
        description: descInput,
        priority,
        subTasks,
      });
    } else {
      addCard(titleInput, priority, descInput, subTasks);
    }

    // Reset
    setIsOpen(false);
    setTitleInput("");
    setDescInput("");
    setPriority("low");
    setSubTasks([]);
    setEditingCard(null);
  };

  const addSubTask = () => {
    setSubTasks([...subTasks, { id: crypto.randomUUID(), title: "", done: false }]);
  };

  const updateSubTask = (id: string, title: string) => {
    setSubTasks(subTasks.map(st => st.id === id ? { ...st, title } : st));
  };

  const removeSubTask = (id: string) => {
    setSubTasks(subTasks.filter(st => st.id !== id));
  };

  const toggleSubTaskOfCard = (cardId: string, subTaskId: string) => {
    const card = cards.find(c => c.id === cardId);
    if (!card || !card.subTasks) return;
    const updatedSubTasks = card.subTasks.map(st =>
      st.id === subTaskId ? { ...st, done: !st.done } : st
    );
    editCard(cardId, { subTasks: updatedSubTasks });
  };

  const columnColors: Record<string, string> = {
    todo: "bg-cyan-500",
    doing: "bg-amber-500",
    done: "bg-green-500",
  };

  return (
    <div className="backdrop-blur-md rounded-xl p-4 flex flex-col">
      <div className="w-full flex justify-between items-end">
        <h2 className="font-semibold text-lg">
          <span
            className={`w-2.5 h-2.5 rounded-xs inline-block mr-2 ${columnColors[columnId]}`}
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
              <SheetTitle>{editingCard ? "Editar tarefa" : "Nova tarefa"}</SheetTitle>
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

              {/* Sub-tarefas */}
              <div className="flex flex-col gap-2">
                <h3 className="font-semibold">Sub-tarefas</h3>
                {subTasks.map((st) => (
                  <div key={st.id} className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={st.title}
                      onChange={(e) => updateSubTask(st.id, e.target.value)}
                      placeholder="Sub-tarefa"
                      className="border rounded-md px-2 py-1 flex-1"
                    />
                    <Button size="sm" variant="destructive" onClick={() => removeSubTask(st.id)}>
                      X
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={addSubTask}>
                  + Adicionar sub-tarefa
                </Button>
              </div>

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
                setSubTasks(card.subTasks || []);
                setIsOpen(true);
              }}
              onDelete={() => removeCard(card.id)}
              onMove={(newColumn) => moveCard(card.id, newColumn)}
              onToggleSubTask={toggleSubTaskOfCard}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
