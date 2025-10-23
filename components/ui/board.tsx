
"use client";

import { Column } from "@/components/ui/column";
import { useBoardContext } from "@/app/contexts/boardContext";

import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter, 
  MeasuringStrategy,
} from "@dnd-kit/core";
import { useState, useMemo } from "react";
import { Card as CardType } from "@/hooks/useBoard";
import { CardBoard } from "@/components/ui/cardBoard";
import { restrictToFirstScrollableAncestor } from "@dnd-kit/modifiers";

export function Board() {
  const {
    activeBoard,
    board: cards,
    addCard,
    editCard,
    removeCard,
    moveCard,
    moveCardToOrder,
    toggleSubTask,
  } = useBoardContext();

  const [activeCard, setActiveCard] = useState<CardType | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    })
  );

  const todoCards = useMemo(() => cards.filter((c) => c.column === "todo"), [cards]);
  const doingCards = useMemo(() => cards.filter((c) => c.column === "doing"), [cards]);
  const doneCards = useMemo(() => cards.filter((c) => c.column === "done"), [cards]);

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    const card = cards.find((c) => c.id === active.id);
    if (card) {
      setActiveCard(card);
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveCard(null);

    if (!over) return;
    const activeId = String(active.id);
    const overId = String(over.id);
    if (activeId === overId) return;

    const activeCard = cards.find((card) => card.id === activeId);
    if (!activeCard) return;

    const overCard = cards.find((card) => card.id === overId);
    const overIsColumn = ["todo", "doing", "done"].includes(overId);

    if (overIsColumn && activeCard.column !== overId) {
      moveCard(activeId, overId as "todo" | "doing" | "done");
      return;
    }

    if (overCard) {
      if (activeCard.column !== overCard.column) {
        moveCard(activeId, overCard.column);
      } else {
        moveCardToOrder(activeId, overId);
      }
    }
  }

  if (!activeBoard) {
    return (
      <div className="flex flex-1 items-center justify-center text-2xl text-muted-foreground">
        Selecione ou crie um board para começar.
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      // --- INÍCIO DAS OTIMIZAÇÕES AVANÇADAS ---
      
      // Estratégia de detecção de colisão. `closestCenter` é mais performático que `rectangleIntersection` (padrão).
      collisionDetection={closestCenter}
      modifiers={[restrictToFirstScrollableAncestor]}
      // Estratégia de medição. Isso diz para a dnd-kit usar transformações CSS para medir os nós,
      // o que é muito mais rápido e evita "reflows" de layout.
      measuring={{
        droppable: {
          strategy: MeasuringStrategy.Always,
        },
      }}
      
      // --- FIM DAS OTIMIZAÇÕES AVANÇADAS ---
    >
      <div className="grid grid-cols-3 gap-6 py-4 px-20 h-screen">
        <Column
          title="A Fazer"
          // title="To Do"
          columnId="todo"
          cards={todoCards}
          addCard={addCard}
          editCard={editCard}
          removeCard={removeCard}
          moveCard={moveCard}
          toggleSubTask={toggleSubTask}
        />
        <Column
          title="Em Andamento"
          // title="In Progress"
          columnId="doing"
          cards={doingCards}
          addCard={addCard}
          editCard={editCard}
          removeCard={removeCard}
          moveCard={moveCard}
          toggleSubTask={toggleSubTask}
        />
        <Column
          title="Concluído"
          // title="Completed"
          columnId="done"
          cards={doneCards}
          addCard={addCard}
          editCard={editCard}
          removeCard={removeCard}
          moveCard={moveCard}
          toggleSubTask={toggleSubTask}
        />
      </div>

      <DragOverlay>
        {activeCard ? (
          <CardBoard
            card={activeCard}
            onEdit={() => {}}
            onDelete={() => {}}
            onMove={() => {}}
            onToggleSubTask={() => {}}
            onAddSubTask={() => {}}
            onEditSubTask={() => {}}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

