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
import { LogOut } from 'lucide-react';

interface SignOutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void | Promise<void>;
  isLoading?: boolean;
}

export function SignOutDialog({ open, onOpenChange, onConfirm, isLoading }: SignOutDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
        <AlertDialogHeader className="space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center">
            <LogOut className="w-6 h-6" />
          </div>
          <AlertDialogTitle className="text-xl font-bold tracking-tight text-foreground">
            Sign out of Spotgig?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-muted-foreground leading-relaxed">
            Are you sure you want to sign out? You will need to sign back in to apply for projects, submit requests, or manage your account.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-6 flex flex-row items-center justify-end gap-2.5">
          <AlertDialogCancel
            disabled={isLoading}
            className="rounded-xl border border-border bg-muted/50 hover:bg-muted text-sm font-semibold px-4 py-2 mt-0 cursor-pointer"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={isLoading}
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90 text-sm font-semibold px-4 py-2 cursor-pointer"
          >
            {isLoading ? 'Signing out...' : 'Sign Out'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
