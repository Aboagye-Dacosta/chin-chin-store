"use client";
import { useRef, useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Button } from "../ui/button";
import { Upload, X } from "lucide-react";
import { Flex } from "../ui/flex";

export interface FileInputProps
  extends Omit<React.ComponentProps<"input">, "type" | "onChange" | "onError"> {
  preview?: boolean;
  label?: string;
  accept?: string;
  maxSize?: number; // in bytes
  onFileChange?: (file: File | null) => void;
  onError?: (error: string) => void;
  showFileName?: boolean;
  allowRemove?: boolean;
  previewSize?: number;
}

export const FileInput = ({
  className,
  label = "Choose File",
  accept = "image/*",
  maxSize = 5 * 1024 * 1024, // 5MB default
  onFileChange,
  onError,
  showFileName = true,
  allowRemove = true,
  previewSize = 64,
  preview = true,
  value,
  ...props
}: Readonly<FileInputProps>) => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    typeof value === "string" ? value : null
  );
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const validateFile = useCallback(
    (file: File): string | null => {
      if (maxSize && file.size > maxSize) {
        return `File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`;
      }

      if (accept && !accept.includes("*")) {
        const acceptedTypes = accept.split(",").map((type) => type.trim());
        const isValidType = acceptedTypes.some((type) => {
          if (type.startsWith(".")) {
            return file.name.toLowerCase().endsWith(type.toLowerCase());
          }
          return new RegExp(type.replace("*", ".*")).exec(file.type);
        });

        if (!isValidType) {
          return `File type not supported. Accepted types: ${accept}`;
        }
      }

      return null;
    },
    [accept, maxSize]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      setError(null);

      if (!selectedFile) {
        setFile(null);
        setPreviewUrl(null);
        onFileChange?.(null);
        return;
      }

      const validationError = validateFile(selectedFile);
      if (validationError) {
        setError(validationError);
        onError?.(validationError);

        if (inputRef.current) {
          inputRef.current.value = "";
        }
        return;
      }

      setFile(selectedFile);
      onFileChange?.(selectedFile);

      if (preview && selectedFile.type.startsWith("image/")) {
        if (previewUrl?.startsWith("blob:")) {
          URL.revokeObjectURL(previewUrl);
        }
        const newUrl = URL.createObjectURL(selectedFile);
        setPreviewUrl(newUrl);
      } else {
        setPreviewUrl(null);
      }
    },
    [validateFile, onFileChange, onError, preview, previewUrl]
  );

  const handleRemove = useCallback(() => {
    setFile(null);
    setPreviewUrl(null);
    setError(null);
    onFileChange?.(null);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }, [onFileChange]);

  const handleButtonClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const hasFile = file || previewUrl;

  return (
    <Flex direction="col" align="start" gap="lg">
      <Flex className={cn("w-full", className)} align="center" gap="md">
        <input
          {...props}
          data-testid="file-input"
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          hidden
          aria-describedby={error ? `${props.id}-error` : undefined}
        />

        <Button
          type="button"
          size="sm"
          onClick={handleButtonClick}
          disabled={props.disabled}
          aria-label={label}
        >
          <Flex direction="row" gap={"sm"} align="center">
            <Upload className="text-neutral-100" size={20} />
            <span>{label}</span>
          </Flex>
        </Button>

        {hasFile && preview && previewUrl && (
          <div className="relative">
            <div className="flex items-center border-2 border-neutral-200 rounded-md overflow-hidden">
              <Image
                src={previewUrl}
                alt={file?.name ?? "Preview"}
                className="object-cover"
                style={{
                  width: `${previewSize}px`,
                  height: `${previewSize}px`,
                }}
              />
            </div>

            {allowRemove && (
              <Button
                type="button"
                size="sm"
                variant="secondary"
                className="absolute -top-2 -right-2 h-24 w-24 rounded-full p-0"
                onClick={handleRemove}
                aria-label="Remove file"
              >
                <X size={12} />
              </Button>
            )}
          </div>
        )}
      </Flex>

      {file && showFileName && (
        <span className="text-sm text-neutral-600">{file.name}</span>
      )}

      {error && (
        <span
          id={`${props.id}-error`}
          className="text-sm text-red-500"
          role="alert"
        >
          {error}
        </span>
      )}
    </Flex>
  );
};
