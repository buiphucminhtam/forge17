'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { HubHeader } from '@/components/hub/HubHeader';
import { HubSidebar } from '@/components/hub/HubSidebar';
import { WorkspaceGrid } from '@/components/workspace/WorkspaceGrid';
import { GlobalStats } from '@/components/hub/GlobalStats';
import { EnvironmentStatus } from '@/components/hub/EnvironmentStatus';
import { AddWorkspaceModal } from '@/components/workspace/AddWorkspaceModal';
import { Button } from '@/components/ui/button';

export default function HubPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      <HubHeader />

      <div className="flex flex-1">
        <HubSidebar />

        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-semibold text-text-primary">Workspaces</h2>
                <p className="text-sm text-text-muted mt-1">
                  Manage all your workspaces from one place
                </p>
              </div>
              <Button onClick={() => setIsAddModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Workspace
              </Button>
            </div>

            <GlobalStats />
            <div className="mb-6">
              <EnvironmentStatus />
            </div>
            <WorkspaceGrid />
          </div>
        </main>
      </div>

      <AddWorkspaceModal open={isAddModalOpen} onOpenChange={setIsAddModalOpen} />
    </div>
  );
}
