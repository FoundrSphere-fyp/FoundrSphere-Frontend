"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Brain, Loader2, TrendingUp, AlertCircle } from "lucide-react"

export default function AnalyzeStartup() {
  const [formData, setFormData] = useState({
    name: "",
    industry: "",
    business_type: "",
    funding_stage: "",
    idea_description: "",
    pricing_type: "",
    pricing_details: "",
    user_skills: ""
  })

  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleAnalyze = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('https://davion-intermuscular-skeptically.ngrok-free.dev/analyze_startup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        throw new Error('Analysis failed. Please try again.')
      }

      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const isFormValid = formData.name && formData.industry && formData.business_type && 
                      formData.funding_stage && formData.idea_description && 
                      formData.pricing_type && formData.user_skills

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Brain className="w-10 h-10 text-primary" />
            <h1 className="text-4xl font-bold">Analyze Your Startup</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Get AI-powered insights and recommendations for your startup idea
          </p>
        </motion.div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Startup Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Startup Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Startup Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Riff"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                />
              </div>

              {/* Industry */}
              <div className="space-y-2">
                <Label htmlFor="industry">Industry *</Label>
                <Select value={formData.industry} onValueChange={(value) => handleInputChange('industry', value)}>
                  <SelectTrigger id="industry">
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AI">AI</SelectItem>
                    <SelectItem value="FinTech">FinTech</SelectItem>
                    <SelectItem value="HealthTech">HealthTech</SelectItem>
                    <SelectItem value="EdTech">EdTech</SelectItem>
                    <SelectItem value="E-commerce">E-commerce</SelectItem>
                    <SelectItem value="SaaS">SaaS</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Business Type */}
              <div className="space-y-2">
                <Label htmlFor="business_type">Business Type *</Label>
                <Select value={formData.business_type} onValueChange={(value) => handleInputChange('business_type', value)}>
                  <SelectTrigger id="business_type">
                    <SelectValue placeholder="Select business type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SaaS">SaaS</SelectItem>
                    <SelectItem value="B2B">B2B</SelectItem>
                    <SelectItem value="B2C">B2C</SelectItem>
                    <SelectItem value="Marketplace">Marketplace</SelectItem>
                    <SelectItem value="Platform">Platform</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Funding Stage */}
              <div className="space-y-2">
                <Label htmlFor="funding_stage">Funding Stage *</Label>
                <Select value={formData.funding_stage} onValueChange={(value) => handleInputChange('funding_stage', value)}>
                  <SelectTrigger id="funding_stage">
                    <SelectValue placeholder="Select funding stage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Idea">Idea</SelectItem>
                    <SelectItem value="Pre-Seed">Pre-Seed</SelectItem>
                    <SelectItem value="Seed">Seed</SelectItem>
                    <SelectItem value="Series A">Series A</SelectItem>
                    <SelectItem value="Series B">Series B</SelectItem>
                    <SelectItem value="Series C+">Series C+</SelectItem>
                    <SelectItem value="Public">Public</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Idea Description */}
              <div className="space-y-2">
                <Label htmlFor="idea_description">Idea Description *</Label>
                <Textarea
                  id="idea_description"
                  placeholder="Describe your startup idea in detail..."
                  rows={4}
                  value={formData.idea_description}
                  onChange={(e) => handleInputChange('idea_description', e.target.value)}
                />
              </div>

              {/* Pricing Type */}
              <div className="space-y-2">
                <Label htmlFor="pricing_type">Pricing Type *</Label>
                <Select value={formData.pricing_type} onValueChange={(value) => handleInputChange('pricing_type', value)}>
                  <SelectTrigger id="pricing_type">
                    <SelectValue placeholder="Select pricing type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Subscription">Subscription</SelectItem>
                    <SelectItem value="One-time">One-time</SelectItem>
                    <SelectItem value="Freemium">Freemium</SelectItem>
                    <SelectItem value="Usage-based">Usage-based</SelectItem>
                    <SelectItem value="Free">Free</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Pricing Details */}
              <div className="space-y-2">
                <Label htmlFor="pricing_details">Pricing Details</Label>
                <Textarea
                  id="pricing_details"
                  placeholder="e.g., Freemium model for hobbyists and $10/month subscription for premium users"
                  rows={3}
                  value={formData.pricing_details}
                  onChange={(e) => handleInputChange('pricing_details', e.target.value)}
                />
              </div>

              {/* User Skills */}
              <div className="space-y-2">
                <Label htmlFor="user_skills">Your Skills *</Label>
                <Input
                  id="user_skills"
                  placeholder="e.g., AI, Marketing, Development (comma separated)"
                  value={formData.user_skills}
                  onChange={(e) => handleInputChange('user_skills', e.target.value)}
                />
              </div>

              {/* Analyze Button */}
              <Button 
                className="w-full" 
                size="lg"
                onClick={handleAnalyze}
                disabled={!isFormValid || loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Analyze Startup
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="border-destructive">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 text-destructive">
                  <AlertCircle className="w-5 h-5" />
                  <p>{error}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Results Display */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="border-primary">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Brain className="w-6 h-6 text-primary" />
                  Analysis Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  )
}
