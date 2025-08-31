/* eslint-disable @next/next/no-img-element */
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/hooks/use-realtime-chat";
import {
  FileText,
  Image,
  Video,
  File,
  Download,
  Trash2,
  Flag,
} from "lucide-react";
import { Button } from "./ui/button";
import { useAuth } from "@/context/authContext";
import { useState } from "react";
import { chatService } from "@/lib/supabase/service/chat-service";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { toast } from "sonner";

interface ChatMessageItemProps {
  message: ChatMessage;
  isOwnMessage: boolean;
  showHeader: boolean;
  isSelfChat?: boolean;
  onDelete?: () => void;
}

const FileIcon = ({ type }: { type: string }) => {
  // eslint-disable-next-line jsx-a11y/alt-text
  if (type.startsWith("image/")) return <Image className="w-4 h-4" />;
  if (type.startsWith("video/")) return <Video className="w-4 h-4" />;
  if (type === "application/pdf") return <FileText className="w-4 h-4" />;
  if (type.includes("word") || type.includes("document"))
    return <FileText className="w-4 h-4" />;
  if (type.includes("sheet") || type.includes("excel"))
    return <FileText className="w-4 h-4" />;
  return <File className="w-4 h-4" />;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const FilePreview = ({ attachment }: { attachment: any }) => {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="flex items-center gap-2 p-2 bg-background/50 rounded-lg border">
      <FileIcon type={attachment.type} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{attachment.name}</p>
        <p className="text-xs text-muted-foreground">
          {formatFileSize(attachment.size || 0)}
        </p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6"
        onClick={() => window.open(attachment.url, "_blank")}
      >
        <Download className="w-3 h-3" />
      </Button>
    </div>
  );
};

export const ChatMessageItem = ({
  message,
  isOwnMessage,
  showHeader,
  isSelfChat = false,
  onDelete,
}: ChatMessageItemProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [showActions, setShowActions] = useState(false); // 👈 for mobile toggle

  const handleDelete = async () => {
    if (!user?.id) return;

    try {
      await chatService.deleteMessage(message.id, user.id);
      queryClient.invalidateQueries({ queryKey: ["messages"] });
      queryClient.invalidateQueries({ queryKey: ["activeChats", user.id] });
      onDelete?.();
    } catch (error) {
      console.error("Error deleting message:", error);
    }
    setShowDeleteModal(false);
  };

  const handleReport = async () => {
    if (!user?.id) return;

    try {
      await chatService.reportMessage(
        message.id,
        user.id,
        reportReason,
        reportDescription
      );
      setShowReportModal(false);
      setReportReason("");
      setReportDescription("");
      toast.success("Message reported successfully");
    } catch (error) {
      console.error("Error reporting message:", error);
    }
  };

  return (
    <>
      <div
        className={`flex mt-2 ${
          isOwnMessage ? "justify-end" : "justify-start"
        }`}
      >
        <div
          className={cn("max-w-[85%] w-fit flex flex-col gap-1", {
            "items-end": isOwnMessage,
          })}
        >
          {showHeader && !isSelfChat && (
            <div
              className={cn("flex items-center gap-2 text-xs px-3", {
                "justify-end flex-row-reverse": isOwnMessage,
              })}
            >
              <span className={"font-medium"}>{message.user.name}</span>
              <span className="text-foreground/50 text-xs">
                {new Date(message.createdAt).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })}
              </span>
            </div>
          )}

          <div
            className={cn(
              "py-2 px-3 rounded-xl text-sm w-fit group relative cursor-pointer",
              isOwnMessage
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-foreground"
            )}
            onClick={() => setShowActions((prev) => !prev)} // 👈 toggle actions on tap
          >
            {message.content && (
              <div className="mb-2 whitespace-pre-line">{message.content}</div>
            )}
            {message.attachments && message.attachments.length > 0 && (
              <div className="space-y-2">
                {message.attachments.map((attachment, index) => (
                  <div key={index}>
                    <FilePreview attachment={attachment} />
                    {attachment.type.startsWith("image/") && (
                      <img
                        src={attachment.url}
                        alt={attachment.name}
                        className="mt-2 rounded-lg max-w-full max-h-64 object-cover cursor-pointer"
                        onClick={() => window.open(attachment.url, "_blank")}
                      />
                    )}
                    {attachment.type.startsWith("video/") && (
                      <video
                        src={attachment.url}
                        controls
                        className="mt-2 rounded-lg max-w-full max-h-64"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}

            <div
              className={cn(
                "absolute flex gap-1 transition-opacity",
                isOwnMessage ? "-top-2 -right-4" : "-top-0 -left-4",
                // show on hover (desktop) OR if tapped (mobile)
                showActions
                  ? "opacity-100"
                  : "opacity-0 group-hover:opacity-100"
              )}
            >
              {isOwnMessage && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation(); // prevent toggle
                    setShowDeleteModal(true);
                  }}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              )}
              {!isOwnMessage && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation(); // prevent toggle
                    setShowReportModal(true);
                  }}
                >
                  <Flag className="w-3 h-3" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Message</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this message? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Report Modal */}
      <Dialog open={showReportModal} onOpenChange={setShowReportModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report Message</DialogTitle>
            <DialogDescription>
              Why are you reporting this message?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Reason</Label>
              <Select value={reportReason} onValueChange={setReportReason}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="spam">Spam</SelectItem>
                  <SelectItem value="harassment">Harassment</SelectItem>
                  <SelectItem value="inappropriate">
                    Inappropriate Content
                  </SelectItem>
                  <SelectItem value="misinformation">Misinformation</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Description (optional)</Label>
              <Input
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                placeholder="Additional details..."
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowReportModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleReport} disabled={!reportReason}>
              Report
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
