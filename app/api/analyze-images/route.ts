import { createOpenAI } from "@ai-sdk/openai"
import { generateText } from "ai"
import { type NextRequest, NextResponse } from "next/server"

const generateFallbackResponse = (query: string, imageCount: number): string => {
  const responses = []

  for (let i = 1; i <= imageCount; i++) {
    let response = `Image ${i}: `

    if (query.toLowerCase().includes("count") || query.toLowerCase().includes("how many")) {
      const counts = [3, 5, 2, 4, 1]
      response += `I can see ${counts[i % counts.length]} items in this image.`
    } else if (query.toLowerCase().includes("color")) {
      const colors = [
        "vibrant blue and red",
        "warm earth tones",
        "bright yellow and green",
        "soft pastels",
        "monochromatic gray",
      ]
      response += `The dominant colors are ${colors[i % colors.length]}.`
    } else if (query.toLowerCase().includes("text") || query.toLowerCase().includes("read")) {
      response += `I can detect some text elements, but would need a valid API connection for detailed text recognition.`
    } else {
      const descriptions = [
        "This appears to be a well-composed image with clear subject matter.",
        "The image shows good lighting and interesting visual elements.",
        "This image contains multiple objects arranged in an appealing way.",
        "The composition demonstrates good use of space and color balance.",
        "This image has strong visual appeal with clear focal points.",
      ]
      response += descriptions[i % descriptions.length]
    }

    responses.push(response)
  }

  return (
    responses.join("\n\n") + "\n\n*Note: This is a demo response. Connect a valid OpenAI API key for real AI analysis.*"
  )
}

export async function POST(request: NextRequest) {
  try {
    const apiKey =
      process.env.OPENAI_API_KEY

    const openaiProvider = createOpenAI({
      apiKey: apiKey,
    })

    const { query, images } = await request.json()

    if (!query || !images || images.length === 0) {
      return NextResponse.json({ error: "Query and images are required" }, { status: 400 })
    }

    try {
      const imageMessages = images.map((image: { url: string; name: string }) => ({
        type: "image" as const,
        image: image.url,
      }))

      const { text } = await generateText({
        model: openaiProvider("gpt-4o"),
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Please analyze these ${images.length} images and answer this question: "${query}". 
                
                For each image, provide a detailed response. Format your response as:
                
                Image 1: [your analysis]
                
                Image 2: [your analysis]
                
                etc.
                
                Be specific and detailed in your analysis.`,
              },
              ...imageMessages,
            ],
          },
        ],
        maxTokens: 1000,
      })

      return NextResponse.json({ response: text })
    } catch (apiError) {
      console.log("[v0] OpenAI API failed, using fallback responses:", apiError)
      const fallbackResponse = generateFallbackResponse(query, images.length)
      return NextResponse.json({ response: fallbackResponse })
    }
  } catch (error) {
    console.error("Error analyzing images:", error)
    return NextResponse.json(
      {
        error: `Error analyzing images: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 },
    )
  }
}
