import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CommentCard } from "@/features/comment/types";
import { useUpdateCommentMutation } from "@/services/commentApi";
import { ImagePlus, Save } from "lucide-react";
import { useEffect, useId, useMemo, useState, type ChangeEvent } from "react";
import { PopUpComponent } from "../PopupComponents/PopUpComponent";

interface EditCommentFormProps {
  isOpen: boolean;
  onClose: () => void;
  comment: CommentCard;
}

function parseLockedMention(content: string) {
  const match = content.match(/^@([a-zA-Z0-9_]+)\s+(.*)$/s);

  if (!match) {
    return {
      mention: null,
      body: content,
    };
  }

  return {
    mention: match[1],
    body: match[2] ?? "",
  };
}

export function EditCommentForm({
  isOpen,
  onClose,
  comment,
}: EditCommentFormProps) {
  const initialParsedContent = useMemo(
    () => parseLockedMention(comment.content ?? ""),
    [comment.content]
  );
  const [content, setContent] = useState(initialParsedContent.body);
  const [image, setImage] = useState<File | null>(null);
  const [updateComment, { isLoading }] = useUpdateCommentMutation();
  const inputId = useId();
  const previewUrl = useMemo(
    () => (image ? URL.createObjectURL(image) : null),
    [image]
  );

  useEffect(() => {
    if (!isOpen) return;
    setContent(initialParsedContent.body);
    setImage(null);
  }, [comment._id, initialParsedContent.body, isOpen]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    setImage(event.target.files?.[0] ?? null);
  };

  const handleSubmit = async () => {
    const formData = new FormData();
    formData.append("content", content.trim());

    if (image) {
      formData.append("media", image);
    }

    try {
      await updateComment({ commentId: comment._id, formData }).unwrap();
      onClose();
    } catch (error) {
      console.error("Failed to update comment", error);
    }
  };

  const canSave = Boolean(content.trim() || image || comment.mediaUrl?.secure_url);

  return (
    <PopUpComponent isOpen={isOpen} onClose={onClose}>
      <div className="px-6 py-8">
        <div className="mb-5 text-center">
          <p className="text-xl font-semibold tracking-tight">Edit comment</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Update the text or replace the image for this comment.
          </p>
        </div>

        <div className="space-y-4">

          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Update your comment..."
            className="min-h-32 w-full resize-none rounded-3xl border border-border bg-background px-4 py-3 text-sm shadow-sm outline-none transition focus:border-ring focus:ring-4 focus:ring-ring/20"
          />

          <div className="rounded-3xl border border-dashed border-border bg-muted/20 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium">Image</p>
                <p className="text-xs text-muted-foreground">
                  Leave this empty to keep the current comment image.
                </p>
              </div>
              <label
                htmlFor={inputId}
                className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium shadow-sm transition hover:bg-accent"
              >
                <ImagePlus className="h-4 w-4" />
                Replace image
              </label>
            </div>
            <Input
              id={inputId}
              type="file"
              accept="image/*"
              hidden
              onChange={handleImageChange}
            />

            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Comment image preview"
                className="mt-4 h-40 w-40 rounded-2xl object-cover"
              />
            ) : comment.mediaUrl?.secure_url ? (
              <img
                src={comment.mediaUrl.secure_url}
                alt="Current comment image"
                className="mt-4 h-40 w-40 rounded-2xl object-cover opacity-90"
              />
            ) : null}
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isLoading || !canSave}>
              <Save className="h-4 w-4" />
              {isLoading ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </div>
      </div>
    </PopUpComponent>
  );
}
