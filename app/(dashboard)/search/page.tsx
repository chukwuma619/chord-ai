"use client"

import { useState, useEffect } from 'react'
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Music, ArrowLeft, Search, FileMusic, Clock, Loader2 } from "lucide-react"
import { useDebounce } from "@/lib/hooks/use-debounce"

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const debouncedSearch = useDebounce(searchQuery, 500)
  const supabase = createClient()

  useEffect(() => {
    if (debouncedSearch) {
      performSearch(debouncedSearch)
    } else {
      // Show recent analyses when no search query
      loadRecentAnalyses()
    }
  }, [debouncedSearch])

  const performSearch = async (query: string) => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('analyses')
        .select('*')
        .ilike('filename', `%${query}%`)
        .order('created_at', { ascending: false })
        .limit(20)

      if (!error && data) {
        setResults(data)
      }
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadRecentAnalyses = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('analyses')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20)

      if (!error && data) {
        setResults(data)
      }
    } catch (error) {
      console.error('Load error:', error)
    } finally {
      setLoading(false)
    }
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
        </nav>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Search Header */}
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold">Search Songs</h1>
            <p className="text-muted-foreground">
              Find chord progressions from our community library
            </p>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by song name or artist..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 text-lg"
            />
          </div>

          {/* Results */}
          <div>
            <h2 className="text-xl font-semibold mb-4">
              {searchQuery ? 'Search Results' : 'Recent Analyses'}
            </h2>
            
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : results.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-4">
                {results.map((analysis) => (
                  <Link key={analysis.id} href={`/preview/${analysis.id}`}>
                    <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <FileMusic className="h-8 w-8 text-primary" />
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {new Date(analysis.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <CardTitle className="text-lg line-clamp-1">
                          {analysis.filename}
                        </CardTitle>
                        <CardDescription>
                          Key: {analysis.key} • {analysis.tempo} BPM • {analysis.chords.length} chords
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <FileMusic className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {searchQuery ? 'No results found. Try a different search term.' : 'No analyses available yet.'}
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 