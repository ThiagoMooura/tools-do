// components/Board.tsx
"use client";

import { Column } from "@/components/ui/column";

export function Board() {
  return (
    <div className="grid grid-cols-3 gap-6 py-4 px-20">
        <Column
            title="To do" 
            columnId="todo" 
        />
        <Column
            title="In Progress" 
            columnId="doing" 
        />
        <Column
            title="Completed" 
            columnId="done" 
        />
    </div>
  );
}
