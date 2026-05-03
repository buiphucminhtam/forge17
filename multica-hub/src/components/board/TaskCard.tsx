'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { IDEBadge } from '@/components/agent/IDEBadge';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignee?: { id: string; name: string; type: string };
  createdAt: string;
}

interface TaskCardProps {
  task: Task;
  isDragging?: boolean;
}

const priorityColors = {
  low: 'text-status-online bg-status-online/10',
  medium: 'text-status-busy bg-status-busy/10',
  high: 'text-priority-high bg-priority-high/10',
  urgent: 'text-white bg-priority-high',
};

export function TaskCard({ task, isDragging = false }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'bg-bg-card rounded-lg border border-border p-3 cursor-grab active:cursor-grabbing',
        'hover:border-accent-primary/50 transition-all duration-150',
        isDragging && 'opacity-50 shadow-xl',
        isSortableDragging && 'z-50'
      )}
    >
      <div className="flex items-start gap-2">
        <button
          {...attributes}
          {...listeners}
          className="p-1 -ml-1 text-text-muted hover:text-text-primary cursor-grab"
        >
          <GripVertical className="h-4 w-4" />
        </button>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-text-primary mb-2">{task.title}</p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'text-[10px] font-medium px-1.5 py-0.5 rounded uppercase',
                  priorityColors[task.priority]
                )}
              >
                {task.priority}
              </span>

              {task.assignee && (
                <IDEBadge agent={task.assignee} size="sm" />
              )}
            </div>

            <div className="flex items-center gap-1 text-text-muted">
              <Calendar className="h-3 w-3" />
              <span className="text-[10px]">
                {new Date(task.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
