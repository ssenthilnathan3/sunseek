"use client";
import { useState } from "react";
import { Camera, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

export function ImageUpload({
  onSuccess,
}: {
  onSuccess: (url: string) => void;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview the image
    const preview = URL.createObjectURL(file);
    setPreviewUrl(preview);

    // Upload logic
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const { url } = await res.json();
      onSuccess(url);
      toast.success("Image uploaded successfully!");
    } catch (error) {
      toast.error("Failed to upload image");
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden border-2 border-dashed border-gray-300 flex items-center justify-center">
        {previewUrl ? (
          <>
            <Image
              src={previewUrl}
              alt="Preview"
              className="object-cover w-full h-full"
            />
            <button
              type="button"
              onClick={() => setPreviewUrl(null)}
              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          </>
        ) : (
          <label className="flex flex-col items-center justify-center cursor-pointer p-4 text-center">
            <Camera className="w-8 h-8 mb-2 text-gray-400" />
            <span className="text-sm text-gray-500">
              {isUploading ? "Uploading..." : "Click to upload sunset photo"}
            </span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              disabled={isUploading}
            />
          </label>
        )}
      </div>
      {isUploading && (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Loader2 className="w-4 h-4 animate-spin" />
          Uploading...
        </div>
      )}
    </div>
  );
}
