import { useEffect, useId, useMemo, useState, type ChangeEvent } from "react";
import { ImagePlus, Send, X } from "lucide-react";
import { useCreatePostMutation } from "@/services/postApi";
import { useGetAuthedUserInfoQuery } from "@/services/authApi";
import { UserAvatar } from "../Profile/UserAvatar";

export default function CreatePost() {
  const [content, setContent] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const inputId = useId();
  const { data: user } = useGetAuthedUserInfoQuery();
  const previewUrls = useMemo(
    () => files.map((file) => URL.createObjectURL(file)),
    [files]
  );

  const [createPost, { isLoading }] = useCreatePostMutation();

  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  const handleFiles = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles) return;

    setFiles((prev) => [
      ...prev,
      ...Array.from(selectedFiles),
    ]);
  };

  const removeImage = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };


  const handleSubmit = async () => {
    if (!content.trim() && files.length === 0) return;

    const formData = new FormData();
    formData.append("content", content.trim());

    files.forEach((file) => {
      formData.append("media", file);
    });

    try {
      await createPost(formData).unwrap();
      setContent("");
      setFiles([]);
      setIsFocused(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="mx-3 mt-3">
      <div
        className={`overflow-hidden rounded-3xl border border-border bg-card/95 transition-all duration-300 ${isFocused ? "shadow-lg" : "shadow-sm hover:shadow-md"
          }`}
      >
        <div className="flex items-start gap-3 px-4 py-4">
          <UserAvatar profileData={user} size="lg" />

          <div className="min-w-0 flex-1">
            <textarea
              placeholder="What's happening?"
              className="min-h-28 w-full resize-none border-0 bg-transparent text-base leading-7 outline-none placeholder:text-muted-foreground"
              rows={4}
              value={content}
              onFocus={() => setIsFocused(true)}
              onChange={(e) => setContent(e.target.value)}
            />

            {files.length > 0 && (
              <div className="mt-3 grid grid-cols-2 gap-3">
                {files.map((file, i) => (
                  <div key={`${file.name}-${i}`} className="relative overflow-hidden rounded-2xl border border-border bg-muted/30 p-1">
                    <img
                      src={previewUrls[i]}
                      alt={`Post preview ${i + 1}`}
                      className="h-40 w-full rounded-xl object-cover"
                    />

                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute right-3 top-3 rounded-full bg-black/70 p-1 text-white transition hover:bg-black/85"
                      aria-label="Remove image"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-border bg-muted/25 px-3 py-2">
          <div className="flex items-center gap-2">
            <label
              htmlFor={inputId}
              className="inline-flex cursor-pointer items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-accent hover:text-foreground"
            >
              <ImagePlus className="h-4 w-4" />
              <span>{files.length > 0 ? "Add more media" : "Add media"}</span>
            </label>
            <input
              id={inputId}
              type="file"
              multiple
              hidden
              accept="image/*"
              onChange={handleFiles}
            />
          </div>

          <div className="flex items-center gap-2">
            {(isFocused || content || files.length > 0) && (
              <button
                type="button"
                onClick={() => {
                  setContent("");
                  setFiles([]);
                  setIsFocused(false);
                }}
                className="rounded-full px-4 py-2 text-sm font-semibold text-muted-foreground transition hover:bg-accent hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isLoading}
              >
                Clear
              </button>
            )}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading || (!content.trim() && files.length === 0)}
              className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              <Send className="h-4 w-4" />
              <span>{isLoading ? "Posting..." : "Post"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
