'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { motion, AnimatePresence } from "framer-motion";
import { Eye ,EyeClosed } from "lucide-react";
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
import { Mail, Lock } from "lucide-react";
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
    password: Yup.string().min(6, "Password too short").matches(/[A-Z]/, 'Password must contain at least one uppercase letter').matches(/[a-z]/, 'Password must contain at least one lowercase letter').required("Required"),
  });

  const handleLogin = async (
    values: { email: string; password: string },
    { setSubmitting, setStatus }: any
  ) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
      
      // Wait for Firebase to set the token and ensure it's available
      const user = userCredential.user;
      await user.getIdToken(true); // Force token refresh
      
      // Small delay to ensure token is properly set in axios interceptor
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
      // router.replace("/admin/dashboard");
     
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
    <div className="min-h-screen flex">
      {/* Left Side - Image */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
        <Image
          src="/login.jpg"
          alt="Login Illustration"
          width={800}
          height={600}
          className="absolute inset-0 w-full h-full object-cover opacity-80"
        />
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 lg:p-16 bg-gradient-to-br from-white to-slate-50/50">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="w-full max-w-md"
        >
          <div className="bg-white/90 backdrop-blur-xl rounded-xl shadow-lg border border-slate-200/50 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-6">
              <h1 className="text-2xl font-bold text-white">Admin Portal</h1>
              <p className="text-slate-300 text-sm mt-1">Sign in to continue</p>
            </div>

            {/* Form */}
            <div className="p-6">
              <Formik
                initialValues={{ email: "", password: "" }}
                validationSchema={validationSchema}
                onSubmit={handleLogin}
              >
                {({ isSubmitting, status, touched, errors }) => (
                  <Form className="space-y-4">
                    {/* Email Field */}
                    <div className="space-y-1">
                      <Label htmlFor="email" className="text-slate-700 font-medium text-sm">
                        Email
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Field
                          as={Input}
                          id="email"
                          name="email"
                          type="email"
                          placeholder="admin@company.com"
                          className={`pl-10 h-10 border ${
                            touched.email && errors.email
                              ? "border-red-400 focus-visible:ring-red-400"
                              : "border-slate-300 focus-visible:ring-slate-500"
                          }`}
                        />
                      </div>
                      {touched.email && errors.email && (
                        <p className="text-xs text-red-500 font-medium">{errors.email}</p>
                      )}
                    </div>

                    {/* Password Field */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="password" className="text-slate-700 font-medium text-sm">
                          Password
                        </Label>
                        <button
                          type="button"
                          onClick={() => router.push("/forgot-password")}
                          className="text-xs text-slate-500 hover:text-slate-700 font-medium transition"
                        >
                          Forgot Password ?
                        </button>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Field
                          as={Input}
                          id="password"
                          name="password"
                          type={passwordClick ? "text" : "password"}
                          placeholder="••••••••"
                          className={`pl-10 h-10 border ${
                            touched.password && errors.password
                              ? "border-red-400 focus-visible:ring-red-400"
                              : "border-slate-300 focus-visible:ring-slate-500"
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setPasswordClick(!passwordClick)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                        >
                          {passwordClick ? <EyeClosed className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {touched.password && errors.password && (
                        <p className="text-xs text-red-500 font-medium">{errors.password}</p>
                      )}
                    </div>

                    {/* Error Message */}
                    <AnimatePresence>
                      {status?.error && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="bg-red-50 text-red-600 text-sm font-medium px-3 py-2 rounded-lg border border-red-200"
                        >
                          {status.error}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Sign In Button */}
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full h-10 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold shadow-md transition-all active:scale-[0.98]"
                    >
                      {isSubmitting ? "Signing in..." : "Sign In"}
                    </Button>

                    {/* Divider */}
                    <div className="relative my-3">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-slate-200" />
                      </div>
                      <div className="relative flex justify-center text-xs">
                        <span className="bg-white px-2 text-slate-500 font-medium">OR</span>
                      </div>
                    </div>

                    {/* Magic Link Button */}
                    <Button
                      variant="outline"
                      onClick={() => setModalOpen(true)}
                      className="w-full h-10 rounded-lg font-medium transition-all"
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Continue with Magic Link
                    </Button>
                  </Form>
                )}
              </Formik>
            </div>  
          </div>
        </motion.div>
      </div>

      {/* Email Modal */}
      <EmailModal
        open={modalOpen}
        loading={modalLoading}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSendEmailLink}
      />

      {/* Success Toast */}
      <AnimatePresence>
        {modalStatus && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 z-50"
          >
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-sm font-medium">{modalStatus}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}