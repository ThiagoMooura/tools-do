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
import { Card as CardType, SubTask } from "@/hooks/useBoard";
import { useBoardContext } from "@/app/contexts/boardContext";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Props {
  card: CardType;
  onEdit: () => void;
  onDelete: () => void;
  onMove: (id: string, column: "todo" | "doing" | "done") => void;
  onToggleSubTask: (cardId: string, subTaskId: string) => void;
}

export function CardBoard({
  card,
  onEdit,
  onDelete,
  onMove,
  onToggleSubTask,
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

  return (
    // A div externa agora é o elemento que a dnd-kit irá mover
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card className="group relative cursor-grab active:cursor-grabbing shadow-md hover:shadow-lg transition-shadow duration-200 border-none">
        <CardHeader className="flex-col items-start gap-2">
          <div className="flex flex-row justify-between items-center w-full">
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
          <CardTitle className="text-2xl">{card.title}</CardTitle>
          {card.description && (
            <CardDescription className="text-base">
              {card.description}
            </CardDescription>
          )}

          {card.subTasks && card.subTasks.length > 0 && (
            <div className="mt-2 flex flex-col gap-1">
              {card.subTasks.map((st: SubTask) => (
                <div
                  key={st.id}
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() => onToggleSubTask(card.id, st.id)}
                >
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all
                    ${
                      st.done
                        ? "bg-blue-600 border-blue-600"
                        : "border-gray-400 bg-white"
                    }`}
                  >
                    {st.done && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <span
                    className={
                      st.done ? "text-muted-foreground" : ""
                    }
                  >
                    {st.title}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>

        <div className="absolute bottom-0 right-0 p-4 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
          {card.column !== "todo" && (
            <Button
              variant="outline"
              size="icon"
              className="bg-background/80 backdrop-blur-sm"
              onClick={() =>
                onMove(card.id, card.column === "doing" ? "todo" : "doing")
              }
            >
              <ArrowLeft />
            </Button>
          )}
          {card.column !== "done" && (
            <Button
              variant="outline"
              size="icon"
              className="bg-background/80 backdrop-blur-sm"
              onClick={() =>
                onMove(card.id, card.column === "todo" ? "doing" : "done")
              }
            >
              <ArrowRight />
            </Button>
          )}
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
      </Card>
    </div>
  );
}
