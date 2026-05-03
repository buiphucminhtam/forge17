'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { TaskCard } from './TaskCard'

interface ColumnProps {
  id: string
  title: string
  tasks: any[]
}

export function Column({ id, title, tasks }: ColumnProps) {
  const { setNodeRef } = useDroppable({ id })

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-lg">{title}</h2>
        <span className="text-sm text-muted-foreground">
          {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
        </span>
      </div>
      
      <div
        ref={setNodeRef}
        className="flex-1 p-2 rounded-lg bg-secondary/50 min-h-[200px]"
      >
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-2">
            {tasks.map(task => (
              <TaskCard key={task.id} task={task} />
            ))}
            {tasks.length === 0 && (
              <div className="text-center text-muted-foreground py-8 text-sm">
                No tasks
              </div>
            )}
          </div>
        </SortableContext>
      </div>
    </div>
  )
}
