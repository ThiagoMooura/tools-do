import { Button } from "@/components/ui/button"
import { CardBoard } from "./cardBoard"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from "@/components/ui/sheet"
import { Plus, MoreVertical } from "lucide-react"


interface ColumnProps {
  columnId: string
  title: string
}

export function Column({ columnId, title }: ColumnProps) {
  return (
    <div className="backdrop-blur-md rounded-xl p-4 flex flex-col">
      <div className="w-full flex justify-between items-end">
        <h2 className="font-semibold text-lg">
          <span
            className={`w-2.5 h-2.5 rounded-xs inline-block mr-2 ${
              columnId === "todo"
                ? "bg-cyan-500"
                : columnId === "doing"
                ? "bg-amber-500"
                : "bg-green-500"
            }`}
          ></span>
          {title} (3)
        </h2>

        <Button variant="ghost" className="-mb-1">
          <MoreVertical/>
        </Button>
      </div>

      <div className="my-4">
        {/* ✅ Botão que abre o Sheet */}
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              className="px-4 py-2 mb-5 rounded-xl w-full text-3xl font-medium h-12"
            >
              <Plus strokeWidth={3.5}/>
            </Button>
          </SheetTrigger>

          <SheetContent side="right" className="w-[400px] sm:w-[500px]">
            <SheetHeader>
              <SheetTitle>Nova tarefa</SheetTitle>
              <SheetDescription>
                Preencha as informações para adicionar uma nova to-do à coluna <b>{title}</b>.
              </SheetDescription>
            </SheetHeader>

          </SheetContent>
        </Sheet>

        {/* Cards */}
        <CardBoard />
      </div>

      <div className="flex flex-col gap-3 flex-1">
        {/* cards adicionais */}
      </div>
    </div>
  )
}
