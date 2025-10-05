import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, ArrowRight, ArrowLeft, Check } from "lucide-react";
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

interface Props {
  card: CardType;
  onEdit: () => void;
  onDelete: () => void;
  onMove: (column: "todo" | "doing" | "done") => void;
  onToggleSubTask: (cardId: string, subTaskId: string) => void;
}

export function CardBoard({ card, onEdit, onDelete, onMove, onToggleSubTask }: Props) {
  const daysAgo = Math.floor((Date.now() - card.createdAt) / (1000 * 60 * 60 * 24));
  const formattedDate =
    daysAgo === 0 ? "Hoje" : daysAgo === 1 ? "1 dia atrás" : `${daysAgo} dias atrás`;

  const color =
    card.priority === "high"
      ? "bg-red-700"
      : card.priority === "medium"
      ? "bg-yellow-700"
      : "bg-green-700";

  return (
    <Card className="group">
      <CardHeader className="flex justify-between">
        <Badge className={`${color} text-foreground`}>
          {card.priority.charAt(0).toUpperCase() + card.priority.slice(1)}
        </Badge>
        <span className="text-sm text-muted-foreground">{formattedDate}</span>
      </CardHeader>

      <CardContent>
        <CardTitle className="text-2xl">{card.title}</CardTitle>
        {card.description && (
          <CardDescription className="text-base">{card.description}</CardDescription>
        )}

        {/* Sub-tarefas com radio */}
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
                    ${st.done ? "bg-blue-600 border-blue-600" : "border-gray-400 bg-white"}`}
                >
                {st.done && <Check className="w-3 h-3 text-white" />}
                </div>
                <span className={st.done ? "line-through text-muted-foreground" : ""}>
                {st.title}
                </span>
            </div>
            ))}
        </div>
        )}

      </CardContent>

      <CardFooter className="justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        {/* Mover card para frente */}
        {card.column !== "done" && (
          <Button
            variant="outline"
            size="icon"
            onClick={() => onMove(card.column === "todo" ? "doing" : "done")}
          >
            <ArrowRight />
          </Button>
        )}

        {/* Mover card para trás */}
        {card.column !== "todo" && (
          <Button
            variant="outline"
            size="icon"
            onClick={() => onMove(card.column === "doing" ? "todo" : "doing")}
          >
            <ArrowLeft />
          </Button>
        )}

        {/* Editar */}
        <Button variant="outline" size="icon" onClick={onEdit}>
          <Edit />
        </Button>

        {/* Deletar com confirmação */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="icon">
              <Trash2 />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Deletar tarefa</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir esta tarefa? Esta ação não pode ser desfeita.
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
      </CardFooter>
    </Card>
  );
}
