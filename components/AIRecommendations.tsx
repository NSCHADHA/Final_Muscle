"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles, Loader2, AlertCircle } from "lucide-react"
import { useGym } from "@/context/GymContext"
import { toast } from "@/hooks/use-toast"

export function AIRecommendations() {
  const { state } = useGym()
  const [recommendations, setRecommendations] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>("")

  const generateRecommendations = async () => {
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/ai/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          members: state.members,
          payments: state.payments,
          context: `Gym Name: ${state.user?.gymName || "N/A"}`,
        }),
      })

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      setRecommendations(data.recommendations)
      toast({
        title: "AI Recommendations Generated",
        description: "Review personalized insights for your gym",
      })
    } catch (error: any) {
      setError(error.message || "Failed to generate recommendations")
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              AI Business Insights
            </CardTitle>
            <CardDescription>Get personalized recommendations to grow your gym business</CardDescription>
          </div>
          <Button
            onClick={generateRecommendations}
            disabled={loading}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Insights
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="flex items-start gap-2 p-4 bg-destructive/10 border border-destructive/20 rounded-lg mb-4">
            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <div className="text-sm text-destructive">{error}</div>
          </div>
        )}

        {!recommendations && !loading && !error && (
          <div className="text-center py-12">
            <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground mb-2">No recommendations yet</p>
            <p className="text-sm text-muted-foreground">
              Click "Generate Insights" to get AI-powered business recommendations
            </p>
          </div>
        )}

        {loading && (
          <div className="text-center py-12">
            <Loader2 className="h-12 w-12 text-purple-500 mx-auto mb-4 animate-spin" />
            <p className="text-muted-foreground">Analyzing your gym data...</p>
            <p className="text-sm text-muted-foreground mt-2">This may take a few moments</p>
          </div>
        )}

        {recommendations && !loading && (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-6 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="whitespace-pre-wrap text-foreground">{recommendations}</div>
            </div>
            <div className="mt-4 text-xs text-muted-foreground text-center">
              Powered by AI - Review recommendations carefully and adapt to your specific situation
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
