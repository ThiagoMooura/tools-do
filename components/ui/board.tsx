"use client";

import { Column } from "@/components/ui/column";
import { useBoard } from "@/hooks/useBoard";

export function Board() {
  const { board, addCard, editCard, removeCard, moveCard } = useBoard();

  return (
    <div className="grid grid-cols-3 gap-6 py-4 px-20">
      <Column
        title="To do"
        columnId="todo"
        cards={board.filter((c) => c.column === "todo")}
        addCard={addCard}
        editCard={editCard}
        removeCard={removeCard}
        moveCard={moveCard}
      />
      <Column
        title="In Progress"
        columnId="doing"
        cards={board.filter((c) => c.column === "doing")}
        addCard={addCard}
        editCard={editCard}
        removeCard={removeCard}
        moveCard={moveCard}
      />
      <Column
        title="Completed"
        columnId="done"
        cards={board.filter((c) => c.column === "done")}
        addCard={addCard}
        editCard={editCard}
        removeCard={removeCard}
        moveCard={moveCard}
      />
    </div>
  );
}
