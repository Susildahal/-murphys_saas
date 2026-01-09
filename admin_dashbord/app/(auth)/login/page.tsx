'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, ArrowRight, AlertCircle } from "lucide-react";
import {
  getAuth,
  signInWithEmailAndPassword,
  sendSignInLinkToEmail,
  onAuthStateChanged,
} from "firebase/auth";
import app from "@/app/config/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EmailModal } from "@/app/page/email-model";
import Image from "next/image";
import { useAppDispatch } from "@/lib/redux/hooks";
import axiosInstance from "@/lib/axios";

export default function AdminLoginPage() {
  const auth = getAuth(app);
  const router = useRouter();

  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalStatus, setModalStatus] = useState<string | null>(null);
  const [passwordClick, setPasswordClick] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      // if (user) router.replace("/admin/dashboard");
    });
    return () => unsub();
  }, [auth, router]);

  const emailLinkConfig = {
    url: `${typeof window !== "undefined" ? window.location.origin : ""}/email-link-callback`,
    handleCodeInApp: true,
  };

  const validationSchema = Yup.object({
    email: Yup.string().email("Invalid email").required("Required"),
    password: Yup.string()
      .min(6, "Password too short")
      .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
      .required("Required"),
  });

  const handleLogin = async (
    values: { email: string; password: string },
    { setSubmitting, setStatus }: any
  ) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
      
      const user = userCredential.user;
      await user.getIdToken(true);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const checkProfile = async () => {
        try {
          const response = await axiosInstance.get('/profiles', {
            params: { email: values.email }
          });
          if (response.status === 200) {
            router.replace("/admin/dashboard");
          } else {
            router.replace("/profile");
          }
        } catch (error) {
          console.error('Profile check error:', error);
          router.replace("/profile");
        }
      };
      await checkProfile();
     
    } catch (err: any) {
      console.error('Login error:', err);
      setStatus({ error: "Invalid credentials. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendEmailLink = async (email: string) => {
    setModalLoading(true);
    try {
      await sendSignInLinkToEmail(auth, email, emailLinkConfig);
      localStorage.setItem("emailForSignIn", email);
      setModalStatus("Magic link sent! Check your inbox.");
      setTimeout(() => setModalStatus(null), 5000);
    } catch (err) {
      setModalStatus("Failed to send link.");
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-6">
      {/* Minimal Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100/40 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-100/40 rounded-full blur-3xl" />
      </div>

      {/* Main Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-6xl grid lg:grid-cols-2 gap-12 items-center"
      >
        {/* Left Side - Minimal Branding */}
        <div className="hidden lg:block space-y-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="w-2 h-2 rounded-full bg-black" />
              <span className="text-sm font-medium text-neutral-600">ADMIN ACCESS</span>
            </div>
            
            <h1 className="text-6xl font-light text-neutral-900 mb-4 leading-tight">
              Welcome<br />back
            </h1>
            
            <p className="text-lg text-neutral-500 leading-relaxed max-w-md">
              Sign in to access your dashboard and manage your platform with ease.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-3"
          >
            {["Secure authentication", "Real-time analytics", "Advanced controls"].map((text, i) => (
              <div key={i} className="flex items-center gap-3 text-neutral-600">
                <div className="w-1 h-1 rounded-full bg-neutral-400" />
                <span className="text-sm">{text}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right Side - Minimal Form */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="w-full"
        >
          <div className="bg-white rounded-2xl p-10 shadow-sm border border-neutral-200/50">
            {/* Mobile Header */}
            <div className="lg:hidden mb-8">
              <div className="inline-flex items-center gap-3 mb-4">
                <div className="w-2 h-2 rounded-full bg-black" />
                <span className="text-sm font-medium text-neutral-600">ADMIN ACCESS</span>
              </div>
              <h2 className="text-3xl font-light text-neutral-900">Welcome back</h2>
            </div>

            <Formik
              initialValues={{ email: "", password: "" }}
              validationSchema={validationSchema}
              onSubmit={handleLogin}
            >
              {({ isSubmitting, status, touched, errors }) => (
                <Form className="space-y-6">
                  {/* Email Field */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-neutral-700">
                      Email
                    </Label>
                    <div className="relative">
                      <Field
                        as={Input}
                        id="email"
                        name="email"
                        type="email"
                        placeholder="admin@company.com"
                        className={`h-12 pl-4 pr-4 bg-neutral-50 border-neutral-200 rounded-lg focus:bg-white transition-all ${
                          touched.email && errors.email
                            ? "border-red-300 focus-visible:ring-red-400"
                            : "focus-visible:ring-neutral-900"
                        }`}
                      />
                    </div>
                    {touched.email && errors.email && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xs text-red-600 flex items-center gap-1"
                      >
                        <AlertCircle className="w-3 h-3" />
                        {errors.email}
                      </motion.p>
                    )}
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="password" className="text-sm font-medium text-neutral-700">
                        Password
                      </Label>
                      <button
                        type="button"
                        onClick={() => router.push("/forgot-password")}
                        className="text-xs text-neutral-500 hover:text-neutral-900 transition"
                      >
                        Forgot?
                      </button>
                    </div>
                    <div className="relative">
                      <Field
                        as={Input}
                        id="password"
                        name="password"
                        type={passwordClick ? "text" : "password"}
                        placeholder="Enter password"
                        className={`h-12 pl-4 pr-12 bg-neutral-50 border-neutral-200 rounded-lg focus:bg-white transition-all ${
                          touched.password && errors.password
                            ? "border-red-300 focus-visible:ring-red-400"
                            : "focus-visible:ring-neutral-900"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setPasswordClick(!passwordClick)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition"
                      >
                        {passwordClick ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {touched.password && errors.password && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xs text-red-600 flex items-center gap-1"
                      >
                        <AlertCircle className="w-3 h-3" />
                        {errors.password}
                      </motion.p>
                    )}
                  </div>

                  {/* Error Message */}
                  <AnimatePresence>
                    {status?.error && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg border border-red-200 flex items-center gap-2"
                      >
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span>{status.error}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Sign In Button */}
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-12 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white font-medium transition-all active:scale-[0.98] disabled:opacity-50 group"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Signing in...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        Sign in
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </span>
                    )}
                  </Button>

                  {/* Divider */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-neutral-200" />
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="bg-white px-3 text-neutral-400 uppercase tracking-wider">
                        or
                      </span>
                    </div>
                  </div>

                  {/* Magic Link Button */}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setModalOpen(true)}
                    className="w-full h-12 rounded-lg border-neutral-200 hover:bg-neutral-50 font-medium transition-all"
                  >
                    <Mail className="w-4 h-4 mr-2 text-neutral-600" />
                    Continue with magic link
                  </Button>
                </Form>
              )}
            </Formik>
          </div>
        </motion.div>
      </motion.div>

      {/* Email Modal */}
      <EmailModal
        open={modalOpen}
        loading={modalLoading}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSendEmailLink}
      />

      {/* Toast Notification */}
      <AnimatePresence>
        {modalStatus && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-neutral-900 text-white px-6 py-3 rounded-full shadow-lg z-50"
          >
            <span className="text-sm">{modalStatus}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}