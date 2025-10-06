"use client";

import { useState, useEffect } from "react";
import {
  Sidebar,
  SidebarProvider,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  Sun,
  Moon,
  SidebarIcon,
  Code,
  Palette,
  Edit,
  BadgeCheck,
  Check,
  Languages
} from "lucide-react";

// 🧠 Importa utilitários de persistência
import { saveToStorage, loadFromStorage } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

export default function BoardSidebar() {
  const [theme, setTheme] = useState<"light" | "dark" | "system">("dark");
  const [collapsed, setCollapsed] = useState(false);

  // 🔹 Carrega o tema salvo ao montar
  useEffect(() => {
    const savedTheme = loadFromStorage<"light" | "dark" | "system">("theme", "dark");
    setTheme(savedTheme);
  }, []);

  // 🔹 Aplica e salva o tema no localStorage
  useEffect(() => {
    const html = document.documentElement;
    html.classList.remove("dark");

    if (theme === "dark") {
      html.classList.add("dark");
    } else if (theme === "system") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (prefersDark) html.classList.add("dark");
    }

    saveToStorage("theme", theme);
  }, [theme]);

  return (
    <SidebarProvider
      className={`${collapsed ? "w-16" : "w-64"} transition-[width] duration-200 ease-linear`}
    >
      <Sidebar
        className={`border-r bg-background h-screen flex flex-col ${
          collapsed ? "w-16" : "w-64"
        } transition-[width] duration-200 ease-linear`}
      >
        {/* Header */}
        <SidebarHeader className={`flex flex-row justify-between items-center py-2 ${collapsed ? "px-2" : "px-4"}`}>
          {!collapsed && <h1 className="text-lg font-bold">Tools-Do</h1>}

          <Button variant="ghost"  className="justify-start"
            onClick={() => setCollapsed(!collapsed)}
          >
            <SidebarIcon className="w-4 h-4" />
          </Button>
        </SidebarHeader>

        {/* Menu */}
        <SidebarMenu className="flex-1 px-2">

          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Button variant="ghost" className="w-full justify-start">
                <Edit className="w-4 h-4" />
                {!collapsed && "Novo Board"}
              </Button>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <DropdownMenu>
              {/* Botão que abre o dropdown */}
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start">
                  <Palette className="w-4 h-4" />
                  {!collapsed && "Tema"}
                </Button>
              </DropdownMenuTrigger>

              {/* Conteúdo do dropdown */}
              <DropdownMenuContent className="w-44" align="start">
                <DropdownMenuItem
                  onClick={() => setTheme("dark")}
                  className="flex items-center gap-2"
                >
                  <Moon className="w-4 h-4" />
                  Escuro
                  {theme === "dark" && <Check className="w-4 h-4" />}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setTheme("light")}
                  className="flex items-center gap-2"
                >
                  <Sun className="w-4 h-4" />
                  Claro
                  {theme === "light" && <Check className="w-4 h-4" />}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setTheme("system")}
                  className="flex items-center gap-2"
                >
                  <Code className="w-4 h-4" />
                  Sistema
                  {theme === "system" && <Check className="w-4 h-4" />}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <DropdownMenu>
              {/* Botão que abre o dropdown */}
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start">
                  <Languages className="w-4 h-4" />
                  {!collapsed && "Idioma"}
                </Button>
              </DropdownMenuTrigger>

              {/* Conteúdo do dropdown */}
              <DropdownMenuContent className="w-44" align="start">
                <DropdownMenuItem
                  className="flex items-center gap-2"
                >
                  <Moon className="w-4 h-4" />
                  Escuro
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="flex items-center gap-2"
                >
                  <Sun className="w-4 h-4" />
                  Claro
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="flex items-center gap-2"
                >
                  <Code className="w-4 h-4" />
                  Sistema
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Button variant="ghost" className="w-full justify-start">
                <BadgeCheck className="w-4 h-4" />
                {!collapsed && "Créditos"}
              </Button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <SidebarFooter className="px-6 py-2 text-sm text-muted-foreground">
          {!collapsed && "v1.0.0"}
        </SidebarFooter>
      </Sidebar>
    </SidebarProvider>
  );
}
