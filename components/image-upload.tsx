"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { X, Upload, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

interface UploadedImage {
  id: string
  file: File
  url: string
  name: string
}

interface ImageUploadProps {
  onImagesChange: (images: UploadedImage[]) => void
  maxImages?: number
}

export function ImageUpload({ onImagesChange, maxImages = 4 }: ImageUploadProps) {
  const [images, setImages] = useState<UploadedImage[]>([])
  const [dragActive, setDragActive] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const { toast } = useToast()

  const validateFile = (file: File): string | null => {
    // Check file type
    if (!file.type.startsWith("image/")) {
      return `${file.name} is not a valid image file`
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      return `${file.name} is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum size is 10MB`
    }

    // Check supported formats
    const supportedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]
    if (!supportedTypes.includes(file.type)) {
      return `${file.name} format not supported. Please use JPG, PNG, GIF, or WebP`
    }

    return null
  }

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = (error) => reject(error)
    })
  }

  const handleFiles = useCallback(
    async (files: FileList) => {
      setUploadError(null)
      const newImages: UploadedImage[] = []
      const errors: string[] = []
      const remainingSlots = maxImages - images.length

      if (files.length > remainingSlots) {
        setUploadError(`Can only upload ${remainingSlots} more image${remainingSlots !== 1 ? "s" : ""}`)
        return
      }

      for (const file of Array.from(files)) {
        const validationError = validateFile(file)
        if (validationError) {
          errors.push(validationError)
          continue
        }

        try {
          const id = Math.random().toString(36).substr(2, 9)
          const base64Url = await fileToBase64(file)
          newImages.push({ id, file, url: base64Url, name: file.name })
        } catch (error) {
          errors.push(`Failed to process ${file.name}`)
        }
      }

      if (errors.length > 0) {
        setUploadError(errors[0]) // Show first error
        toast({
          title: "Upload Error",
          description: `${errors.length} file${errors.length !== 1 ? "s" : ""} could not be uploaded`,
          variant: "destructive",
        })
        return
      }

      if (newImages.length > 0) {
        const updatedImages = [...images, ...newImages]
        setImages(updatedImages)
        onImagesChange(updatedImages)
        toast({
          title: "Upload Successful",
          description: `${newImages.length} image${newImages.length !== 1 ? "s" : ""} uploaded successfully`,
        })
      }
    },
    [images, maxImages, onImagesChange, toast],
  )

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFiles(e.dataTransfer.files)
      }
    },
    [handleFiles],
  )

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        handleFiles(e.target.files)
      }
    },
    [handleFiles],
  )

  const removeImage = useCallback(
    (id: string) => {
      const updatedImages = images.filter((img) => {
        if (img.id === id) {
          return false
        }
        return true
      })
      setImages(updatedImages)
      onImagesChange(updatedImages)
      setUploadError(null) // Clear any upload errors when removing images

      toast({
        title: "Image Removed",
        description: "Image has been removed from upload",
      })
    },
    [images, onImagesChange, toast],
  )

  return (
    <div className="w-full space-y-4">
      {/* Upload Error Display */}
      {uploadError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{uploadError}</AlertDescription>
        </Alert>
      )}

      {/* Upload Area */}
      <Card
        className={cn(
          "border-2 border-dashed transition-colors duration-200 cursor-pointer",
          dragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
          images.length >= maxImages && "opacity-50 cursor-not-allowed",
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="p-8 text-center">
          <input
            type="file"
            multiple
            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
            onChange={handleFileInput}
            className="hidden"
            id="file-upload"
            disabled={images.length >= maxImages}
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 rounded-full bg-muted">
                <Upload className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <p className="text-lg font-medium">
                  {images.length >= maxImages
                    ? `Maximum ${maxImages} images reached`
                    : "Drop images here or click to upload"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {images.length >= maxImages
                    ? "Remove an image to upload more"
                    : `Upload up to ${maxImages} images (JPG, PNG, GIF, WebP • Max 10MB each)`}
                </p>
              </div>
            </div>
          </label>
        </div>
      </Card>

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {images.map((image) => (
            <Card key={image.id} className="relative group overflow-hidden">
              <div className="aspect-square relative">
                <img src={image.url || "/placeholder.svg"} alt={image.name} className="w-full h-full object-cover" />
                <Button
                  size="sm"
                  variant="destructive"
                  className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeImage(image.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
              <div className="p-2">
                <p className="text-xs text-muted-foreground truncate" title={image.name}>
                  {image.name}
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Upload Status */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {images.length} of {maxImages} images uploaded
          {images.length > 0 && (
            <span className="ml-2">
              ({(images.reduce((total, img) => total + img.file.size, 0) / 1024 / 1024).toFixed(1)}MB total)
            </span>
          )}
        </span>
        {images.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setImages([])
              onImagesChange([])
              setUploadError(null)
              toast({
                title: "Images Cleared",
                description: "All images have been removed",
              })
            }}
          >
            Clear All
          </Button>
        )}
      </div>
    </div>
  )
}
