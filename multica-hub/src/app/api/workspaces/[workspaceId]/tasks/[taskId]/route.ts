import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ workspaceId: string; taskId: string }> }
) {
  try {
    const { taskId } = await params;
    const body = await request.json();

    const task = await prisma.task.update({
      where: { id: taskId },
      data: {
        ...body,
        completedAt: body.status === 'done' ? new Date() : undefined,
      },
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error('Failed to update task:', error);
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ workspaceId: string; taskId: string }> }
) {
  try {
    const { taskId } = await params;

    await prisma.task.delete({
      where: { id: taskId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete task:', error);
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
  }
}
