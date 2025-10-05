"use client";

import { Column } from "@/components/ui/column";
import { useBoard } from "@/hooks/useBoard";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useState } from "react";
import { Card as CardType } from "@/hooks/useBoard";
import { CardBoard } from "@/components/ui/cardBoard";

export function Board() {
  const {
    board,
    addCard,
    editCard,
    removeCard,
    moveCard,
    moveCardToOrder, // Certifique-se de que esta função existe no seu hook
    toggleSubTask,
  } = useBoard();

  const [activeCard, setActiveCard] = useState<CardType | null>(null);

  // Sensores detectam as interações do usuário (ponteiro, toque)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      // Exige que o mouse se mova 10px antes de iniciar o arrasto
      // Evita que cliques acidentais iniciem o drag
      activationConstraint: {
        distance: 10,
      },
    })
  );

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    const card = board.find((c) => c.id === active.id);
    if (card) {
      setActiveCard(card);
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveCard(null); // Limpa o card ativo ao final

    // Se não foi solto sobre uma área válida, não faz nada
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    // Não faz nada se soltar no mesmo lugar
    if (activeId === overId) return;

    const activeCard = board.find((card) => card.id === activeId);
    if (!activeCard) return;

    const isOverAColumn = ["todo", "doing", "done"].includes(overId);

    // Cenário 1: Mover para outra coluna
    if (isOverAColumn && activeCard.column !== overId) {
      moveCard(activeId, overId as "todo" | "doing" | "done");
      return;
    }

    // Cenário 2: Reordenar dentro da mesma coluna
    const isOverACard = board.some((card) => card.id === overId);
    if (isOverACard) {
      moveCardToOrder(activeId, overId);
    }
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-3 gap-6 py-4 px-20 h-screen">
        <Column
          title="To do"
          columnId="todo"
          cards={board.filter((c) => c.column === "todo")}
          addCard={addCard}
          editCard={editCard}
          removeCard={removeCard}
          moveCard={moveCard}
          toggleSubTask={toggleSubTask}
        />
        <Column
          title="In Progress"
          columnId="doing"
          cards={board.filter((c) => c.column === "doing")}
          addCard={addCard}
          editCard={editCard}
          removeCard={removeCard}
          moveCard={moveCard}
          toggleSubTask={toggleSubTask}
        />
        <Column
          title="Completed"
          columnId="done"
          cards={board.filter((c) => c.column === "done")}
          addCard={addCard}
          editCard={editCard}
          removeCard={removeCard}
          moveCard={moveCard}
          toggleSubTask={toggleSubTask}
        />
      </div>

      {/* DragOverlay renderiza uma cópia "flutuante" do card enquanto ele é arrastado */}
      <DragOverlay>
        {activeCard ? (
          <CardBoard
            card={activeCard}
            onEdit={() => {}}
            onDelete={() => {}}
            onMove={() => {}}
            onToggleSubTask={() => {}}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
