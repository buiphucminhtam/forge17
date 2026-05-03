'use client';

import { useState } from 'react';
import { Folder } from 'lucide-react';
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

interface AddWorkspaceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddWorkspaceModal({ open, onOpenChange }: AddWorkspaceModalProps) {
  const [name, setName] = useState('');
  const [path, setPath] = useState('');
  const [daemonPort, setDaemonPort] = useState('8765');
  const [boardPort, setBoardPort] = useState('3000');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log('Creating workspace:', { name, path, daemonPort, boardPort });
    setIsLoading(false);
    onOpenChange(false);

    // Reset form
    setName('');
    setPath('');
    setDaemonPort('8765');
    setBoardPort('3000');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Workspace</DialogTitle>
          <DialogDescription>
            Add a new workspace to manage from Multica Hub.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Workspace Name</Label>
            <Input
              id="name"
              placeholder="My Project"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="path">Path</Label>
            <div className="relative">
              <Folder className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
              <Input
                id="path"
                placeholder="~/dev/my-project"
                value={path}
                onChange={(e) => setPath(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="daemonPort">Daemon Port</Label>
              <Input
                id="daemonPort"
                type="number"
                value={daemonPort}
                onChange={(e) => setDaemonPort(e.target.value)}
                min="1024"
                max="65535"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="boardPort">Board Port</Label>
              <Input
                id="boardPort"
                type="number"
                value={boardPort}
                onChange={(e) => setBoardPort(e.target.value)}
                min="1024"
                max="65535"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Adding...' : 'Add Workspace'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
