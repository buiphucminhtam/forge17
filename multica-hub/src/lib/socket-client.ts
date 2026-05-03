'use client';

import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useHubStore } from '@/store/hub-store';

let socket: Socket | null = null;

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const { setConnected, updateWorkspaceStatus } = useHubStore();

  useEffect(() => {
    if (!socket) {
      socket = io(process.env.NEXT_PUBLIC_HUB_URL || 'http://localhost:4000', {
        transports: ['websocket', 'polling'],
        autoConnect: true,
      });
    }

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to Hub');
      setConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from Hub');
      setConnected(false);
    });

    socket.on('workspace:status', (data: { id: string; status: 'online' | 'offline' | 'error' }) => {
      updateWorkspaceStatus(data.id, data.status);
    });

    return () => {
      // Don't disconnect on unmount - keep connection alive
    };
  }, [setConnected, updateWorkspaceStatus]);

  const emit = (event: string, data?: unknown) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    }
  };

  const subscribe = (event: string, handler: (...args: unknown[]) => void) => {
    socketRef.current?.on(event, handler);
    return () => {
      socketRef.current?.off(event, handler);
    };
  };

  return { emit, subscribe, socket: socketRef.current };
}

// Daemon connection manager
export function useDaemonConnection(workspaceId: string, daemonPort: number) {
  const daemonSocketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!workspaceId || !daemonPort) return;

    const daemonSocket = io(`http://localhost:${daemonPort}`, {
      transports: ['websocket', 'polling'],
      timeout: 5000,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    daemonSocketRef.current = daemonSocket;

    daemonSocket.on('connect', () => {
      console.log(`Connected to daemon at port ${daemonPort}`);
      daemonSocket.emit('register', { workspaceId });
    });

    daemonSocket.on('task:created', (task: unknown) => {
      // Broadcast to hub
      socket?.emit('task:created', { workspaceId, task });
    });

    daemonSocket.on('task:updated', (data: { taskId: string; changes: unknown }) => {
      socket?.emit('task:updated', { workspaceId, ...data });
    });

    daemonSocket.on('task:moved', (data: { taskId: string; from: string; to: string }) => {
      socket?.emit('task:moved', { workspaceId, ...data });
    });

    daemonSocket.on('agent:heartbeat', (agent: unknown) => {
      socket?.emit('agent:heartbeat', { workspaceId, agent });
    });

    return () => {
      daemonSocket.disconnect();
    };
  }, [workspaceId, daemonPort]);

  return daemonSocketRef.current;
}
