'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Mail, } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { EmailModal } from "@/app/page/email-model";
import Image from "next/image";
import axiosInstance from "@/lib/axios";


export default function AdminLoginPage() {
  const auth = getAuth(app);
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalStatus, setModalStatus] = useState<string | null>(null);
  const [passwordClick, setPasswordClick] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

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
    <div className="min-h-screen flex items-center justify-center bg-black p-4 relative overflow-hidden">
      {/* Geometric Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Top Right Lines */}
        <div className="absolute top-0 right-0 w-1/3 h-1/3">
          {[...Array(5)].map((_, i) => (
            <div
              key={`tr-${i}`}
              className="absolute border-l border-t border-blue-500"
              style={{
                width: `${100 + i * 30}px`,
                height: `${100 + i * 30}px`,
                right: `${i * 20}px`,
                top: `${i * 20}px`,
                transform: 'rotate(45deg)',
              }}
            />
          ))}
        </div>
        {/* Top Left Lines */}
        <div className="absolute top-0 left-0 w-1/4 h-1/4">
          {[...Array(5)].map((_, i) => (
            <div
              key={`tl-${i}`}
              className="absolute border-l border-t border-blue-500"
              style={{
                width: `${60 + i * 20}px`,
                height: `${60 + i * 20}px`,
                left: `${i * 15}px`,
                top: `${i * 15}px`,
                transform: 'rotate(45deg)',
              }}
            />
          ))}
        </div>
        {/* Bottom Left Lines */}
        <div className="absolute bottom-0 left-0 w-1/4 h-1/4">
          {[...Array(3)].map((_, i) => (
            <div
              key={`bl-${i}`}
              className="absolute border-l border-b border-blue-500"
              style={{
                width: `${80 + i * 25}px`,
                height: `${80 + i * 25}px`,
                left: `${i * 18}px`,
                bottom: `${i * 18}px`,
                transform: 'rotate(45deg)',
              }}
            />
          ))}
        </div>
         <div className="absolute bottom-0 right-0 w-1/4 h-1/4">
          {[...Array(5)].map((_, i) => (
            <div
              key={`bl-${i}`}
              className="absolute border-l border-b border-blue-500"
              style={{
                width: `${100 + i * 25}px`,
                height: `${100 + i * 25}px`,
                left: `${i * 18}px`,
                bottom: `${i * 18}px`,
                transform: 'rotate(45deg)',
              }}
            />
          ))}
        </div>
      </div>

      {/* Brand Badge with Magic Link */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-8 left-1/2 -translate-x-1/2"
      >
        <Image
          src="/logo.png"
          alt="Brand Logo"
          width={150}
          height={50}
        />
      </motion.div>

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="relative w-full max-w-md bg-white rounded-lg shadow-2xl p-8 mt-16"
      >
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-neutral-900 mb-2">Admin Log In</h2>
          <p className="text-sm text-neutral-600">Please enter your details</p>
        </div>

        <Formik
          initialValues={{ email: "", password: "" }}
          validationSchema={validationSchema}
          onSubmit={handleLogin}
        >
          {({ isSubmitting, status, touched, errors }) => (
            <Form className="space-y-3">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-neutral-700">
                  Email
                </Label>
                <Field
                  as={Input}
                  id="email"
                  name="email"
                  type="email"
                  className={`h-11 rounded border-neutral-300 shadow-none focus-visible:ring-purple-500 ${
                    touched.email && errors.email ? "border-red-400" : ""
                  }`}
                />
                {touched.email && errors.email && (
                  <p className="text-xs text-red-600">{errors.email}</p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-neutral-700">
                  Password
                </Label>
                <div className="relative">
                  <Field
                    as={Input}
                    id="password"
                    name="password"
                    type={passwordClick ? "text" : "password"}
                    className={`h-11 pr-10 rounded border-neutral-300 shadow-none focus-visible:ring-purple-500 ${
                      touched.password && errors.password ? "border-red-400" : ""
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setPasswordClick(!passwordClick)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                  >
                    {passwordClick ? <EyeOff className="w-4 h-4 text-blue-700" /> : <Eye className="w-4 h-4 text-blue-600" />}
                  </button>
                </div>
                {touched.password && errors.password && (
                  <p className="text-xs text-red-600">{errors.password}</p>
                )}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                    className="border-purple-600 data-[state=checked]:bg-purple-600"
                  />
                  <label
                    htmlFor="remember"
                    className="text-sm text-neutral-700 cursor-pointer select-none"
                  >
                    Remember me
                  </label>
                </div>
                <button
                  type="button"
                  onClick={() => router.push("/forgot-password")}
                  className="text-sm text-neutral-700 cursor-pointer hover:text-purple-600 transition"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Error Message */}
              <AnimatePresence>
                {status?.error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg border border-red-200"
                  >
                    {status.error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Log In Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium rounded-lg transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Logging in...
                  </span>
                ) : (
                  "Log In"
                )}
              </Button>
              <div className="flex flex-col items-center gap-3">
                <Button
                  variant="ghost"
                  onClick={() => setModalOpen(true)}
                  className="inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-purple-600 transition"
                >
                  <Mail className="w-4 h-4" />
                  Log in with Magic Link
                </Button>

                <p className="text-sm text-neutral-600">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => router.push('/register')}
                    className="text-purple-600 hover:text-purple-700 font-medium transition"
                  >
                    Sign up
                  </button>
                </p>
              </div>
            </Form>
          )}
        </Formik>
           
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
            className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-neutral-900 text-white px-6 py-3 rounded-lg shadow-lg z-50"
          >
            <span className="text-sm">{modalStatus}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}