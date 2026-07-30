"use client";

import { useEffect, useState } from "react";
import { getProjectTasks, createProjectTask, updateProjectTask, deleteProjectTask } from "@/config/projects.config";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, ArrowRight, ArrowLeft } from "lucide-react";
import { toast } from "react-hot-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

const ProjectKanbanTab = ({ projectId }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", description: "", priority: "media" });

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await getProjectTasks(projectId);
      if (response.status === "success") setTasks(response.data);
    } catch (error) {
      toast.error("Error al cargar tareas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [projectId]);

  const handleAddTask = async () => {
    if (!newTask.title) return toast.error("El título es obligatorio");
    try {
      const res = await createProjectTask({
        projectId,
        title: newTask.title,
        description: newTask.description,
        priority: newTask.priority || "media",
        status: "todo"
      });
      if (res.status === "success") {
        toast.success("Tarea agregada");
        setIsAddModalOpen(false);
        setNewTask({ title: "", description: "", priority: "media" });
        fetchTasks();
      }
    } catch (e) {
      toast.error("Error al crear tarea");
    }
  };

  const handleMoveTask = async (taskId, newStatus) => {
    try {
      await updateProjectTask(taskId, { status: newStatus });
      fetchTasks();
    } catch (e) {
      toast.error("Error al mover tarea");
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await deleteProjectTask(taskId);
      toast.success("Tarea eliminada");
      fetchTasks();
    } catch (e) {
      toast.error("Error al eliminar tarea");
    }
  };

  const columns = [
    { id: "todo", title: "Pendientes", color: "bg-slate-100 dark:bg-slate-800", borderColor: "border-slate-200 dark:border-slate-700" },
    { id: "in_progress", title: "En Progreso", color: "bg-blue-50 dark:bg-blue-950/30", borderColor: "border-blue-200 dark:border-blue-900" },
    { id: "done", title: "Completado", color: "bg-green-50 dark:bg-green-950/30", borderColor: "border-green-200 dark:border-green-900" },
  ];

  const getPriorityBadge = (priority) => {
    switch(priority) {
      case "alta": return <span className="px-2 py-0.5 text-[10px] uppercase font-bold rounded-full bg-red-100 text-red-700 border border-red-200">Alta</span>;
      case "baja": return <span className="px-2 py-0.5 text-[10px] uppercase font-bold rounded-full bg-blue-100 text-blue-700 border border-blue-200">Baja</span>;
      default: return <span className="px-2 py-0.5 text-[10px] uppercase font-bold rounded-full bg-amber-100 text-amber-700 border border-amber-200">Media</span>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Tablero de Tareas</h3>
        <Button onClick={() => setIsAddModalOpen(true)} size="sm">
          <Plus className="h-4 w-4 mr-2" /> Agregar Tarea
        </Button>
      </div>

      {loading ? (
        <p className="text-muted-foreground text-center py-8">Cargando tareas...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {columns.map(col => (
            <div key={col.id} className={`rounded-xl border ${col.borderColor} p-4 ${col.color} min-h-[500px] shadow-sm transition-all`}>
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-sm uppercase tracking-wider">{col.title}</h4>
                <span className="text-xs font-medium bg-background px-2 py-1 rounded-full border shadow-sm">
                  {tasks.filter(t => t.status === col.id).length}
                </span>
              </div>
              <div className="space-y-3">
                {tasks.filter(t => t.status === col.id).map(task => (
                  <Card key={task.id} className="shadow-sm hover:shadow-md transition-shadow cursor-grab border-l-4 border-l-primary group">
                    <CardHeader className="p-3 pb-1 flex flex-row items-start justify-between space-y-0">
                      <CardTitle className="text-sm font-semibold leading-tight pr-2">{task.title}</CardTitle>
                      {getPriorityBadge(task.priority)}
                    </CardHeader>
                    <CardContent className="p-3 pt-1 pb-2">
                      <p className="text-xs text-muted-foreground line-clamp-3">{task.description}</p>
                    </CardContent>
                    <CardFooter className="p-2 flex justify-between bg-muted/30 border-t rounded-b-lg">
                      <div className="flex gap-1">
                        {col.id === "in_progress" || col.id === "done" ? (
                          <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-background" onClick={() => handleMoveTask(task.id, col.id === "done" ? "in_progress" : "todo")}>
                            <ArrowLeft className="h-4 w-4" />
                          </Button>
                        ) : <div className="h-7 w-7" />}
                        {col.id === "todo" || col.id === "in_progress" ? (
                          <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-background" onClick={() => handleMoveTask(task.id, col.id === "todo" ? "in_progress" : "done")}>
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        ) : <div className="h-7 w-7" />}
                      </div>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10" onClick={() => handleDeleteTask(task.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nueva Tarea</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Título</label>
              <Input 
                placeholder="Ej. Revisar frenos" 
                value={newTask.title} 
                onChange={e => setNewTask({...newTask, title: e.target.value})} 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Descripción</label>
              <Textarea 
                placeholder="Detalles de la tarea..." 
                value={newTask.description} 
                onChange={e => setNewTask({...newTask, description: e.target.value})} 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Prioridad</label>
              <select 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={newTask.priority} 
                onChange={e => setNewTask({...newTask, priority: e.target.value})}
              >
                <option value="alta">Alta</option>
                <option value="media">Media</option>
                <option value="baja">Baja</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleAddTask}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectKanbanTab;
