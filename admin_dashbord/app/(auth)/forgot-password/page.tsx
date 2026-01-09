"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Mail, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import app from '@/app/config/firebase';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' });
  const [loading, setLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: null, message: '' });
    
    try {
      const auth = getAuth(app);
      // send password reset email via Firebase - direct user to custom reset page in this app
      const continueUrl = `${window.location.origin}/reset-password`;
      await sendPasswordResetEmail(auth, email, {
        // The URL the user will be redirected to after clicking the email link
        url: continueUrl,
      });
      setStatus({ type: 'success', message: 'Password reset link sent! Please check your email.' });
      setEmail('');
    } catch (err: any) {
      // Firebase errors have code and message
      const msg = err?.message || 'Something went wrong. Please try again.';
      setStatus({ type: 'error', message: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md"
      >
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          onClick={() => window.history.back()}
          className="mb-8 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
        >
         
        </motion.button>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="bg-white rounded-2xl  border border-slate-200/60 p-8 md:p-10"
        >
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-6 mx-auto"
          >
            <Mail className="w-6 h-6 text-primary" />
          </motion.div>

          {/* Heading */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center mb-8"
          >
            <h1 className="text-2xl md:text-3xl font-bold mb-2 text-slate-900">
              Reset Password
            </h1>
            <p className="text-slate-600 text-sm md:text-base">
              Enter your email and we'll send you a link to reset your password
            </p>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div onSubmit={handleReset} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10 h-12 text-base transition-all duration-300"
                  />
                </div>
              </div>

              <Button
                onClick={handleReset}
                className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300"
                disabled={loading || !email}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                    />
                    Sending...
                  </span>
                ) : (
                  "Send Reset Link"
                )}
              </Button>
            </div>
          </motion.div>

          {/* Status Messages */}
          <AnimatePresence mode="wait">
            {status.type && (
              <motion.div
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-6 overflow-hidden"
              >
                <div
                  className={`flex items-start gap-3 p-4 rounded-lg ${
                    status.type === "success"
                      ? "bg-green-50 border border-green-200"
                      : "bg-red-50 border border-red-200"
                  }`}
                >
                  {status.type === "success" ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  )}
                  <p
                    className={`text-sm ${
                      status.type === "success" ? "text-green-800" : "text-red-800"
                    }`}
                  >
                    {status.message}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-6 text-sm text-slate-600"
        >
          Remember your password?{" "}
          <button
            onClick={() => window.history.back()}
            className="text-primary font-semibold hover:underline transition-all"
          >
            Sign in
          </button>
        </motion.p>
      </motion.div>
    </div>
  );
}