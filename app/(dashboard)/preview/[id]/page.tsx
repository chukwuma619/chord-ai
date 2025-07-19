import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Music, ArrowLeft, Download, Share2 } from "lucide-react"
import { PreviewClient } from "./preview-client"

interface PreviewPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function PreviewPage({ params }: PreviewPageProps) {
  const { id } = await params
  const supabase = await createClient()
  
  // Fetch the analysis from database
  const { data: analysis, error } = await supabase
    .from('analyses')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !analysis) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <ArrowLeft className="h-5 w-5" />
            <Music className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">ChordAI</span>
          </Link>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </nav>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Analysis Header */}
          <Card className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold">{analysis.filename}</h1>
                <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                  <span>Key: <strong className="text-foreground">{analysis.key}</strong></span>
                  <span>Tempo: <strong className="text-foreground">{analysis.tempo} BPM</strong></span>
                  <span>Chords: <strong className="text-foreground">{analysis.chords.length}</strong></span>
                  <span>Analyzed: <strong className="text-foreground">
                    {new Date(analysis.created_at).toLocaleDateString()}
                  </strong></span>
                </div>
              </div>
              <Link href="/upload">
                <Button variant="outline">
                  Upload New Song
                </Button>
              </Link>
            </div>
          </Card>

          {/* Main Content - Client Component for interactivity */}
          <PreviewClient analysis={analysis} />
        </div>
      </div>
    </div>
  )
} 