
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, X } from "lucide-react";
import { Card, Priority, SubTask, Tag } from "@/hooks/useBoard";
import { useBoardContext } from "@/app/contexts/boardContext";

interface CardFormProps {
  initialData?: Card | null;
  columnId: "todo" | "doing" | "done";
  onSave: (data: {
    title: string;
    description?: string;
    priority: Priority;
    subTasks?: SubTask[];
    tagId?: string;
  }) => void;
  onCancel: () => void;
}

export const CardForm: React.FC<CardFormProps> = ({
  initialData,
  columnId,
  onSave,
  onCancel,
}) => {
  const [titleInput, setTitleInput] = useState(initialData?.title || "");
  const [descInput, setDescInput] = useState(initialData?.description || "");
  const [priority, setPriority] = useState<Priority>(initialData?.priority || "low");
  const [subTasksInput, setSubTasksInput] = useState<SubTask[]>(initialData?.subTasks || []);
  const [subTaskInputText, setSubTaskInputText] = useState("");
  const [selectedTagId, setSelectedTagId] = useState<string | undefined>(initialData?.tagId);
  const [newTagName, setNewTagName] = useState("");

  const { availableTags, addTag } = useBoardContext();

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
  }, [initialData]);

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

  const handleAddNewTag = () => {
    if (newTagName.trim()) {
      const existingTag = availableTags.find(tag => tag.name.toLowerCase() === newTagName.trim().toLowerCase());
      if (existingTag) {
        setSelectedTagId(existingTag.id);
      } else {
        const createdTag = addTag(newTagName.trim());
        setSelectedTagId(createdTag.id);
      }
      setNewTagName("");
    }
  };

  const handleSubmit = () => {
    if (!titleInput.trim()) return;
    onSave({
      title: titleInput,
      description: descInput,
      priority,
      subTasks: subTasksInput,
      tagId: selectedTagId,
    });
  };

  return (
    <div className="flex flex-col gap-6 p-4">
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

      <div className="grid gap-2">
        <Label htmlFor="description">Descrição (opcional)</Label>
        <Textarea
          id="description"
          placeholder="Detalhes da tarefa..."
          value={descInput}
          onChange={(e) => setDescInput(e.target.value)}
          rows={4}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="priority">Prioridade</Label>
        <Select value={priority} onValueChange={(value: Priority) => setPriority(value)}>
          <SelectTrigger id="priority">
            <SelectValue placeholder="Selecione a prioridade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Baixa</SelectItem>
            <SelectItem value="medium">Média</SelectItem>
            <SelectItem value="high">Alta</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label>Tags (opcional)</Label>
        <div className="flex flex-wrap gap-2">
          {availableTags.map((tag) => (
            <Badge
              key={tag.id}
              style={{ backgroundColor: tag.color, cursor: 'pointer' }}
              className={`text-white ${selectedTagId === tag.id ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`}
              onClick={() => setSelectedTagId(selectedTagId === tag.id ? undefined : tag.id)}
            >
              {tag.name}
            </Badge>
          ))}
          {selectedTagId && !availableTags.some(tag => tag.id === selectedTagId) && (
            <Badge
              style={{ backgroundColor: '#6B7280', cursor: 'pointer' }}
              className="text-white ring-2 ring-offset-2 ring-blue-500"
              onClick={() => setSelectedTagId(undefined)}
            >
              Tag Removida
            </Badge>
          )}
        </div>
        <div className="flex gap-2 mt-2">
          <Input
            placeholder="Criar nova tag..."
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddNewTag()}
          />
          <Button onClick={handleAddNewTag} disabled={!newTagName.trim()}><Plus className="h-4 w-4" /></Button>
        </div>
      </div>

      <div className="grid gap-2">
        <Label>Sub-tarefas (opcional)</Label>
        <div className="flex flex-col gap-2">
          {subTasksInput.map((st) => (
            <div
              key={st.id}
              className="flex items-center justify-between rounded-md bg-muted p-2"
            >
              <span>{st.title}</span>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => handleRemoveSubTaskTemp(st.id)}
                className="h-6 w-6"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Adicionar sub-tarefa"
            value={subTaskInputText}
            onChange={(e) => setSubTaskInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddSubTaskTemp()}
          />
          <Button onClick={handleAddSubTaskTemp} disabled={!subTaskInputText.trim()}><Plus className="h-4 w-4" /></Button>
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-4">
        <Button variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button onClick={handleSubmit}>{initialData ? "Salvar alterações" : "Adicionar tarefa"}</Button>
      </div>
    </div>
  );
};

