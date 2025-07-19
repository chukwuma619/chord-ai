import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Music, Upload, Youtube, Play, Zap, Heart, ArrowRight, CheckCircle } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Music className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">ChordAI</span>
          </div>
          
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/signup">
              <Button>Get Started Free</Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Youtube className="h-4 w-4" />
              Now with YouTube Support!
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              AI-Powered Chord Detection for Any Song
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Upload audio files or analyze YouTube videos to get accurate chord progressions with interactive timelines. 
              Completely free with no restrictions.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/signup">
              <Button size="lg" className="h-12 px-8">
                <Play className="h-5 w-5 mr-2" />
                Start Analyzing Free
              </Button>
            </Link>
            <Link href="/upload">
              <Button size="lg" variant="outline" className="h-12 px-8">
                <Youtube className="h-5 w-5 mr-2" />
                Try YouTube Analysis
              </Button>
            </Link>
          </div>

          {/* Quick Demo */}
          <div className="bg-muted/30 rounded-lg p-8 max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold mb-4">How It Works</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-xs">1</div>
                <span>Upload file or paste YouTube URL</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-xs">2</div>
                <span>AI analyzes chord progressions</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-xs">3</div>
                <span>Interactive timeline & playback</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/20">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need</h2>
            <p className="text-xl text-muted-foreground">Professional chord analysis tools, completely free</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader>
                <Youtube className="h-12 w-12 text-red-500 mb-4" />
                <CardTitle>YouTube Integration</CardTitle>
                <CardDescription>
                  Analyze any YouTube video directly - just paste the URL and we&apos;ll handle the rest
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader>
                <Upload className="h-12 w-12 text-blue-500 mb-4" />
                <CardTitle>File Upload</CardTitle>
                <CardDescription>
                  Support for MP3, WAV, M4A, FLAC, and OGG files up to 50MB
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader>
                <Zap className="h-12 w-12 text-yellow-500 mb-4" />
                <CardTitle>AI-Powered Analysis</CardTitle>
                <CardDescription>
                  Advanced chord detection with confidence scores and accurate timing
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader>
                <Play className="h-12 w-12 text-green-500 mb-4" />
                <CardTitle>Interactive Player</CardTitle>
                <CardDescription>
                  Waveform visualization, tempo control, looping, and chord synchronization
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader>
                <Music className="h-12 w-12 text-purple-500 mb-4" />
                <CardTitle>Advanced Tools</CardTitle>
                <CardDescription>
                  Transpose, capo simulation, chord simplification, and key detection
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader>
                <Heart className="h-12 w-12 text-pink-500 mb-4" />
                <CardTitle>Completely Free</CardTitle>
                <CardDescription>
                  No subscriptions, no limits, no hidden costs - all features included
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Why Free Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">Why Completely Free?</h2>
          
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <Card className="p-6 text-left">
              <CheckCircle className="h-8 w-8 text-green-500 mb-4" />
              <h3 className="text-xl font-semibold mb-3">For Musicians</h3>
              <p className="text-muted-foreground">
                Music should be accessible to everyone. Whether you&apos;re learning, teaching, or creating, 
                you shouldn&apos;t need to pay for basic chord analysis tools.
              </p>
            </Card>
            
            <Card className="p-6 text-left">
              <CheckCircle className="h-8 w-8 text-green-500 mb-4" />
              <h3 className="text-xl font-semibold mb-3">For Education</h3>
              <p className="text-muted-foreground">
                Perfect for music students, teachers, and educational institutions who need reliable 
                chord analysis without budget constraints.
              </p>
            </Card>
          </div>

          <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-lg p-8">
            <h3 className="text-2xl font-bold mb-4">No Catch, Just Great Tools</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm mb-6">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Unlimited uploads</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>YouTube processing</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>All advanced features</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Cloud storage</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Export & sharing</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>No ads or tracking</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto text-center max-w-2xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Analyze Your Music?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of musicians using ChordAI to understand their favorite songs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" variant="secondary" className="h-12 px-8">
                Get Started Free
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
            <Link href="/upload">
              <Button size="lg" variant="outline" className="h-12 px-8 bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                <Youtube className="h-5 w-5 mr-2" />
                Try YouTube Analysis
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 px-4">
        <div className="container mx-auto text-center text-muted-foreground">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Music className="h-6 w-6" />
            <span className="font-semibold">ChordAI</span>
          </div>
          <p>Free AI-powered chord detection for musicians everywhere</p>
        </div>
      </footer>
    </div>
  )
}
