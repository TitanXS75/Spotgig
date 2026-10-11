import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Trash2 } from 'lucide-react';

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  itemName?: string;
  actionLabel?: string;
  onConfirm: () => void | Promise<void>;
  isLoading?: boolean;
}

export function DeleteConfirmDialog({
  open,
  onOpenChange,
  title = 'Delete Project?',
  description,
  itemName,
  actionLabel = 'Delete',
  onConfirm,
  isLoading,
}: DeleteConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-[400px] rounded-2xl border border-border bg-card p-5 shadow-2xl gap-3">
        <AlertDialogHeader className="space-y-2 text-left sm:text-left">
          <div className="flex items-center justify-between gap-3">
            <AlertDialogTitle className="text-base sm:text-lg font-bold tracking-tight text-foreground">
              {title}
            </AlertDialogTitle>
            <div className="w-8 h-8 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center shrink-0">
              <Trash2 className="w-4 h-4" />
            </div>
          </div>
          <AlertDialogDescription className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {description ? (
              description
            ) : (
              <>
                Are you sure you want to permanently delete{' '}
                {itemName ? <span className="font-semibold text-foreground">"{itemName}"</span> : 'this item'}? This action cannot be undone.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-2 flex flex-row items-center justify-end gap-2">
          <AlertDialogCancel
            disabled={isLoading}
            className="h-8.5 rounded-lg border border-border bg-muted/40 hover:bg-muted text-xs font-semibold px-3 mt-0 cursor-pointer"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={isLoading}
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            className="h-8.5 rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90 text-xs font-semibold px-3.5 cursor-pointer"
          >
            {isLoading ? 'Processing...' : actionLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
