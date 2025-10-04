// components/Board.tsx
"use client";

import {Button} from "@/components/ui/button";

export function Board() {
  return (
    <div className="grid grid-cols-3 gap-6 py-10 px-20">
        <Button variant="default">Default</Button>
        <Button variant="destructive">Destructive</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="link">Link</Button>
    </div>
  );
}
