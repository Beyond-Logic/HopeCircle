// components/ConfirmDeleteModal.tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ConfirmDeleteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "post" | "comment" | "reply";
  onConfirm: () => void;
  loading?: boolean;
}

export default function ConfirmDeletePostModal({
  open,
  onOpenChange,
  type,
  onConfirm,
  loading,
}: ConfirmDeleteModalProps) {
  const typeLabel =
    type === "post" ? "post" : type === "comment" ? "comment" : "reply";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete {typeLabel}</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this {typeLabel}? This action cannot
            be undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={loading}>
            {loading ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
