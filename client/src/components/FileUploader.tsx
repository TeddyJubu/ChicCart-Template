import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, X, Image as ImageIcon } from "lucide-react";

interface FileUploaderProps {
  onUploadComplete: (url: string) => void;
  accept?: string;
  maxSize?: number; // in bytes
  className?: string;
  multiple?: boolean;
}

interface UploadedFile {
  file: File;
  preview: string;
  uploading: boolean;
  url?: string;
  error?: string;
}

export function FileUploader({
  onUploadComplete,
  accept = "image/*",
  maxSize = 10 * 1024 * 1024, // 10MB default
  className = "",
  multiple = false,
}: FileUploaderProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const validateFile = (file: File): string | null => {
    if (file.size > maxSize) {
      return `File size exceeds ${Math.round(maxSize / 1024 / 1024)}MB limit`;
    }

    if (accept !== "*/*" && !file.type.match(accept.replace("*", ".*"))) {
      return "Invalid file type";
    }

    return null;
  };

  const createFilePreview = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      } else {
        resolve(""); // No preview for non-image files
      }
    });
  };

  const uploadFile = async (fileData: UploadedFile, index: number) => {
    const formData = new FormData();
    formData.append("file", fileData.file);

    try {
      setFiles(prev => prev.map((f, i) => 
        i === index ? { ...f, uploading: true, error: undefined } : f
      ));

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Upload failed");
      }

      const result = await response.json();
      
      setFiles(prev => prev.map((f, i) => 
        i === index ? { ...f, uploading: false, url: result.url } : f
      ));

      onUploadComplete(result.url);
      
      toast({
        title: "Upload successful",
        description: `${fileData.file.name} has been uploaded`,
      });

    } catch (error: any) {
      const errorMessage = error.message || "Upload failed";
      
      setFiles(prev => prev.map((f, i) => 
        i === index ? { ...f, uploading: false, error: errorMessage } : f
      ));

      toast({
        title: "Upload failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleFileSelect = async (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const newFiles: UploadedFile[] = [];

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      const error = validateFile(file);
      
      if (error) {
        toast({
          title: "Invalid file",
          description: `${file.name}: ${error}`,
          variant: "destructive",
        });
        continue;
      }

      const preview = await createFilePreview(file);
      newFiles.push({
        file,
        preview,
        uploading: false,
      });
    }

    if (!multiple) {
      setFiles(newFiles);
    } else {
      setFiles(prev => [...prev, ...newFiles]);
    }

    // Auto-upload files
    const startIndex = multiple ? files.length : 0;
    newFiles.forEach((fileData, index) => {
      uploadFile(fileData, startIndex + index);
    });
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  return (
    <div className={`w-full ${className}`}>
      {/* File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />

      {/* Drop Zone */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragOver 
            ? "border-primary bg-primary/5" 
            : "border-gray-300 hover:border-gray-400"
          }
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="h-8 w-8 mx-auto mb-4 text-gray-400" />
        <p className="text-sm text-gray-600 mb-2">
          Click to upload or drag and drop files here
        </p>
        <p className="text-xs text-gray-400">
          {accept === "image/*" 
            ? `Images up to ${Math.round(maxSize / 1024 / 1024)}MB`
            : `Files up to ${Math.round(maxSize / 1024 / 1024)}MB`
          }
        </p>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="mt-4 space-y-3">
          {files.map((fileData, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 border rounded-lg bg-gray-50"
            >
              {/* Preview */}
              <div className="flex-shrink-0 w-12 h-12 bg-gray-200 rounded overflow-hidden">
                {fileData.preview ? (
                  <img
                    src={fileData.preview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="h-6 w-6 text-gray-400" />
                  </div>
                )}
              </div>

              {/* File Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {fileData.file.name}
                </p>
                <p className="text-xs text-gray-500">
                  {Math.round(fileData.file.size / 1024)} KB
                </p>
                {fileData.error && (
                  <p className="text-xs text-red-500 mt-1">
                    {fileData.error}
                  </p>
                )}
                {fileData.url && (
                  <p className="text-xs text-green-600 mt-1">
                    Upload complete
                  </p>
                )}
              </div>

              {/* Status */}
              <div className="flex-shrink-0">
                {fileData.uploading ? (
                  <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                ) : fileData.error ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => uploadFile(fileData, index)}
                  >
                    Retry
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeFile(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Simplified version for single image upload
export function ImageUploader({ 
  onUploadComplete, 
  className = "",
  currentImage,
}: { 
  onUploadComplete: (url: string) => void;
  className?: string;
  currentImage?: string;
}) {
  return (
    <div className={className}>
      {currentImage && (
        <div className="mb-4">
          <Label className="text-sm font-medium">Current Image</Label>
          <div className="mt-2 border rounded-lg overflow-hidden">
            <img
              src={currentImage}
              alt="Current"
              className="w-full h-48 object-cover"
            />
          </div>
        </div>
      )}
      
      <Label className="text-sm font-medium">
        {currentImage ? "Replace Image" : "Upload Image"}
      </Label>
      <div className="mt-2">
        <FileUploader
          onUploadComplete={onUploadComplete}
          accept="image/*"
          multiple={false}
        />
      </div>
    </div>
  );
}