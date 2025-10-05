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
import {
  Edit,
  Trash2,
  ArrowRight,
  ArrowLeft,
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
import { Card as CardType } from "@/hooks/useBoard";

interface Props {
  card: CardType;
  onEdit: () => void;
  onDelete: () => void;
  onMove: (column: "todo" | "doing" | "done") => void;
}

export function CardBoard({ card, onEdit, onDelete, onMove }: Props) {
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
          <CardDescription className="text-base">
            {card.description}
          </CardDescription>
        )}
      </CardContent>

      <CardFooter className="justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        {/* mover card para frente */}
        {card.column !== "done" && (
          <Button
            variant="outline"
            size="icon"
            onClick={() =>
              onMove(card.column === "todo" ? "doing" : "done")
            }
          >
            <ArrowRight />
          </Button>
        )}

        {/* mover card para trás */}
        {card.column !== "todo" && (
          <Button
            variant="outline"
            size="icon"
            onClick={() =>
              onMove(card.column === "doing" ? "todo" : "doing")
            }
          >
            <ArrowLeft />
          </Button>
        )}

        {/* editar */}
        <Button variant="outline" size="icon" onClick={onEdit}>
          <Edit />
        </Button>

        {/* deletar com confirmação */}
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
                Tem certeza que deseja excluir esta tarefa?  
                Esta ação não pode ser desfeita.
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
