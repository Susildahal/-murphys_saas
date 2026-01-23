'use client';
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import axiosInstance from "@/lib/axios";

const validationSchema = Yup.object({
  email: Yup.string().email("Invalid email").required("Email is required"),
  firstName: Yup.string().required("First name is required"),
  lastName: Yup.string().required("Last name is required"),
});

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');

  const handleSendVerification = async (values: any, { setSubmitting }: any) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.post('/auth/send-verification', {
        email: values.email,
        firstName: values.firstName,
        lastName: values.lastName,
      });

      if (response.data.success) {
        setEmailSent(true);
        setSubmittedEmail(values.email);
      }
    } catch (err: any) {
      console.error('Send verification error:', err);
      setError(err.response?.data?.message || 'Failed to send verification email');
    } finally {
      setLoading(false);
      setSubmitting(false);
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
              key={`br-${i}`}
              className="absolute border-l border-b border-blue-500"
              style={{
                width: `${100 + i * 25}px`,
                height: `${100 + i * 25}px`,
                right: `${i * 18}px`,
                bottom: `${i * 18}px`,
                transform: 'rotate(45deg)',
              }}
            />
          ))}
        </div>
      </div>

      {/* Brand Badge */}
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

      {/* Registration Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="relative w-full max-w-md bg-white rounded-lg shadow-2xl p-8 mt-16"
      >
        {!emailSent ? (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-neutral-900 mb-2">Create Account</h2>
              <p className="text-sm text-neutral-600">Step 1: Verify your email address</p>
            </div>

            <Formik
              initialValues={{
                firstName: "",
                lastName: "",
                email: "",
              }}
              validationSchema={validationSchema}
              onSubmit={handleSendVerification}
            >
              {({ isSubmitting, touched, errors }) => (
                <Form className="space-y-4">
                  {/* First Name */}
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-sm font-medium text-neutral-700">
                      First Name <span className="text-red-500">*</span>
                    </Label>
                    <Field
                      as={Input}
                      id="firstName"
                      name="firstName"
                      type="text"
                      placeholder="John"
                      className={`h-11 rounded border-neutral-300 shadow-none focus-visible:ring-purple-500 ${
                        touched.firstName && errors.firstName ? "border-red-400" : ""
                      }`}
                    />
                    {touched.firstName && errors.firstName && (
                      <p className="text-xs text-red-600">{errors.firstName}</p>
                    )}
                  </div>

                  {/* Last Name */}
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-sm font-medium text-neutral-700">
                      Last Name <span className="text-red-500">*</span>
                    </Label>
                    <Field
                      as={Input}
                      id="lastName"
                      name="lastName"
                      type="text"
                      placeholder="Smith"
                      className={`h-11 rounded border-neutral-300 shadow-none focus-visible:ring-purple-500 ${
                        touched.lastName && errors.lastName ? "border-red-400" : ""
                      }`}
                    />
                    {touched.lastName && errors.lastName && (
                      <p className="text-xs text-red-600">{errors.lastName}</p>
                    )}
                  </div>

                  {/* Email Field */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-neutral-700">
                      Email <span className="text-red-500">*</span>
                    </Label>
                    <Field
                      as={Input}
                      id="email"
                      name="email"
                      type="email"
                      placeholder="john.smith@example.com"
                      className={`h-11 rounded border-neutral-300 shadow-none focus-visible:ring-purple-500 ${
                        touched.email && errors.email ? "border-red-400" : ""
                      }`}
                    />
                    {touched.email && errors.email && (
                      <p className="text-xs text-red-600">{errors.email}</p>
                    )}
                  </div>

                  {/* Error Message */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg border border-red-200"
                      >
                        {error}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isSubmitting || loading}
                    className="w-full h-11 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium rounded-lg transition-all disabled:opacity-50"
                  >
                    {isSubmitting || loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Sending verification email...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        Verify Email <ArrowRight className="w-4 h-4" />
                      </span>
                    )}
                  </Button>

                  {/* Login Link */}
                  <div className="text-center pt-4">
                    <p className="text-sm text-neutral-600">
                      Already have an account?{" "}
                      <button
                        type="button"
                        onClick={() => router.push("/login")}
                        className="text-purple-600 hover:text-purple-700 font-medium transition"
                      >
                        Log in
                      </button>
                    </p>
                  </div>
                </Form>
              )}
            </Formik>
          </>
        ) : (
          <div className="text-center py-8">
            <div className="flex justify-center mb-6">
              <Mail className="w-16 h-16 text-purple-600" />
            </div>
            <h2 className="text-2xl font-semibold text-neutral-900 mb-2">
              Check Your Email
            </h2>
            <p className="text-sm text-neutral-600 mb-6">
              We've sent a verification link to:
            </p>
            <p className="text-base font-medium text-purple-600 mb-6">
              {submittedEmail}
            </p>
            <p className="text-sm text-neutral-600 mb-4">
              Click the link in the email to verify your address and complete your registration.
            </p>
            <p className="text-xs text-neutral-500">
              <strong>Didn't receive the email?</strong> Check your spam folder or{" "}
              <button
                onClick={() => setEmailSent(false)}
                className="text-purple-600 hover:text-purple-700 font-medium"
              >
                try again
              </button>
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
