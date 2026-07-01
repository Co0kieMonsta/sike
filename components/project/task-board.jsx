"use client";
import React, { useState, useEffect } from "react";
import { DndContext, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, GripVertical, Trash2 } from "lucide-react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { updateTask, deleteTask } from "@/action/task-action";
import toast from "react-hot-toast";

// Draggable Task Item
const TaskItem = ({ task, onDelete }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useDraggable({
        id: task.id,
        data: { ...task }
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="mb-3 touch-none">
            <Card className="cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow">
                <CardContent className="p-3">
                    <div className="flex justify-between items-start gap-2">
                        <span className="font-medium text-sm line-clamp-2">{task.title}</span>
                         <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 text-muted-foreground hover:text-destructive shrink-0"
                            onClick={(e) => {
                                e.stopPropagation(); // Prevent drag start on delete
                                onDelete(task.id);
                            }}
                             onPointerDown={(e) => e.stopPropagation()} 
                        >
                            <Trash2 className="h-3 w-3" />
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

// Droppable Column
const KanbanColumn = ({ id, title, tasks, onDeleteTask }) => {
    const { setNodeRef } = useDroppable({ id });

    return (
        <div className="flex-1 min-w-[300px] bg-muted/40 rounded-xl p-4 flex flex-col h-full">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-lg">{title}</h3>
                <Badge variant="secondary">{tasks.length}</Badge>
            </div>
            <div ref={setNodeRef} className="flex-1 overflow-y-auto min-h-[500px]">
                {tasks.map(task => (
                    <TaskItem key={task.id} task={task} onDelete={onDeleteTask} />
                ))}
                {tasks.length === 0 && (
                    <div className="h-24 border-2 border-dashed rounded-lg flex items-center justify-center text-muted-foreground text-sm">
                        Drop items here
                    </div>
                )}
            </div>
        </div>
    );
};

const TaskBoard = ({ tasks, projectId, onTaskUpdate }) => {
    const [localTasks, setLocalTasks] = useState(tasks);

    useEffect(() => {
        setLocalTasks(tasks);
    }, [tasks]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDragEnd = async (event) => {
        const { active, over } = event;

        if (!over) return;

        const activeId = active.id;
        const overId = over.id; // This is the column ID ("todo", "in-progress", "done")
        
        // Find the task being dragged
        const task = localTasks.find(t => t.id === activeId);
        
        if (task && task.status !== overId) {
            // Optimistic update
            const updatedTasks = localTasks.map(t => 
                t.id === activeId ? { ...t, status: overId } : t
            );
            setLocalTasks(updatedTasks);

            // Server update
            try {
                await updateTask(activeId, { status: overId });
                toast.success("Task updated");
                onTaskUpdate(); // Re-fetch to sync
            } catch (error) {
                toast.error("Failed to update task");
                // Revert only if needed, but fetch will fix it usually
                onTaskUpdate();
            }
        }
    };

    const handleDelete = async (id) => {
        if (confirm("Delete this task?")) {
            await deleteTask(id);
            toast.success("Task deleted");
            onTaskUpdate();
        }
    }

    return (
        <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
            <div className="flex gap-6 overflow-x-auto pb-4 h-[calc(100vh-250px)]">
                <KanbanColumn 
                    id="todo" 
                    title="To Do" 
                    tasks={localTasks.filter(t => t.status === "todo")} 
                    onDeleteTask={handleDelete}
                />
                <KanbanColumn 
                    id="in-progress" 
                    title="In Progress" 
                    tasks={localTasks.filter(t => t.status === "in-progress")} 
                    onDeleteTask={handleDelete}
                />
                 <KanbanColumn 
                    id="done" 
                    title="Done" 
                    tasks={localTasks.filter(t => t.status === "done")} 
                    onDeleteTask={handleDelete}
                />
            </div>
        </DndContext>
    );
};

export default TaskBoard;
