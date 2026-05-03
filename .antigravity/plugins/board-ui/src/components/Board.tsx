'use client'

import { DndContext, DragEndEvent, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { useState } from 'react'
import { useBoardStore } from '@/store/board'
import { useBoardRealtime } from './BoardProvider'
import { Column } from './Column'
import { TaskCard } from './TaskCard'

const COLUMNS = [
  { id: 'pending', title: 'Todo', status: 'pending' as const },
  { id: 'running', title: 'In Progress', status: 'running' as const },
  { id: 'completed', title: 'Done', status: 'completed' as const },
]

export function Board() {
  const { tasks, moveTask } = useBoardStore()
  const { emit } = useBoardRealtime()
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  function handleDragStart(event: any) {
    setActiveId(event.active.id)
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveId(null)

    if (over && active.id !== over.id) {
      const taskId = active.id as string
      const newStatus = over.id as any
      
      moveTask(taskId, newStatus)
      emit('task:move', { taskId, newStatus })
    }
  }

  const activeTask = activeId ? tasks.find(t => t.id === activeId) : null

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-3 gap-4 h-full">
        {COLUMNS.map(column => (
          <Column
            key={column.id}
            id={column.id}
            title={column.title}
            tasks={tasks.filter(t => t.status === column.status)}
          />
        ))}
      </div>
    </DndContext>
  )
}
