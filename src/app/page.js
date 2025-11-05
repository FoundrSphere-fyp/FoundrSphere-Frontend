"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Users, Brain, DollarSign } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-8 py-24 text-center space-y-6">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl font-bold tracking-tight"
        >
          Empowering Founders to Build Better Startups 🚀
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-muted-foreground text-lg max-w-2xl mx-auto"
        >
          Evaluate startup ideas, find co-founders, connect with investors, and grow with a community built for founders.
        </motion.p>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Button size="lg" asChild>
            <Link href="/signup">Get Started</Link>
          </Button>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-8 py-16 grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <Brain className="w-5 h-5 text-primary" /> AI Idea Evaluator
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Get smart and structured evaluations for your startup idea — instantly.
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <Users className="w-5 h-5 text-primary" /> Find Co-Founders
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Connect with founders who share your mission and complement your skills.
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <DollarSign className="w-5 h-5 text-primary" /> Connect with Investors
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Get matched with investors aligned with your stage and industry.
          </CardContent>
        </Card>
      </section>

      {/* Community CTA Section */}
      <section className="text-center py-24 bg-muted">
        <h2 className="text-3xl font-bold">Join the FoundrSphere Community</h2>
        <p className="text-muted-foreground max-w-lg mx-auto mt-2">
          Collaborate, learn, grow, and accelerate your startup journey with like-minded founders.
        </p>
        <div className="mt-6">
          <Button size="lg" variant="outline" asChild>
            <Link href="/community">Explore Community</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
