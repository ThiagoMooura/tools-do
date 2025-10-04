import { Button } from "@/components/ui/button";
import { CardBoard } from "./cardBoard";

interface ColumnProps {
    columnId: string;
    title: string;
}

export function Column({columnId, title}: ColumnProps) {
  return (
    <div className="backdrop-blur-md  rounded-xl p-4 flex flex-col">
        <div className="w-full flex justify-between items-end">
            <h2 className="font-semibold text-lg ">
                <span className={`w-2.5 h-2.5 rounded-xs inline-block mr-2 ${columnId === "todo" ? "bg-cyan-500" : columnId === "doing" ? "bg-amber-500" : "bg-green-500"} `}></span>
                {title} (3)
            </h2>

            <button className="flex flex-col gap-0.5 cursor-pointer px-1 py-0.5">
                <span className="bg-foreground w-1 h-1 rounded-xs inline-block"></span>
                <span className="bg-foreground w-1 h-1 rounded-xs inline-block"></span>
                <span className="bg-foreground w-1 h-1 rounded-xs inline-block"></span>
            </button>
        </div>
        
        <div className="my-4">
            <Button variant="outline" className="px-4 py-2 mb-5 rounded-xl w-full text-3xl font-medium h-12">+</Button>
            <CardBoard />
        </div>

        <div className="flex flex-col gap-3 flex-1">
            {/* card */}
        </div>
    </div>

  );
}
