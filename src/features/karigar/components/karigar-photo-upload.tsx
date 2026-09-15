"use client";

/**
 * Karigar Photo Upload
 * 
 * FEATURES:
 * - Camera capture (mobile)
 * - Gallery picker
 * - Image compression (browser)
 * - Cloudinary upload (signed)
 * - Preview + Remove
 * - Loading states
 * - Error handling
 * 
 * FLOW:
 * 1. User picks file (camera or gallery)
 * 2. Compress client-side (browser-image-compression)
 * 3. Send to Cloudinary (unsigned preset OR server action)
 * 4. Get back URL + public_id
 * 5. Call onUpload callback with { photoUrl, photoId }
 * 
 * USAGE:
 *   <KarigarPhotoUpload
 *     value={{ url, id }}
 *     onChange={(photo) => setValue("photoUrl", photo.url)}
 *     name={karigarName}
 *   />
 */

import { useRef, useState } from "react";
import imageCompression from "browser-image-compression";
import { Camera, Upload, X, Loader2, User, AlertCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn, getInitials } from "@/lib/utils";
import { UPLOAD } from "@/config/constants";

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

export interface PhotoValue {
  url: string | null;
  id: string | null;
}

interface KarigarPhotoUploadProps {
  /** Current photo value */
  value?: PhotoValue;
  /** Called when photo changes */
  onChange: (value: PhotoValue) => void;
  /** Karigar name (for initials fallback) */
  name?: string;
  /** Disabled state */
  disabled?: boolean;
}

// ═══════════════════════════════════════════════════════════
// CLOUDINARY CONFIG (Unsigned Upload)
// ═══════════════════════════════════════════════════════════

const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

// ═══════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════

export function KarigarPhotoUpload({
  value,
  onChange,
  name,
  disabled = false,
}: KarigarPhotoUploadProps) {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string>("");
  const [progress, setProgress] = useState(0);

  const initials = name ? getInitials(name) : "?";
  const hasPhoto = !!value?.url;

  // ═══════════════════════════════════════════
  // FILE HANDLER
  // ═══════════════════════════════════════════
  const handleFile = async (file: File) => {
    setError("");

    // ─────────────────────────────────────
    // VALIDATE
    // ─────────────────────────────────────
    if (!UPLOAD.ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setError("Please upload a JPG, PNG, or WebP image");
      return;
    }

    if (file.size > UPLOAD.MAX_FILE_SIZE) {
      setError(`Image too large. Max ${UPLOAD.MAX_FILE_SIZE / 1024 / 1024}MB`);
      return;
    }

    // ─────────────────────────────────────
    // COMPRESS
    // ─────────────────────────────────────
    setIsUploading(true);
    setProgress(20);

    try {
      const compressedFile = await imageCompression(file, {
        maxSizeMB: 0.5,
        maxWidthOrHeight: UPLOAD.MAX_IMAGE_WIDTH,
        useWebWorker: true,
        initialQuality: UPLOAD.COMPRESSION_QUALITY,
      });

      setProgress(50);

      // ─────────────────────────────────────
      // UPLOAD TO CLOUDINARY (Unsigned)
      // ─────────────────────────────────────
      if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
        throw new Error(
          "Cloudinary not configured. Please contact support."
        );
      }

      const formData = new FormData();
      formData.append("file", compressedFile);
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
      formData.append("folder", UPLOAD.CLOUDINARY_FOLDER);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      setProgress(80);

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData?.error?.message || "Upload failed");
      }

      const data = await response.json();

      // ─────────────────────────────────────
      // CALLBACK
      // ─────────────────────────────────────
      onChange({
        url: data.secure_url,
        id: data.public_id,
      });

      setProgress(100);
    } catch (err) {
      console.error("[Photo Upload] Error:", err);
      const message =
        err instanceof Error ? err.message : "Failed to upload photo";
      setError(message);
    } finally {
      setIsUploading(false);
      setProgress(0);
      // Reset inputs
      if (cameraInputRef.current) cameraInputRef.current.value = "";
      if (galleryInputRef.current) galleryInputRef.current.value = "";
    }
  };

  // ═══════════════════════════════════════════
  // REMOVE HANDLER
  // ═══════════════════════════════════════════
  const handleRemove = () => {
    onChange({ url: null, id: null });
    setError("");
  };

  // ═══════════════════════════════════════════
  // INPUT CHANGE
  // ═══════════════════════════════════════════
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="space-y-3">
      
      {/* ═══════════════════════════════════════════ */}
      {/* PHOTO PREVIEW */}
      {/* ═══════════════════════════════════════════ */}
      <div className="flex items-center gap-4">
        
        {/* Avatar */}
        <div className="relative">
          <Avatar className="h-20 w-20 ring-2 ring-white shadow-md">
            {value?.url ? (
              <AvatarImage src={value.url} alt={name || "Karigar"} />
            ) : null}
            <AvatarFallback className="bg-slate-100 text-slate-500 text-lg font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>

          {/* Uploading Overlay */}
          {isUploading && (
            <div className="absolute inset-0 rounded-full bg-slate-900/70 flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-white animate-spin" />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex-1 space-y-2">
          <p className="text-sm font-medium text-slate-900">
            {hasPhoto ? "Change photo" : "Add photo"}
          </p>
          <p className="text-xs text-slate-500 leading-relaxed">
            JPG, PNG or WebP. Max {UPLOAD.MAX_FILE_SIZE / 1024 / 1024}MB.
            Auto-compressed.
          </p>

          {/* Buttons */}
          <div className="flex flex-wrap gap-2 pt-1">
            {/* Camera */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => cameraInputRef.current?.click()}
              disabled={disabled || isUploading}
              className="h-9"
            >
              <Camera className="w-3.5 h-3.5 mr-1.5" />
              Camera
            </Button>

            {/* Gallery */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => galleryInputRef.current?.click()}
              disabled={disabled || isUploading}
              className="h-9"
            >
              <Upload className="w-3.5 h-3.5 mr-1.5" />
              Upload
            </Button>

            {/* Remove */}
            {hasPhoto && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemove}
                disabled={disabled || isUploading}
                className="h-9 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <X className="w-3.5 h-3.5 mr-1.5" />
                Remove
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════ */}
      {/* PROGRESS BAR */}
      {/* ═══════════════════════════════════════════ */}
      {isUploading && progress > 0 && (
        <div className="space-y-1.5">
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-slate-900 transition-all duration-300 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-slate-500 text-center">
            Uploading... {progress}%
          </p>
        </div>
      )}

      {/* ═══════════════════════════════════════════ */}
      {/* ERROR */}
      {/* ═══════════════════════════════════════════ */}
      {error && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-100">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-red-700 leading-relaxed">{error}</p>
        </div>
      )}

      {/* ═══════════════════════════════════════════ */}
      {/* HIDDEN INPUTS */}
      {/* ═══════════════════════════════════════════ */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="user"
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled || isUploading}
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept={UPLOAD.ALLOWED_IMAGE_TYPES.join(",")}
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled || isUploading}
      />
    </div>
  );
}