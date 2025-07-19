import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Music, Upload, Search, Clock, FileMusic, LogOut } from "lucide-react"
import { DashboardClient } from "./dashboard-client"

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  // Fetch user's analyses from database
  const { data: analyses, error } = await supabase
    .from('analyses')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10)

  // Fetch recent public analyses for discovery
  const { data: recentAnalyses } = await supabase
    .from('analyses')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(6)

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
            <span className="text-sm text-muted-foreground">
              {user.email}
            </span>
            <form action="/api/auth/logout" method="POST">
              <Button variant="ghost" size="sm" type="submit">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </form>
          </div>
        </nav>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back!</h1>
          <p className="text-muted-foreground">
            Upload a new song or browse your previous analyses
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Link href="/upload">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload New Song
                </CardTitle>
                <CardDescription>
                  Analyze a new audio file with AI
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">
                  Choose File
                </Button>
              </CardContent>
            </Card>
          </Link>

          <Link href="/search">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Search Songs
                </CardTitle>
                <CardDescription>
                  Find chord progressions from our library
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search by song or artist..." 
                    className="pl-10"
                    readOnly
                  />
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Your Recent Analyses */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Your Recent Analyses</h2>
          
          {analyses && analyses.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {analyses.map((analysis) => (
                <Link key={analysis.id} href={`/preview/${analysis.id}`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <FileMusic className="h-8 w-8 text-primary" />
                        <span className="text-xs text-muted-foreground">
                          {new Date(analysis.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <CardTitle className="text-lg line-clamp-1">
                        {analysis.filename}
                      </CardTitle>
                      <CardDescription>
                        Key: {analysis.key} • {analysis.tempo} BPM
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <FileMusic className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                No analyses yet. Upload your first song to get started!
              </p>
            </Card>
          )}
        </section>

        {/* Discover Section */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Discover Recent Uploads</h2>
          
          {recentAnalyses && recentAnalyses.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentAnalyses.map((analysis) => (
                <Link key={analysis.id} href={`/preview/${analysis.id}`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <FileMusic className="h-8 w-8 text-muted-foreground" />
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {new Date(analysis.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <CardTitle className="text-lg line-clamp-1">
                        {analysis.filename}
                      </CardTitle>
                      <CardDescription>
                        Key: {analysis.key} • {analysis.tempo} BPM
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">
                No recent uploads found
              </p>
            </Card>
          )}
        </section>

        {/* Client Component for interactive features */}
        <DashboardClient />
      </div>
    </div>
  )
} 