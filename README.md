# BatchQuery Chatbot

An AI-powered image analysis chatbot built with Next.js that allows users to upload multiple images and ask questions about them simultaneously. Perfect for e-commerce product analysis, content moderation, and batch image processing.

![BatchQuery Chatbot](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o-green?style=for-the-badge&logo=openai)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)

## ✨ Features

- **Multi-Image Upload**: Upload up to 4 images simultaneously (max 10MB each)
- **AI-Powered Analysis**: Uses OpenAI's GPT-4o Vision model for intelligent image analysis
- **Batch Processing**: Ask questions about all uploaded images at once
- **Real-time Chat Interface**: Interactive chat-style interface with message history
- **Drag & Drop Support**: Easy file upload with drag-and-drop functionality
- **Smart Fallbacks**: Intelligent demo responses when API key is unavailable
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Dark Mode Support**: Built-in dark/light theme switching
- **File Validation**: Comprehensive file type and size validation
- **Error Handling**: Robust error handling with user-friendly messages

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm
- OpenAI API key (for real AI analysis)

### Installation

1. **Clone the repository**
   \`\`\`bash
   git clone <your-repo-url>
   cd batch-query-chatbot
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   pnpm install
   \`\`\`

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   \`\`\`env
   OPENAI_API_KEY=your_openai_api_key_here
   \`\`\`
   
   Or add the environment variable through your deployment platform (Vercel, etc.)

4. **Run the development server**
   \`\`\`bash
   pnpm run dev
   \`\`\`

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Configuration

### OpenAI API Key

To enable real AI-powered image analysis, you need to provide an OpenAI API key:

1. Get your API key from [OpenAI Platform](https://platform.openai.com/account/api-keys)
2. Add it to your environment variables as `OPENAI_API_KEY`
3. Ensure your OpenAI account has access to GPT-4o model and sufficient credits

### File Upload Limits

The application has the following default limits:
- **Maximum images**: 4 per query
- **File size limit**: 10MB per image
- **Supported formats**: JPG, PNG, GIF, WebP

These can be modified in the `ImageUpload` component.

## 📱 Usage

1. **Upload Images**: 
   - Drag and drop images onto the upload area
   - Or click to browse and select files
   - Upload up to 4 images at once

2. **Ask Questions**:
   - Type your question in the input field
   - Questions can be about colors, objects, text, counts, or general analysis
   - Press Enter or click Send

3. **View Results**:
   - The AI will analyze all uploaded images
   - Results are formatted per image for easy comparison
   - Copy responses to clipboard with one click

### Example Queries

- "What colors are dominant in these images?"
- "Count the number of products in each image"
- "Describe the main objects in these photos"
- "What text can you read in these images?"
- "Compare the lighting quality across these images"

## 🏗️ Project Structure

\`\`\`
├── app/
│   ├── api/
│   │   └── analyze-images/
│   │       └── route.ts          # OpenAI API integration
│   ├── globals.css               # Global styles and theme
│   ├── layout.tsx                # Root layout with fonts
│   └── page.tsx                  # Main chatbot interface
├── components/
│   ├── image-upload.tsx          # Image upload component
│   └── ui/                       # shadcn/ui components
├── hooks/
│   ├── use-mobile.tsx            # Mobile detection hook
│   └── use-toast.ts              # Toast notifications
├── lib/
│   └── utils.ts                  # Utility functions
└── README.md
\`\`\`

## 🛠️ Built With

- **[Next.js 15](https://nextjs.org/)** - React framework with App Router
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety and better DX
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[shadcn/ui](https://ui.shadcn.com/)** - Beautiful and accessible UI components
- **[OpenAI API](https://openai.com/api/)** - GPT-4o Vision model for image analysis

## 🔄 API Endpoints

### POST `/api/analyze-images`

Analyzes uploaded images using OpenAI's GPT-4o Vision model.

**Request Body:**
\`\`\`json
{
  "query": "What do you see in these images?",
  "images": [
    {
      "url": "data:image/jpeg;base64,...",
      "name": "image1.jpg"
    }
  ]
}
\`\`\`

**Response:**
\`\`\`json
{
  "response": "Image 1: I can see a product photo with good lighting..."
}
\`\`\`
