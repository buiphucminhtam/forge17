import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface HubHeaderProps {
  className?: string;
}

export function HubHeader({ className }: HubHeaderProps) {
  return (
    <header className={cn('border-b border-border bg-bg-secondary px-6 py-4', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-accent-primary flex items-center justify-center">
              <span className="text-white font-bold text-sm">MH</span>
            </div>
            <h1 className="text-xl font-semibold text-text-primary">Multica Hub</h1>
          </div>
          <span className="text-xs text-text-muted bg-bg-card px-2 py-1 rounded">
            v1.0.0
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <span className="h-2 w-2 rounded-full bg-status-online status-pulse"></span>
            <span>Connected</span>
          </div>
          <Button variant="outline" size="sm">
            Settings
          </Button>
        </div>
      </div>
    </header>
  );
}
