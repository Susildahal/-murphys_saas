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
    <div className="min-h-screen w-full lg:grid lg:grid-cols-2 h-full">
      {/* Left Side - Hero/Branding */}
      <div className="hidden lg:flex flex-col justify-center p-12 relative overflow-hidden bg-neutral-900 text-white">
        {/* Animated Gradient Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-purple-600/30 rounded-full blur-[120px] mix-blend-screen animate-pulse" />
          <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[100px] mix-blend-screen animate-pulse delay-1000" />
          <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-800/90 z-10" />
        </div>

        <div className="relative z-20 max-w-lg mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/10 shadow-lg">
                <Image src="/logo.png" alt="Murphys Logo" width={40} height={40} className="object-contain" />
              </div>
              <span className="text-xl font-bold tracking-tight">Murphys Admin</span>
            </div>

            <h1 className="text-5xl font-bold leading-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
              Manage your platform with confidence.
            </h1>

            <p className="text-lg text-neutral-400 leading-relaxed mb-8">
              Access powerful tools, real-time analytics, and comprehensive user management in one unified dashboard.
            </p>

            <div className="space-y-4">
              {[
                { title: "Secure Dashboard", desc: "Enterprise-grade security for your data" },
                { title: "Real-time Insights", desc: "Monitor performance as it happens" }
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                    <div className="w-2 h-2 rounded-full bg-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-white">{item.title}</h3>
                    <p className="text-sm text-neutral-400">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex flex-col justify-center items-center p-6 lg:p-24 bg-white">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md space-y-8"
        >
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold tracking-tight text-neutral-900">Welcome back</h2>
            <p className="mt-2 text-neutral-500">Please enter your details to sign in.</p>
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
                  <Label htmlFor="email" className="text-sm font-medium text-neutral-700">Email Address</Label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-3.5 h-5 w-5 text-neutral-400 group-focus-within:text-neutral-600 transition-colors" />
                    <Field
                      as={Input}
                      id="email"
                      name="email"
                      type="email"
                      placeholder="name@company.com"
                      className={`h-12 pl-10 bg-neutral-50 border-neutral-200 focus:bg-white transition-all duration-200 ${touched.email && errors.email
                        ? "border-red-500 focus-visible:ring-red-500"
                        : "focus-visible:ring-blue-600 border-neutral-200"
                        }`}
                    />
                  </div>
                  {touched.email && errors.email && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="text-xs text-red-500 font-medium ml-1"
                    >
                      {errors.email}
                    </motion.p>
                  )}
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="password" className="text-sm font-medium text-neutral-700">Password</Label>
                    <button
                      type="button"
                      onClick={() => router.push("/forgot-password")}
                      className="text-xs font-medium text-blue-600 hover:text-blue-700 transition"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-3.5 h-5 w-5 text-neutral-400 group-focus-within:text-neutral-600 transition-colors" />
                    <Field
                      as={Input}
                      id="password"
                      name="password"
                      type={passwordClick ? "text" : "password"}
                      placeholder="••••••••"
                      className={`h-12 pl-10 pr-10 bg-neutral-50 border-neutral-200 focus:bg-white transition-all duration-200 ${touched.password && errors.password
                        ? "border-red-500 focus-visible:ring-red-500"
                        : "focus-visible:ring-blue-600 border-neutral-200"
                        }`}
                    />
                    <button
                      type="button"
                      onClick={() => setPasswordClick(!passwordClick)}
                      className="absolute right-3 top-3.5 text-neutral-400 hover:text-neutral-600 transition-colors"
                    >
                      {passwordClick ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {touched.password && errors.password && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="text-xs text-red-500 font-medium ml-1"
                    >
                      {errors.password}
                    </motion.p>
                  )}
                </div>

                {/* Error Banner */}
                <AnimatePresence>
                  {status?.error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="p-4 rounded-lg bg-red-50 border border-red-100 flex items-start gap-3"
                    >
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-red-600">
                        <span className="font-semibold block mb-1">Authentication Error</span>
                        {status.error}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="space-y-4 pt-2">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-12 text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.01] active:scale-[0.98]"
                  >
                    {isSubmitting ? <span className="animate-pulse">Signing in...</span> : "Sign in to Dashboard"}
                  </Button>

                  <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-neutral-200" /></div>
                    <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-neutral-400">Or continue with</span></div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setModalOpen(true)}
                    className="w-full h-12 font-medium border-neutral-200 hover:bg-neutral-50 hover:border-neutral-300 transition-all text-neutral-700"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Send Magic Link
                  </Button>
                </div>
              </Form>
            )}
          </Formik>

          <p className="text-center text-sm text-neutral-500">
            Don't have an account? <span className="text-blue-600 hover:underline cursor-pointer">Contact Support</span>
          </p>
        </motion.div>
      </div>

      <EmailModal
        open={modalOpen}
        loading={modalLoading}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSendEmailLink}
      />

      <AnimatePresence>
        {modalStatus && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-8 right-8 bg-neutral-900 text-white px-6 py-4 rounded-xl shadow-2xl z-50 flex items-center gap-3"
          >
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="font-medium">{modalStatus}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

