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
    email: Yup.string().email("Invalid email").required(" Email is Required"),
    password: Yup.string()
      .min(6, "Password too short")
     
      .required(" Email is Required"),
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
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm bg-white rounded-lg shadow-sm border border-slate-200 p-8"
      >
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-semibold text-slate-900 mb-2">
            Welcome back — great to see you
          </h2>
          <p className="text-slate-500 text-sm">
            Sign in to securely manage your projects, teams, and account settings.
          </p>
        </div>

        <Formik
          initialValues={{ email: "", password: "" }}
          validationSchema={validationSchema}
          onSubmit={handleLogin}
        >
          {({ isSubmitting, status, touched, errors }) => (
            <Form className="space-y-4">
              {/* Email Field */}
              <div className="space-y-1.5">
                <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                  Email
                </label>
                <Field
                  as={Input}
                  id="email"
                  name="email"
                  type="email"
                  placeholder="admin@company.com"
                  className={`block w-full px-3 py-2 h-12 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 transition-all duration-200 ${
                    touched.email && errors.email ? "border-red-400" : ""
                  }`}
                />
                {touched.email && errors.email && (
                  <p className="text-xs text-red-600">{errors.email}</p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                  Password
                </label>
                <div className="relative">
                  <Field
                    as={Input}
                    id="password"
                    name="password"
                    type={passwordClick ? "text" : "password"}
                    placeholder="••••••••"
                    className={`block w-full px-3 py-2 pr-10 h-12 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 transition-all duration-200 ${
                      touched.password && errors.password ? "border-red-400" : ""
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setPasswordClick(!passwordClick)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
                    aria-label={passwordClick ? "Hide password" : "Show password"}
                  >
                    {passwordClick ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {touched.password && errors.password && (
                  <p className="text-xs text-red-600">{errors.password}</p>
                )}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                    className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
                  />
                  <label
                    htmlFor="remember"
                    className="ml-2 block text-sm text-slate-600 cursor-pointer select-none"
                  >
                    Remember me
                  </label>
                </div>
                <button
                  type="button"
                  onClick={() => router.push("/forgot-password")}
                  className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Forgot password?
                </button>
              </div>

              {/* Error Message */}
              <AnimatePresence>
                {status?.error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="rounded-md bg-red-50 p-3 flex items-start gap-2"
                  >
                    <svg className="h-4 w-4 text-red-600 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm text-red-600">{status.error}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Log In Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed mt-6"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Authenticating...
                  </span>
                ) : (
                  "Log In"
                )}
              </Button>

              {/* Magic Link Button */}
              <Button
                type="button"
                onClick={() => setModalOpen(true)}
                variant="outline"
                className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-slate-200 rounded-md text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-200 transition-all duration-200"
              >
                <Mail className="h-4 w-4" />
                Log in with Magic Link
              </Button>
            </Form>
          )}
        </Formik>
        
        {/* Sign Up Link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-slate-500">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={() => router.push('/register')}
              className="font-medium text-slate-900 hover:text-slate-700 transition-colors"
            >
              Sign Up
            </button>
          </p>
        </div>
           
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

      {/* Test Inputs component */}
      {/* <Inputs
        type="text"
        placeholder="Test Input Component"
      /> */}
    </div>
  );
}