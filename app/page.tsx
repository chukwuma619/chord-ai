import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Music, Upload, Search, Sparkles, ArrowRight, Play, Users, Shield } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Music className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">ChordAI</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-24 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
              Discover Chord Progressions
              <span className="text-primary"> with AI</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Upload any song and instantly get accurate chord progressions. 
              Perfect for musicians, producers, and music learners.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="gap-2">
                Start Free <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="#demo">
              <Button size="lg" variant="outline" className="gap-2">
                <Play className="h-4 w-4" /> Watch Demo
              </Button>
            </Link>
          </div>

          <div className="pt-8">
            <p className="text-sm text-muted-foreground mb-4">Trusted by musicians worldwide</p>
            <div className="flex items-center justify-center gap-8 opacity-50">
              <Users className="h-8 w-8" />
              <Shield className="h-8 w-8" />
              <Sparkles className="h-8 w-8" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Everything You Need</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Professional-grade chord detection powered by advanced AI algorithms
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card className="relative overflow-hidden">
            <CardHeader>
              <Upload className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Easy Upload</CardTitle>
              <CardDescription>
                Support for MP3, WAV, M4A, FLAC, and OGG formats. 
                Just drag and drop your audio files.
              </CardDescription>
            </CardHeader>
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16" />
          </Card>

          <Card className="relative overflow-hidden">
            <CardHeader>
              <Sparkles className="h-12 w-12 text-primary mb-4" />
              <CardTitle>AI Analysis</CardTitle>
              <CardDescription>
                State-of-the-art machine learning models detect key, 
                tempo, and chord progressions with high accuracy.
              </CardDescription>
            </CardHeader>
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16" />
          </Card>

          <Card className="relative overflow-hidden">
            <CardHeader>
              <Search className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Song Library</CardTitle>
              <CardDescription>
                Search through thousands of analyzed songs or contribute 
                your own to the community library.
              </CardDescription>
            </CardHeader>
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16" />
          </Card>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-muted/30 py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Get chord progressions in three simple steps
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  step: "1",
                  title: "Upload Your Song",
                  description: "Choose a song from your device or paste a YouTube link"
                },
                {
                  step: "2",
                  title: "AI Processing",
                  description: "Our AI analyzes the audio and detects chord progressions"
                },
                {
                  step: "3",
                  title: "View Results",
                  description: "See chords in timeline view with playback controls"
                }
              ].map((item, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                    {item.step}
                  </div>
                  <h3 className="font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-24">
        <Card className="max-w-4xl mx-auto bg-primary text-primary-foreground">
          <CardContent className="p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Start?</h2>
            <p className="text-lg mb-8 opacity-90">
              Join thousands of musicians using AI to understand music better
            </p>
            <Link href="/signup">
              <Button size="lg" variant="secondary" className="gap-2">
                Create Free Account <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Music className="h-6 w-6 text-primary" />
              <span className="font-semibold">ChordAI</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 ChordAI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
