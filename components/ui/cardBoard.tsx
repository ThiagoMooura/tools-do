import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, ArrowRight } from "lucide-react"

export function CardBoard() {
    return (
        <Card className="group">
            <CardHeader className="flex justify-between">
                <Badge className="bg-green-700 text-foreground">
                    Low
                </Badge>
                <span className="text-sm text-muted-foreground">Today</span>
            </CardHeader>

            <CardContent>
                <CardTitle className="text-2xl">
                    TaskWhiz Concept
                </CardTitle>
                <CardDescription className="text-base">
                    Design unique ideas through targeted brainstorming and ideation
                </CardDescription>
            </CardContent>

            <CardFooter className="justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Button variant="outline" size="icon">
                    <ArrowRight />
                </Button>
                <Button variant="outline" size="icon">
                    <Edit />
                </Button>
                <Button variant="destructive" size="icon">
                    <Trash2 />
                </Button>
            </CardFooter>
        </Card>
    )
}
