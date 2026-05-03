import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const workspaces = await prisma.workspace.findMany({
      include: {
        _count: {
          select: { tasks: true, agents: true },
        },
        tasks: {
          select: { status: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = workspaces.map((ws) => ({
      id: ws.id,
      name: ws.name,
      path: ws.path,
      daemonPort: ws.daemonPort,
      boardPort: ws.boardPort,
      status: ws.status,
      taskCounts: {
        todo: ws.tasks.filter((t) => t.status === 'todo').length,
        inProgress: ws.tasks.filter((t) => t.status === 'in_progress').length,
        review: ws.tasks.filter((t) => t.status === 'review').length,
        done: ws.tasks.filter((t) => t.status === 'done').length,
      },
      lastSeen: ws.lastSeen.toISOString(),
      createdAt: ws.createdAt.toISOString(),
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Failed to fetch workspaces:', error);
    return NextResponse.json({ error: 'Failed to fetch workspaces' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, path, daemonPort, boardPort } = body;

    if (!name || !path) {
      return NextResponse.json({ error: 'Name and path are required' }, { status: 400 });
    }

    const workspace = await prisma.workspace.create({
      data: {
        name,
        path,
        daemonPort: daemonPort || 8765,
        boardPort: boardPort || 3000,
        status: 'offline',
      },
    });

    return NextResponse.json(workspace, { status: 201 });
  } catch (error) {
    console.error('Failed to create workspace:', error);
    return NextResponse.json({ error: 'Failed to create workspace' }, { status: 500 });
  }
}
