import { useEffect, useId, useMemo, useState, type ChangeEvent } from "react";
import { ImagePlus, Send, X } from "lucide-react";
import { useCreateCommentMutation } from "@/services/commentApi";

type CommentInputProps = {
  postId: string;
  placeholder?: string;
  className?: string;
};

export default function CommentInput({
  postId,
  placeholder = "What are your thoughts?",
  className = "",
}: CommentInputProps) {
  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const inputId = useId();
  const previewUrl = useMemo(
    () => (image ? URL.createObjectURL(image) : null),
    [image]
  );

  const [createComment, { isLoading }] = useCreateCommentMutation();

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedImage = event.target.files?.[0] ?? null;
    setImage(selectedImage);
  };

  const clearImage = () => {
    setImage(null);
  };

  const resetForm = () => {
    setContent("");
    setImage(null);
    setIsFocused(false);
  };

  const handleSubmit = async () => {
    if (!content.trim() && !image) return;

    const formData = new FormData();
    formData.append("content", content.trim());

    if (image) {
      formData.append("media", image);
    }

    try {
      await createComment({ postId, formData }).unwrap();
      resetForm();
    } catch (error) {
      console.error("Failed to create comment", error);
    }
  };

  return (
    <div className={`my-6 mx-2 ${className}`.trim()}>
      <div
        className={`overflow-hidden rounded-3xl border bg-card transition-shadow duration-300 ${isFocused ? "shadow-lg" : "shadow-sm hover:shadow-md"}  border-border`}
      >
        <textarea
          placeholder={placeholder}
          className="w-full flex justify-center resize-none border-0 bg-transparent px-4 py-2 text-sm outline-none"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          onFocus={() => setIsFocused(true)}
        />

        {previewUrl && (
          <div className="px-4 pb-4">
            <div className="relative w-fit overflow-hidden rounded-2xl border border-border bg-muted/40 p-1">
            <img
              src={previewUrl}
              alt="Comment upload preview"
              className="h-36 w-36 rounded-xl object-cover"
            />
            <button
              type="button"
              onClick={clearImage}
              className="absolute right-2 top-2 rounded-full bg-black/70 p-1 text-white"
              aria-label="Remove image"
            >
              <X className="h-4 w-4" />
            </button>
            </div>
          </div>
        )}
        {isFocused && (
        <div className="flex items-center justify-between border-t border-border bg-muted/30 px-3 py-1">
            <div className="flex items-center gap-2">
              <label
                htmlFor={inputId}
                className="inline-flex cursor-pointer items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-accent hover:text-foreground"
            >
              <ImagePlus className="h-4 w-4" />
              <span>{image ? "Change image" : "Add image"}</span>
            </label>
            <input
              id={inputId}
              type="file"
              hidden
              accept="image/*"
              onChange={handleImageChange}
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={resetForm}
              
              className="rounded-full px-4 py-2 text-sm font-semibold text-muted-foreground transition hover:bg-accent hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading || (!content.trim() && !image)}
              className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              <Send className="h-4 w-4" />
              <span>{isLoading ? "Sending..." : "Comment"}</span>
            </button>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}
