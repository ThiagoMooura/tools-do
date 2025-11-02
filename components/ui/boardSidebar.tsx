"use client"

import { useState, useEffect } from "react"
import {
  Sidebar, SidebarProvider, SidebarHeader, SidebarFooter, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  Sun, Moon, SidebarIcon, Code, Palette, BadgeCheck, Check, Languages, Plus, LayoutDashboard, MoreVertical, Edit, Trash2, EditIcon
} from "lucide-react"
import {
  AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction,
} from "@/components/ui/alert-dialog"
import { saveToStorage, loadFromStorage } from "@/lib/storage"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { useBoardContext } from "@/app/contexts/boardContext"
import { Input } from "@/components/ui/input"

// 🧩 Import oficial do Tooltip do shadcn
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

// 💡 Tooltip customizado — aparece à direita e cobre o botão inteiro
function SimpleTooltip({
  content,
  children,
  collapsed,
}: {
  content: string
  children: React.ReactNode
  collapsed: boolean
}) {
  // só mostra o tooltip quando collapsed for true
  if (!collapsed) return <>{children}</>

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent
          side="right"
          align="center"
          className="text-sm bg-popover text-popover-foreground rounded-md shadow-md px-3 py-1"
        >
          <p>{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export default function BoardSidebar() {
  const [theme, setTheme] = useState<"light" | "dark" | "system">("dark")
  const [collapsed, setCollapsed] = useState(false)
  const [isCreatingBoard, setIsCreatingBoard] = useState(false)
  const [newBoardName, setNewBoardName] = useState("")
  const [isEditingBoard, setIsEditingBoard] = useState(false)
  const [editingBoardId, setEditingBoardId] = useState<string | null>(null)
  const [editingBoardName, setEditingBoardName] = useState("")

  const { boards, activeBoardId, selectBoard, addBoard, editBoard, deleteBoard } = useBoardContext()

  useEffect(() => {
    const savedTheme = loadFromStorage<"light" | "dark" | "system">("theme", "dark")
    setTheme(savedTheme)
  }, [])

  useEffect(() => {
    const html = document.documentElement
    html.classList.remove("light", "dark")
    if (theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      html.classList.add("dark")
    } else {
      html.classList.add("light")
    }
    saveToStorage("theme", theme)
  }, [theme])

  const handleCreateBoard = () => {
    if (newBoardName.trim()) {
      addBoard(newBoardName.trim())
      setNewBoardName("")
      setIsCreatingBoard(false)
    }
  }

  return (
    <SidebarProvider
      className={`${collapsed ? "w-16" : "w-64"} transition-[width] duration-300 ease-in-out`}
    >
      <Sidebar
        className={`border-r bg-background h-screen flex flex-col ${
          collapsed ? "w-16" : "w-64"
        } transition-[width] duration-300 ease-in-out shadow-2xl border-none`}
      >
        {/* Header */}
        <SidebarHeader className={`flex flex-row justify-between items-center py-2 ${collapsed ? "px-2" : "px-4"} mb-4`}>
          {!collapsed && <h1 className="text-lg font-bold">Tools-Do</h1>}
          <SimpleTooltip content={collapsed ? "Expandir" : "Minimizar"} collapsed={collapsed}>
            <Button
              variant="ghost"
              className={`justify-start ${collapsed ? "mx-auto" : ""}`}
              onClick={() => setCollapsed(!collapsed)}
            >
              <SidebarIcon className="w-4 h-4" />
            </Button>
          </SimpleTooltip>
        </SidebarHeader>

        {/* Criar Board */}
        <SidebarMenuItem className="px-2">
          {isCreatingBoard && !collapsed ? (
            <div className="flex flex-col gap-2 w-full">
              <Input
                type="text"
                placeholder="Nome do novo board..."
                value={newBoardName}
                onChange={(e) => setNewBoardName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreateBoard()}
                autoFocus
                className="h-9"
              />
              <div className="flex gap-2">
                <Button onClick={handleCreateBoard} className="flex-1 h-8">Criar</Button>
                <Button variant="ghost" onClick={() => setIsCreatingBoard(false)} className="flex-1 h-8">Cancelar</Button>
              </div>
            </div>
          ) : (
            <SimpleTooltip content="Criar board" collapsed={collapsed}>
              <Button
                variant="ghost"
                onClick={() => setIsCreatingBoard(true)}
                className={`w-full justify-start`}
              >
              {/* <Button
                variant="ghost"
                onClick={() => setIsCreatingBoard(true)}
                className={`w-full ${collapsed ? "justify-center" : "justify-start"}`}
              > */}
                <EditIcon className="w-4 h-4" />
                {!collapsed && <span className="ml-2">Criar board</span>}
              </Button>
            </SimpleTooltip>
          )}
        </SidebarMenuItem>

        {/* Lista de Boards */}
        <SidebarMenu className="flex-1 px-2">
          {!collapsed && (
            <p className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 mt-4">
              Boards ({boards.length})
            </p>
          )}
          <section className="flex-1 overflow-y-auto">
            {boards.map((boardItem) => (
              <SidebarMenuItem key={boardItem.id} className="group relative">
                {isEditingBoard && editingBoardId === boardItem.id && !collapsed ? (
                  <div className="flex items-center gap-2 w-full">
                    <Input
                      type="text"
                      value={editingBoardName}
                      onChange={(e) => setEditingBoardName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          editBoard(editingBoardId, editingBoardName)
                          setIsEditingBoard(false)
                          setEditingBoardId(null)
                        }
                        if (e.key === "Escape") {
                          setIsEditingBoard(false)
                          setEditingBoardId(null)
                        }
                      }}
                      autoFocus
                      className="h-8 flex-1"
                    />
                    <Button size="icon" variant="ghost" onClick={() => {
                      editBoard(editingBoardId, editingBoardName)
                      setIsEditingBoard(false)
                      setEditingBoardId(null)
                    }}>
                      <Check className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between w-full">
                    <SimpleTooltip content={boardItem.name} collapsed={collapsed}>
                      <Button
                        variant={boardItem.id === activeBoardId ? "secondary" : "ghost"}
                        className={`flex-1 ${collapsed ? "justify-center" : "justify-start"}`}
                        onClick={() => selectBoard(boardItem.id)}
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        {!collapsed && <span className="truncate ml-2">{boardItem.name}</span>}
                      </Button>
                    </SimpleTooltip>

                    {!collapsed && (
                      <div className="absolute right-1 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => {
                              setIsEditingBoard(true)
                              setEditingBoardId(boardItem.id)
                              setEditingBoardName(boardItem.name)
                            }}>
                              <Edit className="w-4 h-4 mr-2" /> Editar
                            </DropdownMenuItem>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                  <Trash2 className="w-4 h-4 mr-2" /> Deletar
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Esta ação não pode ser desfeita. Isso irá deletar o board {boardItem.name} e todos os seus cards.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deleteBoard(boardItem.id)}
                                    className="bg-red-600 text-white hover:bg-red-700"
                                  >
                                    Deletar
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    )}
                  </div>
                )}
              </SidebarMenuItem>
            ))}
          </section>

          {!collapsed && <hr className="my-4 border-border" />}

          {/* Tema */}
          <SidebarMenuItem>
            <DropdownMenu>
              <SimpleTooltip content="Tema" collapsed={collapsed}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="w-full justify-start">
                    <Palette className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
              </SimpleTooltip>
              {!collapsed && (
                <span className="ml-2 absolute left-10 top-1/2 -translate-y-1/2 pointer-events-none">Tema</span>
              )}
              <DropdownMenuContent className="w-44" align="start">
                <DropdownMenuItem onClick={() => setTheme("dark")} className="flex items-center gap-2">
                  <Moon className="w-4 h-4" /> Escuro {theme === "dark" && <Check className="w-4 h-4" />}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("light")} className="flex items-center gap-2">
                  <Sun className="w-4 h-4" /> Claro {theme === "light" && <Check className="w-4 h-4" />}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")} className="flex items-center gap-2">
                  <Code className="w-4 h-4" /> Sistema {theme === "system" && <Check className="w-4 h-4" />}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>


          {/* Idioma */}
          <SidebarMenuItem>
            <DropdownMenu>
              <SimpleTooltip content="Idioma" collapsed={collapsed}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="w-full justify-start">
                    <Languages className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
              </SimpleTooltip>
              {!collapsed && (
                <span className="ml-2 absolute left-10 top-1/2 -translate-y-1/2 pointer-events-none">Idioma</span>
              )}
              <DropdownMenuContent className="w-44" align="start">
                <DropdownMenuItem className="flex items-center gap-2">Português</DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-2">Inglês</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>

          {/* Créditos */}
          <SidebarMenuItem>
            <SimpleTooltip content="Créditos" collapsed={collapsed}>
              <SidebarMenuButton asChild>
                <Button variant="ghost" className="w-full justify-start">
                  <BadgeCheck className="w-4 h-4" />
                  {!collapsed && <span className="ml-2">Créditos</span>}
                </Button>
              </SidebarMenuButton>
            </SimpleTooltip>
          </SidebarMenuItem>
        </SidebarMenu>

        <SidebarFooter className="px-6 py-2 text-sm text-muted-foreground">
          {!collapsed && "v1.0.0"}
        </SidebarFooter>
      </Sidebar>
    </SidebarProvider>
  )
}
