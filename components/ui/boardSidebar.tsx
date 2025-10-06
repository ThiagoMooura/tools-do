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
  Home,
  Settings,
  Folder,
  Sun,
  Moon,
  ChevronDown,
  ChevronUp,
  SidebarIcon,
  Code,
  Palette,
  Edit,
  BadgeCheck,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

// 🧠 Importa utilitários de persistência
import { saveToStorage, loadFromStorage } from "@/lib/storage";
import { Button } from "@/components/ui/button";

export default function BoardSidebar() {
  const [theme, setTheme] = useState<"light" | "dark" | "system">("dark");
  const [collapsed, setCollapsed] = useState(false);
  const [openThemes, setOpenThemes] = useState(false);

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
        <SidebarHeader className="flex justify-between items-center px-2 py-2">
          {!collapsed && <h1 className="text-lg font-bold">Meu Painel</h1>}

          <div className="flex gap-2">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <SidebarIcon className="w-4 h-4" />
            </button>
          </div>
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
            <SidebarMenuButton asChild>
              <Button variant="ghost" className="w-full justify-start">
                <Palette className="w-4 h-4" />
                {!collapsed && "Tema"}
              </Button>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* Tema com Collapsible */}
          <Collapsible open={openThemes} onOpenChange={setOpenThemes}>
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <button className="flex items-center justify-between w-full gap-2 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
                  <div className="flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    {!collapsed && "Tema"}
                  </div>
                  {!collapsed && (
                    <span className="text-sm">
                      {openThemes ? <ChevronUp /> : <ChevronDown />}
                    </span>
                  )}
                </button>
              </CollapsibleTrigger>

              <CollapsibleContent>
                {!collapsed && (
                  <div className="ml-6 mt-2">
                    <RadioGroup
                      value={theme}
                      onValueChange={(val) =>
                        setTheme(val as "light" | "dark" | "system")
                      }
                      className="flex flex-col gap-1"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="light" id="light" />
                        <Label
                          htmlFor="light"
                          className="text-sm cursor-pointer flex items-center gap-2"
                        >
                          <Sun className="w-4 h-4" />
                          Claro
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="dark" id="dark" />
                        <Label
                          htmlFor="dark"
                          className="text-sm cursor-pointer flex items-center gap-2"
                        >
                          <Moon className="w-4 h-4" />
                          Escuro
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="system" id="system" />
                        <Label
                          htmlFor="system"
                          className="text-sm cursor-pointer flex items-center gap-2"
                        >
                          <Code className="w-4 h-4" />
                          Sistema
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                )}
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>

          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Button variant="ghost" className="w-full justify-start">
                <BadgeCheck className="w-4 h-4" />
                {!collapsed && "Créditos"}
              </Button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <SidebarFooter className="px-3 py-2 text-sm text-muted-foreground">
          {!collapsed && "v1.0.0"}
        </SidebarFooter>
      </Sidebar>
    </SidebarProvider>
  );
}
