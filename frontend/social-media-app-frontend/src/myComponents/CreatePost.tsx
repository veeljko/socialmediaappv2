import { useState, type ChangeEvent } from "react";
import { Camera } from "lucide-react";
// import { useCreatePostMutation } from "@/store/api/postApi";
import { useCreatePostMutation } from "@/services/postApi";

export default function CreatePost() {
  const [content, setContent] = useState("");
  const [files, setFiles] = useState<File[]>([]);

  const [createPost, { isLoading }] = useCreatePostMutation();

  const handleFiles = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setFiles((prev) => [
      ...prev,
      ...Array.from(files),
    ]);
  };

  const removeImage = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };


  const handleSubmit = async () => {
    if (!content.trim()) return;

    const formData = new FormData();
    formData.append("content", content);

    files.forEach((file) => {
      formData.append("media", file);
    });

    try {
      console.log(formData);
      await createPost(formData).unwrap();
      setContent("");
      setFiles([]);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className=" mx-3 shadow-xl border-1 mt-2 hover:shadow-2xl bg-background rounded-xl shadow p-4 space-y-4">

      <textarea
        placeholder="What's happening?"
        className="w-full resize-none outline-none text-lg"
        rows={5}
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />

      {files.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {files.map((file, i) => (
            <div key={i} className="relative">
              <img
                src={URL.createObjectURL(file)}
                className="w-full h-40 object-cover rounded-lg"
              />

              <button
                onClick={() => removeImage(i)}
                className="absolute top-1 right-1 bg-black/60 text-white px-2 rounded"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between">
        <label className="cursor-pointer text-blue-500 font-medium">
          <div className="flex gap-1">
            <Camera />
            <p>Add media</p>
          </div>
          <input
            type="file"
            multiple
            hidden
            accept="image/*"
            onChange={handleFiles}
          />
        </label>

        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="bg-blue-500 text-white px-3 py-0.5 rounded-lg disabled:opacity-50"
        >
          Post
          {isLoading ? "Posting..." : "Post"}
        </button>
      </div>
    </div>
  );
}