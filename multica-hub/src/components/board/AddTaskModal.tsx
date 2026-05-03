'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface AddTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (title: string, priority: 'low' | 'medium' | 'high' | 'urgent') => void;
}

const priorities = [
  { value: 'low', label: 'Low', color: 'text-status-online' },
  { value: 'medium', label: 'Medium', color: 'text-status-busy' },
  { value: 'high', label: 'High', color: 'text-priority-high' },
  { value: 'urgent', label: 'Urgent', color: 'text-white bg-priority-high' },
] as const;

export function AddTaskModal({ open, onOpenChange, onSubmit }: AddTaskModalProps) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 300));
    onSubmit(title.trim(), priority);
    setIsLoading(false);
    onOpenChange(false);
    setTitle('');
    setPriority('medium');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Task</DialogTitle>
          <DialogDescription>
            Create a new task in the Todo column.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="task-title">Task Title</Label>
            <Input
              id="task-title"
              placeholder="What needs to be done?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label>Priority</Label>
            <div className="grid grid-cols-4 gap-2">
              {priorities.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setPriority(p.value)}
                  className={cn(
                    'px-3 py-2 rounded-lg text-sm font-medium border transition-colors',
                    priority === p.value
                      ? 'border-accent-primary bg-accent-primary/10 text-accent-primary'
                      : 'border-border bg-bg-secondary text-text-secondary hover:border-accent-primary/50',
                    p.color,
                    priority === p.value && p.value === 'urgent' && 'text-white'
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !title.trim()}>
              {isLoading ? 'Creating...' : 'Create Task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
