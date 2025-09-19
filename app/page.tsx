"use client"

import type React from "react"

import { useState } from "react"
import { ImageUpload } from "@/components/image-upload"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Send, Bot, User, Search, Brain, MoreHorizontal, AlertCircle, ThumbsUp, ThumbsDown, Copy } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface UploadedImage {
  id: string
  file: File
  url: string
  name: string
}

interface ChatMessage {
  id: string
  type: "user" | "bot" | "error"
  content: string
  images?: UploadedImage[]
  timestamp: Date
}

export default function BatchQueryChatbot() {
  const [images, setImages] = useState<UploadedImage[]>([])
  const [query, setQuery] = useState("")
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const validateQuery = (queryText: string): string | null => {
    if (!queryText.trim()) {
      return "Please enter a question about your images"
    }
    if (queryText.length < 3) {
      return "Query must be at least 3 characters long"
    }
    if (queryText.length > 500) {
      return "Query must be less than 500 characters"
    }
    return null
  }

  const validateImages = (imageList: UploadedImage[]): string | null => {
    if (imageList.length === 0) {
      return "Please upload at least one image before asking a question"
    }
    if (imageList.length > 4) {
      return "Maximum 4 images allowed"
    }

    // Check file sizes (max 10MB per image)
    const oversizedImages = imageList.filter((img) => img.file.size > 10 * 1024 * 1024)
    if (oversizedImages.length > 0) {
      return `Image(s) too large: ${oversizedImages.map((img) => img.name).join(", ")}. Maximum size is 10MB per image.`
    }

    return null
  }

  const handleSendQuery = async () => {
    setError(null)

    // Validate query
    const queryError = validateQuery(query)
    if (queryError) {
      setError(queryError)
      return
    }

    // Validate images
    const imageError = validateImages(images)
    if (imageError) {
      setError(imageError)
      return
    }

    const userMessage: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      type: "user",
      content: query,
      images: images,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setIsProcessing(true)

    try {
      const response = await fetch("/api/analyze-images", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query,
          images: images.map((img) => ({
            url: img.url,
            name: img.name,
          })),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to analyze images")
      }

      const { response: aiResponse } = await response.json()

      const botMessage: ChatMessage = {
        id: Math.random().toString(36).substr(2, 9),
        type: "bot",
        content: aiResponse,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, botMessage])
      setQuery("")
      toast({
        title: "Analysis Complete",
        description: `Successfully analyzed ${images.length} image${images.length > 1 ? "s" : ""}`,
      })
    } catch (err) {
      const errorMessage: ChatMessage = {
        id: Math.random().toString(36).substr(2, 9),
        type: "error",
        content: err instanceof Error ? err.message : "An unexpected error occurred. Please try again.",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, errorMessage])
      toast({
        title: "Analysis Failed",
        description: "There was an error processing your request",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendQuery()
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: "Copied",
        description: "Response copied to clipboard",
      })
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Unable to copy to clipboard",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary text-primary-foreground">
              <Bot className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">BatchQuery Chatbot</h1>
              <p className="text-sm text-muted-foreground">AI-powered image analysis for e-commerce</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Search className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Brain className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Image Upload Section */}
        <Card className="p-6">
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold mb-2">Upload Product Images</h2>
              <p className="text-sm text-muted-foreground">
                Upload up to 4 images to analyze simultaneously with your query (max 10MB each)
              </p>
            </div>
            <ImageUpload onImagesChange={setImages} maxImages={4} />
          </div>
        </Card>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Chat Messages */}
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex gap-3 ${message.type === "user" ? "justify-end" : "justify-start"}`}>
              {(message.type === "bot" || message.type === "error") && (
                <div
                  className={`p-2 rounded-full shrink-0 ${
                    message.type === "error"
                      ? "bg-destructive text-destructive-foreground"
                      : "bg-primary text-primary-foreground"
                  }`}
                >
                  {message.type === "error" ? <AlertCircle className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>
              )}

              <div className={`max-w-2xl ${message.type === "user" ? "order-first" : ""}`}>
                <Card
                  className={`p-4 ${
                    message.type === "user"
                      ? "bg-primary text-primary-foreground"
                      : message.type === "error"
                        ? "bg-destructive/10 border-destructive"
                        : "bg-card"
                  }`}
                >
                  <div className="space-y-3">
                    {message.images && message.images.length > 0 && (
                      <div className="grid grid-cols-2 gap-2">
                        {message.images.map((img) => (
                          <div key={img.id} className="relative">
                            <img
                              src={img.url || "/placeholder.svg"}
                              alt={img.name}
                              className="w-full h-20 object-cover rounded border"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                    <p className="text-sm leading-relaxed whitespace-pre-line">{message.content}</p>

                    {message.type === "bot" && (
                      <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                        <Button variant="ghost" size="sm" className="h-6 px-2">
                          <ThumbsUp className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-6 px-2">
                          <ThumbsDown className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2"
                          onClick={() => copyToClipboard(message.content)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
                <p className="text-xs text-muted-foreground mt-1 px-1">{message.timestamp.toLocaleTimeString()}</p>
              </div>

              {message.type === "user" && (
                <div className="p-2 rounded-full bg-secondary text-secondary-foreground shrink-0">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          ))}

          {isProcessing && (
            <div className="flex gap-3 justify-start">
              <div className="p-2 rounded-full bg-primary text-primary-foreground shrink-0">
                <Bot className="h-4 w-4" />
              </div>
              <Card className="p-4 bg-card">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div
                      className="w-2 h-2 bg-primary rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <div
                      className="w-2 h-2 bg-primary rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground">Analyzing images...</span>
                </div>
              </Card>
            </div>
          )}
        </div>

        {/* Query Input */}
        <Card className="p-4">
          <div className="flex gap-3">
            <Input
              placeholder="Ask anything about your uploaded images..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                if (error) setError(null) // Clear error when user starts typing
              }}
              onKeyPress={handleKeyPress}
              disabled={isProcessing}
              className="flex-1"
              maxLength={500}
            />
            <Button onClick={handleSendQuery} disabled={!query.trim() || images.length === 0 || isProcessing} size="sm">
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center justify-between mt-2">
            <div className="text-xs text-muted-foreground">
              {images.length === 0
                ? "Upload at least one image to start asking questions"
                : `${images.length}/4 images uploaded • ${query.length}/500 characters`}
            </div>
            {query.length > 450 && (
              <div className="text-xs text-amber-600">{500 - query.length} characters remaining</div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
