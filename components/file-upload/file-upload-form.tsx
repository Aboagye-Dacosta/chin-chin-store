"use client";

import type React from "react";

import { useRef, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, X } from "lucide-react";
import { fileUploadSchema, FileUploadType } from "@/schema/file-upload-schema";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Switch } from "../ui/switch";
import Image from "next/image";

export function FileUploadForm() {
  const ref = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const generateUploadUrl = useMutation(api.assets.generateUploadUrl);
  const addAsset = useMutation(api.assets.addAsset);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<FileUploadType>({
    resolver: zodResolver(fileUploadSchema),
    defaultValues: {
      isModel: false,
    },
  });

  const selectedFile = watch("file");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setValue("file", file);

      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setPreview(null);
      }
    }
  };

  const removeFile = () => {
    setValue("file", undefined as unknown as File);
    setPreview(null);
    const fileInput = document.getElementById("file-input") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const onSubmit = async (data: FileUploadType) => {
    try {
      startTransition(async () => {
        const uploadUrl = await generateUploadUrl();
        const response = await fetch(uploadUrl, {
          method: "POST",
          body: data.file,
        });

        if (!response.ok) {
          throw new Error("Failed to upload file");
        }

        const responseData = await response.json();
        const { storageId } = responseData;

        await addAsset({
          name: data.name,
          storageId: storageId as Id<"_storage">,
          isModel: data.isModel,
        });
      });

      reset();
      setPreview(null);

      if (ref.current) ref.current.value = "";
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  return (
    <Card className="w-full border-none shadow-none">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          File Upload
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="Enter a name for your file"
              className={errors.name ? "border-destructive" : ""}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="file-input">File</Label>
            <Input
              id="file-input"
              type="file"
              ref={ref}
              accept=".png,.jpg,.jpeg,.webp,.gif,.glb,.gltf"
              onChange={handleFileChange}
              className={errors.file ? "border-destructive" : ""}
            />
            {errors.file && (
              <p className="text-sm text-destructive">{errors.file.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="isModel">Is Model</Label>
            <Switch
              checked={watch("isModel")}
              onCheckedChange={(value) => {
                setValue("isModel", value as unknown as boolean);
              }}
              className={errors.isModel ? "border-destructive" : ""}
            />
            {errors.isModel && (
              <p className="text-sm text-destructive">
                {errors.isModel.message}
              </p>
            )}
          </div>

          {selectedFile && (
            <div className="space-y-2">
              <Label>Preview</Label>
              <div className="relative border border-border rounded-lg p-4">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={removeFile}
                  className="absolute top-2 right-2 h-6 w-6 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>

                {preview ? (
                  <div className="space-y-2">
                    <Image
                      width={200}
                      height={200}
                      src={preview || "/placeholder.svg"}
                      alt="Preview"
                      className="max-w-full h-32 object-contain rounded"
                    />
                    <p className="text-sm text-muted-foreground">
                      {selectedFile.name} (
                      {(selectedFile.size / 1024).toFixed(1)} KB)
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      {selectedFile.name} (
                      {(selectedFile.size / 1024).toFixed(1)} KB)
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Preview not available for this file type
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={isPending}
            loading={isPending}
          >
            Upload File
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
