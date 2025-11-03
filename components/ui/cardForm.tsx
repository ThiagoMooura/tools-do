"use client";

import React, {
  useState,
  useEffect,
  useImperativeHandle,
  forwardRef,
} from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectValue,
  SelectTrigger,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Plus, X, Check, Edit, GripVertical, ArrowDown, Minus, AlertTriangle } from "lucide-react";
import { Card, Priority, SubTask } from "@/hooks/useBoard";
import { useBoardContext } from "@/app/contexts/boardContext";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface CardFormProps {
  initialData?: Card | null;
}

interface CardFormHandle {
  getFormData: () => {
    title: string;
    description?: string;
    priority: Priority;
    subTasks?: SubTask[];
    tagId?: string;
  } | null;
}

interface SortableSubTaskItemProps {
  subTask: SubTask;
  onRemove: (id: string) => void;
  onEditClick: (subTask: SubTask) => void;
  onSaveEdit: (id: string) => void;
  onCancelEdit: () => void;
  isEditing: boolean;
  editingText: string;
  onEditingTextChange: (text: string) => void;
}

const DEFAULT_TAG_NAMES = [
  "Estudo",
  "Trabalho",
  "Diversão",
  "Saúde",
  "Academia",
  // "Casa",
  "Finanças",
  // "Projetos Pessoais",
  "Urgente",
];

