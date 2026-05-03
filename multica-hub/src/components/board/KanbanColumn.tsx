'use client';

import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { TaskCard } from './TaskCard';
import { cn } from '@/lib/utils';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  assignee?: { id: string; name: string; type: string };
  createdAt: string;
}

interface KanbanColumnProps {
  id: string;
  title: string;
  color: string;
  tasks: Task[];
}

export function KanbanColumn({ id, title, color, tasks }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'bg-bg-secondary rounded-xl border border-border flex flex-col',
        isOver && 'ring-2 ring-accent-primary/50 bg-accent-primary/5'
      )}
    >
      {/* Column Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className={cn('font-medium', color)}>{title}</h3>
            <span className="text-xs text-text-muted bg-bg-card px-2 py-0.5 rounded-full">
              {tasks.length}
            </span>
          </div>
        </div>
      </div>

      {/* Tasks */}
      <div className="flex-1 p-3 space-y-3 overflow-y-auto">
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div className="text-center py-8 text-text-muted text-sm">
            No tasks
          </div>
        )}
      </div>
    </div>
  );
}
