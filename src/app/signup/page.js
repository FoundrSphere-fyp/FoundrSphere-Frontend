"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, ArrowLeft, UserCircle, Briefcase, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = React.useState(1)
  const [formData, setFormData] = React.useState({
    userType: "",
    username: "",
    email: "",
    name: "",
    password: "",
  })

  const totalSteps = 5

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleSubmit = async () => {
    // Handle form submission
    console.log("Form submitted:", formData)
    const req = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: formData.email,
        username: formData.username,
        name: formData.name,
        password: formData.password,
        userType: formData.userType
      }),
    });
    const res = await req.json();
    console.log(res);
    if(res.type =="success") {
      toast.success("Signup successful! You can now log in.");
      router.push("/login")
    }
    else {
      toast.error(res.message);
    }
  }

  const updateFormData = (field, value) => {
    setFormData({ ...formData, [field]: value })
  }

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.userType !== ""
      case 2:
        return formData.username.length >= 3
      case 3:
        return validateEmail(formData.email)
      case 4:
        return formData.name.length >= 2
      case 5:
        return formData.password.length >= 8
      default:
        return false
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && canProceed()) {
      if (step < totalSteps) {
        handleNext()
      } else {
        handleSubmit()
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-2xl">
        <CardContent className="p-8">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">
                Step {step} of {totalSteps}
              </span>
              <span className="text-sm font-medium">
                {Math.round((step / totalSteps) * 100)}%
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${(step / totalSteps) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Form Steps */}
          <div className="min-h-[400px] flex flex-col justify-center">
            <AnimatePresence mode="wait">
              {/* Step 1: User Type */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="text-center space-y-2">
                    <h2 className="text-3xl font-bold">Welcome to FoundrSphere</h2>
                    <p className="text-muted-foreground">
                      Let's get started. Are you a founder or an investor?
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                    <button
                      onClick={() => {
                        updateFormData("userType", "founder")
                        handleNext()
                      }}
                      className={`p-6 rounded-lg border-2 transition-all hover:scale-105 ${
                        formData.userType === "founder"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="flex flex-col items-center space-y-3">
                        <div className="p-3 rounded-full bg-primary/10">
                          <Briefcase className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="font-semibold text-lg">I'm a Founder</h3>
                        <p className="text-sm text-muted-foreground text-center">
                          Build and grow your startup with our community
                        </p>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        updateFormData("userType", "investor")
                        handleNext()
                      }}
                      className={`p-6 rounded-lg border-2 transition-all hover:scale-105 ${
                        formData.userType === "investor"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="flex flex-col items-center space-y-3">
                        <div className="p-3 rounded-full bg-primary/10">
                          <Users className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="font-semibold text-lg">I'm an Investor</h3>
                        <p className="text-sm text-muted-foreground text-center">
                          Discover and invest in promising startups
                        </p>
                      </div>
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Username */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="text-center space-y-2">
                    <h2 className="text-3xl font-bold">Choose your username</h2>
                    <p className="text-muted-foreground">
                      This is how others will find you on FoundrSphere
                    </p>
                  </div>

                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        placeholder="johndoe"
                        value={formData.username}
                        onChange={(e) => updateFormData("username", e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="text-lg h-12"
                        autoFocus
                      />
                      <p className="text-xs text-muted-foreground">
                        At least 3 characters. Only letters, numbers, and underscores.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Email */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="text-center space-y-2">
                    <h2 className="text-3xl font-bold">What's your email?</h2>
                    <p className="text-muted-foreground">
                      We'll use this to keep you updated
                    </p>
                  </div>

                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={(e) => updateFormData("email", e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="text-lg h-12"
                        autoFocus
                      />
                      <p className="text-xs text-muted-foreground">
                        Enter a valid email address
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 4: Name */}
              {step === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="text-center space-y-2">
                    <h2 className="text-3xl font-bold">What's your name?</h2>
                    <p className="text-muted-foreground">
                      Let's make it personal
                    </p>
                  </div>

                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={(e) => updateFormData("name", e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="text-lg h-12"
                        autoFocus
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 5: Password */}
              {step === 5 && (
                <motion.div
                  key="step5"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="text-center space-y-2">
                    <h2 className="text-3xl font-bold">Create a password</h2>
                    <p className="text-muted-foreground">
                      Keep your account secure
                    </p>
                  </div>

                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={(e) => updateFormData("password", e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="text-lg h-12"
                        autoFocus
                      />
                      <p className="text-xs text-muted-foreground">
                        At least 8 characters with letters and numbers
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={step === 1}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>

            {step < totalSteps ? (
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
                className="gap-2"
              >
                Continue
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!canProceed()}
                className="gap-2"
              >
                Create Account
                <UserCircle className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Login Link */}
          <div className="text-center mt-6 text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}