const SortableSubTaskItem: React.FC<SortableSubTaskItemProps> = ({
  subTask,
  onRemove,
  onEditClick,
  onSaveEdit,
  onCancelEdit,
  isEditing,
  editingText,
  onEditingTextChange,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: subTask.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between rounded-md bg-muted p-2"
    >
      <div className="flex items-center flex-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 mr-2 cursor-grab"
          {...listeners}
          {...attributes}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </Button>
        {isEditing ? (
          <Input
            value={editingText}
            onChange={(e) => onEditingTextChange(e.target.value)}
            onBlur={() => onSaveEdit(subTask.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onSaveEdit(subTask.id);
              if (e.key === "Escape") onCancelEdit();
            }}
            autoFocus
            className="flex-1 mr-2"
          />
        ) : (
          <span className="flex-1" onClick={() => onEditClick(subTask)}>
            {subTask.title}
          </span>
        )}
      </div>
      <div className="flex gap-1">
        {isEditing ? (
          <Button
            size="icon"
            variant="ghost"
            onClick={() => onSaveEdit(subTask.id)}
            className="h-6 w-6"
          >
            <Check className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            size="icon"
            variant="ghost"
            onClick={() => onEditClick(subTask)}
            className="h-6 w-6"
          >
            <Edit className="h-4 w-4" />
          </Button>
        )}
        <Button
          size="icon"
          variant="ghost"
          onClick={() => onRemove(subTask.id)}
          className="h-6 w-6"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export const CardForm = forwardRef<CardFormHandle, CardFormProps>(
  ({ initialData }, ref) => {
    const [titleInput, setTitleInput] = useState(initialData?.title || "");
    const [descInput, setDescInput] = useState(initialData?.description || "");
    const [priority, setPriority] = useState<Priority>(
      initialData?.priority || "low"
    );
    const [subTasksInput, setSubTasksInput] = useState<SubTask[]>(
      initialData?.subTasks || []
    );
    const [subTaskInputText, setSubTaskInputText] = useState("");
    const [selectedTagId, setSelectedTagId] = useState<string | undefined>(
      initialData?.tagId
    );
    const [newTagName, setNewTagName] = useState("");
    const [editingSubTaskId, setEditingSubTaskId] = useState<string | null>(
      null
    );
    const [editingSubTaskText, setEditingSubTaskText] = useState("");

    const { availableTags, addTag, removeTag } = useBoardContext();

    const sensors = useSensors(
      useSensor(PointerSensor),
      useSensor(KeyboardSensor, {
        coordinateGetter: sortableKeyboardCoordinates,
      })
    );

    useEffect(() => {
      if (initialData) {
        setTitleInput(initialData.title);
        setDescInput(initialData.description || "");
        setPriority(initialData.priority);
        setSubTasksInput(initialData.subTasks || []);
        setSelectedTagId(initialData.tagId);
      } else {
        setTitleInput("");
        setDescInput("");
        setPriority("low");
        setSubTasksInput([]);
        setSelectedTagId(undefined);
      }
      setNewTagName("");
      setSubTaskInputText("");
      setEditingSubTaskId(null);
      setEditingSubTaskText("");
    }, [initialData]);

    useImperativeHandle(ref, () => ({
      getFormData: () => {
        if (!titleInput.trim()) return null;
        return {
          title: titleInput,
          description: descInput,
          priority,
          subTasks: subTasksInput,
          tagId: selectedTagId,
        };
      },
    }));

    const handleAddSubTaskTemp = () => {
      if (!subTaskInputText.trim()) return;
      setSubTasksInput((prev) => [
        ...prev,
        { id: crypto.randomUUID(), title: subTaskInputText, done: false },
      ]);
      setSubTaskInputText("");
    };

    const handleRemoveSubTaskTemp = (id: string) => {
      setSubTasksInput((prev) => prev.filter((st) => st.id !== id));
    };

    const handleEditSubTaskClick = (subTask: SubTask) => {
      setEditingSubTaskId(subTask.id);
      setEditingSubTaskText(subTask.title);
    };

    const handleSaveEditedSubTask = (id: string) => {
      if (editingSubTaskText.trim()) {
        setSubTasksInput((prev) =>
          prev.map((st) =>
            st.id === id ? { ...st, title: editingSubTaskText.trim() } : st
          )
        );
      }
      setEditingSubTaskId(null);
      setEditingSubTaskText("");
    };

    const handleCancelEditSubTask = () => {
      setEditingSubTaskId(null);
      setEditingSubTaskText("");
    };

    const handleAddNewTag = () => {
      if (newTagName.trim()) {
        const existingTag = availableTags.find(
          (tag) => tag.name.toLowerCase() === newTagName.trim().toLowerCase()
        );
        if (existingTag) {
          setSelectedTagId(existingTag.id);
        } else {
          const createdTag = addTag(newTagName.trim());
          setSelectedTagId(createdTag.id);
        }
        setNewTagName("");
      }
    };

    const handleRemoveTag = (tagId: string, tagName: string) => {
      if (DEFAULT_TAG_NAMES.includes(tagName)) return; // não permite excluir tags padrão
      removeTag(tagId);
      if (selectedTagId === tagId) setSelectedTagId(undefined);
    };

    function handleDragEnd(event: DragEndEvent) {
      const { active, over } = event;
      if (active.id !== over?.id) {
        setSubTasksInput((subTasks) => {
          const oldIndex = subTasks.findIndex((st) => st.id === active.id);
          const newIndex = subTasks.findIndex((st) => st.id === over?.id);
          if (oldIndex === -1 || newIndex === -1) return subTasks;
          const newSubTasks = [...subTasks];
          const [movedItem] = newSubTasks.splice(oldIndex, 1);
          newSubTasks.splice(newIndex, 0, movedItem);
          return newSubTasks;
        });
      }
    }

    return (
      <div className="flex flex-col gap-4 px-4 max-h-[calc(100vh-200px)] max-w-2xl mx-auto">
        {/* Título */}
        <div className="grid gap-2">
          <Label htmlFor="title">Título</Label>
          <Input
            id="title"
            placeholder="Título da tarefa"
            value={titleInput}
            onChange={(e) => setTitleInput(e.target.value)}
            className="text-lg"
          />
        </div>

        {/* Descrição */}
        <div className="grid gap-2">
          <Label htmlFor="description">Descrição</Label>
          <Textarea
            id="description"
            placeholder="Detalhes da tarefa..."
            value={descInput}
            onChange={(e) => setDescInput(e.target.value)}
            rows={4}
          />
        </div>

        {/* Prioridade */}
        <div className="grid gap-2">
  <Label htmlFor="priority">Prioridade</Label>
  <Select
    value={priority}
    onValueChange={(value: Priority) => setPriority(value)}
  >
    <SelectTrigger id="priority">
      <SelectValue placeholder="Selecione a prioridade" />
    </SelectTrigger>

    <SelectContent>
      <SelectItem value="low">
        <div className="flex items-center gap-2">
          <ArrowDown className="w-4 h-4" />
          <span>Baixa</span>
        </div>
      </SelectItem>
      <SelectItem value="medium">
        <div className="flex items-center gap-2">
          <Minus className="w-4 h-4" />
          <span>Média</span>
        </div>
      </SelectItem>
      <SelectItem value="high">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          <span>Alta</span>
        </div>
      </SelectItem>
    </SelectContent>
  </Select>
</div>


        {/* Accordion */}
        <Accordion type="multiple" className="w-full">
          {/* Tags */}
          <AccordionItem value="tags">
            <AccordionTrigger className="hover:no-underline">
              <span className="font-semibold">Tags</span>
              {selectedTagId && (
                <Badge className="ml-2 bg-blue-500 text-white">
                  1 selecionada
                </Badge>
              )}
            </AccordionTrigger>
            <AccordionContent>
              <div className="grid gap-4 m-1">
                <div className="flex flex-wrap gap-2">
                  {availableTags.map((tag) => {
                    const isDefault = DEFAULT_TAG_NAMES.includes(tag.name);
                    return (
                      <div
                        key={tag.id}
                        className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium transition-all relative hover:ring-1 ${
                          selectedTagId === tag.id
                            ? "ring-2 ring-offset-2 ring-blue-500"
                            : ""
                        }`}
                        style={{
                          backgroundColor: tag.color,
                          color: "white",
                          cursor: "default",
                        }}
                        onClick={() =>
                          setSelectedTagId(
                            selectedTagId === tag.id ? undefined : tag.id
                          )
                        }
                      >
                        <span>{tag.name}</span>
                        {!isDefault && (
                          <button
                            type="button"
                            className="transition ml-1 absolute top-0 right-0 -mt-1.5 -mr-1.5 p-1 rounded-full bg-sidebar-ring cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveTag(tag.id, tag.name);
                            }}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="flex gap-2">
                  <Input
                    placeholder="Adicionar nova tag"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddNewTag()}
                  />
                  <Button
                    onClick={handleAddNewTag}
                    disabled={!newTagName.trim()}
                    size="sm"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Sub-tarefas */}
          <AccordionItem value="subtasks">
            <AccordionTrigger className="hover:no-underline">
              <span className="font-semibold">
                Sub-tarefas
                {subTasksInput.length > 0 && (
                  <Badge className="ml-2 bg-blue-500 text-white">
                    {subTasksInput.length}
                  </Badge>
                )}
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <div
                className={`grid ${subTasksInput.length > 0 ? "gap-4" : ""}`}
              >
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={subTasksInput.map((st) => st.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="flex flex-col gap-2">
                      {subTasksInput.map((st) => (
                        <SortableSubTaskItem
                          key={st.id}
                          subTask={st}
                          onRemove={handleRemoveSubTaskTemp}
                          onEditClick={handleEditSubTaskClick}
                          onSaveEdit={handleSaveEditedSubTask}
                          onCancelEdit={handleCancelEditSubTask}
                          isEditing={editingSubTaskId === st.id}
                          editingText={editingSubTaskText}
                          onEditingTextChange={setEditingSubTaskText}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>

                <div className="flex gap-2">
                  <Input
                    placeholder="Adicionar sub-tarefa"
                    value={subTaskInputText}
                    onChange={(e) => setSubTaskInputText(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && handleAddSubTaskTemp()
                    }
                  />
                  <Button
                    onClick={handleAddSubTaskTemp}
                    disabled={!subTaskInputText.trim()}
                    size="sm"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    );
  }
);

CardForm.displayName = "CardForm";
