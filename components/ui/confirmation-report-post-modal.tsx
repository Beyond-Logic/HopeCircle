// components/ConfirmReportModal.tsx
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { postService } from "@/lib/supabase/service/post-service";
import { commentService } from "@/lib/supabase/service/comment-service";
import { toast } from "sonner";

interface ConfirmReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "post" | "comment" | "reply";
  targetId: string;
  userId: string;
}

export default function ConfirmReportModal({
  open,
  onOpenChange,
  type,
  targetId,
  userId,
}: ConfirmReportModalProps) {
  const [reason, setReason] = useState<string>("spam");
  const [description, setDescription] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const typeLabel =
    type === "post" ? "post" : type === "comment" ? "comment" : "reply";

  const handleReport = async () => {
    setLoading(true);

    let res;
    if (type === "post") {
      res = await postService.reportPost(
        targetId,
        userId,
        reason as
          | "spam"
          | "harassment"
          | "inappropriate_content"
          | "misinformation"
          | "other",
        description
      );
    } else {
      res = await commentService.reportComment(
        targetId,
        userId,
        reason,
        description
      );
    }

    setLoading(false);

    if (!res.error) {
      onOpenChange(false); // ✅ close modal on success
      setDescription("");
      setReason("spam");
      toast.success("Report sent")
    } else {
      console.error("Report failed:", res.error);
      toast(
        res.error.message.includes("duplicate")
          ? "You have already reported this content."
          : "Report failed. Please try again."
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report {typeLabel}</DialogTitle>
          <DialogDescription>
            Please select a reason and provide details if necessary.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Reason</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="spam">Spam</SelectItem>
                <SelectItem value="harassment">Harassment</SelectItem>
                <SelectItem value="inappropriate_content">
                  Inappropriate Content
                </SelectItem>
                <SelectItem value="misinformation">Misinformation</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Description (optional)</Label>
            <Textarea
              placeholder="Add extra details"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleReport}
            disabled={loading}
          >
            {loading ? "Reporting..." : "Report"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
