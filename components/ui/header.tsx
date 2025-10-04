// components/Header.tsx
"use client";

// import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
// import { Moon, Sun } from "lucide-react";

export function Header() {
  return (
    <header className="flex items-center justify-between px-4 py-2 border-b bg-sidebar fixed w-full z-10">
      {/* Botão para abrir/fechar sidebar */}
      <div className="flex items-center gap-2">
        <SidebarTrigger />
        <h1 className="text-xl font-bold">Tools-Do</h1>
      </div>
    </header>
  );
}
