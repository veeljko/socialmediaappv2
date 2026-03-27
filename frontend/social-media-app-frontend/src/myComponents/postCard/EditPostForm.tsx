import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PopUpComponent } from "../PopupComponents/PopUpComponent";
import type { Post } from "@/features/post/types";
import { useEffect, useId, useMemo, useState, type ChangeEvent } from "react";
import { ImagePlus, Save } from "lucide-react";
import { useUpdatePostMutation } from "@/services/postApi";

interface EditPostFormProps {
  isOpen: boolean;
  onClose: () => void;
  post: Post;
}

export function EditPostForm({ isOpen, onClose, post }: EditPostFormProps) {
  const [content, setContent] = useState(post.content ?? "");
  const [files, setFiles] = useState<File[]>([]);
  const [updatePost, { isLoading }] = useUpdatePostMutation();
  const inputId = useId();

  useEffect(() => {
    if (!isOpen) return;
    setContent(post.content ?? "");
    setFiles([]);
  }, [isOpen, post.content, post._id]);

  const previewUrls = useMemo(
    () => files.map((file) => URL.createObjectURL(file)),
    [files]
  );

  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  const handleFiles = (event: ChangeEvent<HTMLInputElement>) => {
    setFiles(Array.from(event.target.files ?? []));
  };

  const handleSubmit = async () => {
    const formData = new FormData();
    formData.append("content", content.trim());

    files.forEach((file) => {
      formData.append("media", file);
    });

    try {
      await updatePost({ post, formData }).unwrap();
      onClose();
    } catch (error) {
      console.error("Failed to update post", error);
    }
  };

  const canSave = Boolean(content.trim() || files.length > 0 || post.mediaUrls?.length);

  return (
    <PopUpComponent isOpen={isOpen} onClose={onClose}>
      <div className="px-6 py-8">
        <div className="mb-5 text-center">
          <p className="text-xl font-semibold tracking-tight">Edit post</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Update the text or replace the media for this post.
          </p>
        </div>

        <div className="space-y-4">
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Update your post..."
            className="min-h-36 w-full resize-none rounded-3xl border border-border bg-background px-4 py-3 text-sm shadow-sm outline-none transition focus:border-ring focus:ring-4 focus:ring-ring/20"
          />

          <div className="rounded-3xl border border-dashed border-border bg-muted/20 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium">Media</p>
                <p className="text-xs text-muted-foreground">
                  Leave this empty to keep current post images.
                </p>
              </div>
              <label
                htmlFor={inputId}
                className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium shadow-sm transition hover:bg-accent"
              >
                <ImagePlus className="h-4 w-4" />
                Replace media
              </label>
            </div>
            <Input
              id={inputId}
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={handleFiles}
            />

            {previewUrls.length > 0 ? (
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {previewUrls.map((url, index) => (
                  <img
                    key={`${url}-${index}`}
                    src={url}
                    alt="Post media preview"
                    className="aspect-square w-full rounded-2xl object-cover"
                  />
                ))}
              </div>
            ) : post.mediaUrls?.length ? (
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {post.mediaUrls.map((media) => (
                  <img
                    key={media.public_id}
                    src={media.secure_url}
                    alt="Current post media"
                    className="aspect-square w-full rounded-2xl object-cover opacity-90"
                  />
                ))}
              </div>
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
