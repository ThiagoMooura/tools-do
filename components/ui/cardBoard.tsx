
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,

} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Edit,
  Trash2,
  ArrowRight,
  ArrowLeft,
  Check,
  Plus,
  MoreVertical,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Card as CardType, SubTask } from "@/hooks/useBoard";
import { useBoardContext } from "@/app/contexts/boardContext";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import React, { useState } from "react";
import { Input } from "@/components/ui/input";

interface Props {
  card: CardType;
  onEdit: () => void;
  onDelete: () => void;
  onMove: (id: string, column: "todo" | "doing" | "done") => void;
  onToggleSubTask: (cardId: string, subTaskId: string) => void;
  onAddSubTask: (cardId: string, title: string) => void;
  onEditSubTask: (cardId: string, subTaskId: string, newTitle: string) => void;
}

export function CardBoard({
  card,
  onEdit,
  onDelete,
  onMove,
  onToggleSubTask,
  onAddSubTask,
  onEditSubTask,
}: Props) {
  const { activeBoard } = useBoardContext();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
    data: {
      card,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const daysAgo = Math.floor(
    (Date.now() - card.createdAt) / (1000 * 60 * 60 * 24)
  );
  const formattedDate =
    daysAgo === 0
      ? "Hoje"
      : daysAgo === 1
      ? "1 dia atrás"
      : `${daysAgo} dias atrás`;

  const color =
    card.priority === "high"
      ? "bg-purple-700"
      : card.priority === "medium"
      ? "bg-amber-600"
      : "bg-green-600";

  const [newSubTaskText, setNewSubTaskText] = useState("");
  const [editingSubTaskId, setEditingSubTaskId] = useState<string | null>(null);
  const [editingSubTaskText, setEditingSubTaskText] = useState("");
  const [showAddSubTaskInput, setShowAddSubTaskInput] = useState(false);

  const handleAddSubTask = () => {
    if (newSubTaskText.trim()) {
      onAddSubTask(card.id, newSubTaskText);
      setNewSubTaskText("");
      setShowAddSubTaskInput(false);
    }
  };

  const handleEditSubTask = (subTaskId: string, currentTitle: string) => {
    setEditingSubTaskId(subTaskId);
    setEditingSubTaskText(currentTitle);
  };

  const handleSaveEditedSubTask = (subTaskId: string) => {
    if (editingSubTaskText.trim()) {
      onEditSubTask(card.id, subTaskId, editingSubTaskText);
      setEditingSubTaskId(null);
      setEditingSubTaskText("");
    }
  };

  const handleCancelEditSubTask = () => {
    setEditingSubTaskId(null);
    setEditingSubTaskText("");
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="relative group">
      <Card className="shadow-md hover:shadow-lg transition-shadow duration-200 border-none">
        <CardHeader className="gap-0.5">
          <div className="flex flex-row justify-between items-center w-full ">
            <div className="flex gap-2 items-center">
              <Badge className={`${color} text-white`}>
                {card.priority.charAt(0).toUpperCase() + card.priority.slice(1)}
              </Badge>
              {card.tagId && activeBoard?.availableTags && (
                <Badge
                  style={{ backgroundColor: activeBoard.availableTags.find(tag => tag.id === card.tagId)?.color || "#6B7280" }}
                  className="text-white"
                >
                  {activeBoard.availableTags.find(tag => tag.id === card.tagId)?.name}
                </Badge>
              )}
            </div>
            <span className="text-sm text-muted-foreground">{formattedDate}</span>
          </div>
        </CardHeader>

        <CardContent>
          <CardTitle className="text-xl">{card.title}</CardTitle>
          {card.description && (
            <CardDescription className="text-sm">
              {card.description}
            </CardDescription>
          )}

          {card.subTasks && card.subTasks.length > 0 && (
            <div className="mt-2 flex flex-col gap-1">
              {card.subTasks.map((st: SubTask) => (
                <div
                  key={st.id}
                  className="flex items-center gap-2"
                >
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer
                    ${
                      st.done
                        ? "bg-blue-600 border-blue-600"
                        : "border-gray-400 bg-white"
                    }`}
                    onClick={() => onToggleSubTask(card.id, st.id)}
                  >
                    {st.done && <Check className="w-3 h-3 text-white" />}
                  </div>
                  {editingSubTaskId === st.id ? (
                    <Input
                      value={editingSubTaskText}
                      onChange={(e) => setEditingSubTaskText(e.target.value)}
                      onBlur={() => handleSaveEditedSubTask(st.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveEditedSubTask(st.id);
                        if (e.key === 'Escape') handleCancelEditSubTask();
                      }}
                      autoFocus
                      className="flex-1"
                    />
                  ) : (
                    <span
                      className={`flex-1 ${st.done ? "text-muted-foreground " : ""} cursor-pointer`}
                      onClick={() => handleEditSubTask(st.id, st.title)}
                    >
                      {st.title}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
          {/* Moved outside the conditional for existing sub-tasks */}
          {card.subTasks && card.subTasks.length > 0 && (
          <div className="mt-2">
            {showAddSubTaskInput ? (
              <div className="flex gap-2">
                <Input
                  placeholder="Adicionar nova sub-tarefa"
                  value={newSubTaskText}
                  onChange={(e) => setNewSubTaskText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddSubTask()}
                  autoFocus
                />
                <Button onClick={handleAddSubTask} disabled={!newSubTaskText.trim()} size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                className="w-full justify-start text-muted-foreground"
                onClick={() => setShowAddSubTaskInput(true)}
              >
                <Plus className="h-4 w-4 mr-2" /> Adicionar sub-tarefa
              </Button>
            )}
          </div>
          )}
        </CardContent>
      </Card>

      {/* Floating action buttons */}
      <div className="absolute -right-10 top-1/2 -translate-y-1/2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20">
      <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="bg-background/80 backdrop-blur-sm">
              <MoreVertical />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => onMove(card.id, card.column === "doing" ? "todo" : "doing")}
              disabled={card.column === "todo"}
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Mover para a esquerda
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onMove(card.id, card.column === "todo" ? "doing" : "done")}
              disabled={card.column === "done"}
            >
              <ArrowRight className="w-4 h-4 mr-2" /> Mover para a direita
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button variant="outline" size="icon" className="bg-background/80 backdrop-blur-sm" onClick={onEdit}>
          <Edit />
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="icon" className="bg-background/80 backdrop-blur-sm">
              <Trash2 />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Deletar tarefa</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir esta tarefa? Esta ação não pode
                ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={onDelete}
                className="bg-red-600 text-white hover:bg-red-700"
              >
                Confirmar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

