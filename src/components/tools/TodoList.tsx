'use client';
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2, Plus } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface Task {
  id: string;
  text: string;
  completed: boolean;
}

const TodoList: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskText, setNewTaskText] = useState<string>('');
  const [hasLoaded, setHasLoaded] = useState(false); // ✅ added
  const { toast } = useToast();

  // Load tasks from localStorage (only in browser)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedTasks = localStorage.getItem('todoListTasks');
      if (storedTasks) {
        try {
          setTasks(JSON.parse(storedTasks));
        } catch (e) {
          console.error('Failed to parse localStorage:', e);
        }
      }
      setHasLoaded(true); // ✅ now we know tasks are loaded
    }
  }, []);

  // Save tasks to localStorage whenever they change (but only after initial load)
  useEffect(() => {
    if (typeof window !== 'undefined' && hasLoaded) {
      localStorage.setItem('todoListTasks', JSON.stringify(tasks));
    }
  }, [tasks, hasLoaded]);

  const handleAddTask = (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    if (newTaskText.trim() === '') {
      toast({
        title: "Cannot add empty task",
        variant: "destructive"
      });
      return;
    }
    const newTask: Task = {
      id: Date.now().toString(),
      text: newTaskText.trim(),
      completed: false,
    };
    setTasks([...tasks, newTask]);
    setNewTaskText('');
  };

  const toggleTaskCompletion = (taskId: string) => {
    setTasks(
      tasks.map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const removeTask = (taskId: string) => {
    setTasks(tasks.filter(task => task.id !== taskId));
    toast({
      title: "Task removed",
    });
  };

  const clearAllTasks = () => {
    if (tasks.length === 0) {
      toast({ title: "No tasks to clear", variant: "default" });
      return;
    }
    setTasks([]);
    toast({
      title: "All tasks cleared",
    });
  };

  const completedTasks = tasks.filter(task => task.completed).length;
  const pendingTasks = tasks.length - completedTasks;

  return (
    <div className="space-y-6">
      <form onSubmit={handleAddTask} className="flex gap-2">
        <Input
          type="text"
          placeholder="Add a new task..."
          value={newTaskText}
          onChange={(e) => setNewTaskText(e.target.value)}
          className="flex-grow"
        />
        <Button type="submit" size="icon" aria-label="Add task">
          <Plus className="h-5 w-5" />
        </Button>
      </form>

      {tasks.length > 0 && (
        <div className="flex justify-between items-center text-sm text-muted-foreground">
          <span>{pendingTasks} pending, {completedTasks} completed</span>
          <Button variant="outline" size="sm" onClick={clearAllTasks}>Clear All</Button>
        </div>
      )}

      {tasks.length === 0 && <p className="text-center text-muted-foreground">No tasks yet. Add one above!</p>}

      <ul className="space-y-3">
        {tasks.map(task => (
          <li
            key={task.id}
            className={`flex items-center gap-3 p-3 rounded-md border transition-colors ${task.completed ? 'bg-muted/50 border-green-200 dark:border-green-700' : 'bg-card'
              }`}
          >
            <Checkbox
              id={`task-${task.id}`}
              checked={task.completed}
              onCheckedChange={() => toggleTaskCompletion(task.id)}
              aria-label={task.completed ? `Mark ${task.text} as pending` : `Mark ${task.text} as completed`}
            />
            <label
              htmlFor={`task-${task.id}`}
              className={`flex-grow cursor-pointer ${task.completed ? 'line-through text-muted-foreground' : ''}`}
            >
              {task.text}
            </label>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeTask(task.id)}
              aria-label={`Remove task ${task.text}`}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TodoList;
