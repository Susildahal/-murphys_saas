'use client';
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { motion, AnimatePresence } from "framer-motion";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmailModal } from "@/app/page/email-model";
import {
  getAuth,
  sendSignInLinkToEmail,
} from "firebase/auth";
import app from "@/app/config/firebase";
import axiosInstance from "@/lib/axios";

const validationSchema = Yup.object({
  email: Yup.string().email("Invalid email").required("Email is required"),
  firstName: Yup.string().required("First name is required"),
  lastName: Yup.string().required("Last name is required"),
});

export default function RegisterPage() {
  const auth = getAuth(app);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalStatus, setModalStatus] = useState<string | null>(null);

  const emailLinkConfig = {
    url: `${typeof window !== "undefined" ? window.location.origin : ""}/email-link-callback`,
    handleCodeInApp: true,
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-100 to-neutral-200 p-6">

      {/* Registration Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm bg-white/95 backdrop-blur-sm rounded-2xl border border-neutral-200 shadow-lg shadow-black/5 p-8"
      >
        {!emailSent ? (
          <>
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-semibold text-neutral-900 mb-2">
                Create your account
              </h2>
              <p className="text-neutral-500 text-sm">
                Join us today and start your journey with a verified account.
              </p>
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
                  <div className="space-y-1.5">
                    <label htmlFor="firstName" className="block text-sm font-medium text-neutral-700">
                      First Name
                    </label>
                    <Field
                      as={Input}
                      id="firstName"
                      name="firstName"
                      type="text"
                      placeholder="John"
                      className={`block w-full px-3 py-2 h-12 bg-white border border-neutral-200 rounded-lg text-sm placeholder-neutral-400 focus:outline-none focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200 transition-all duration-150 ${
                        touched.firstName && errors.firstName ? "border-red-400" : ""
                      }`}
                    />
                    {touched.firstName && errors.firstName && (
                      <p className="text-xs text-red-600">{errors.firstName}</p>
                    )}
                  </div>

                  {/* Last Name */}
                  <div className="space-y-1.5">
                    <label htmlFor="lastName" className="block text-sm font-medium text-neutral-700">
                      Last Name
                    </label>
                    <Field
                      as={Input}
                      id="lastName"
                      name="lastName"
                      type="text"
                      placeholder="Smith"
                      className={`block w-full px-3 py-2 h-12 bg-white border border-neutral-200 rounded-lg text-sm placeholder-neutral-400 focus:outline-none focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200 transition-all duration-150 ${
                        touched.lastName && errors.lastName ? "border-red-400" : ""
                      }`}
                    />
                    {touched.lastName && errors.lastName && (
                      <p className="text-xs text-red-600">{errors.lastName}</p>
                    )}
                  </div>

                  {/* Email Field */}
                  <div className="space-y-1.5">
                    <label htmlFor="email" className="block text-sm font-medium text-neutral-700">
                      Email
                    </label>
                    <Field
                      as={Input}
                      id="email"
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      className={`block w-full px-3 py-2 h-12 bg-white border border-neutral-200 rounded-lg text-sm placeholder-neutral-400 focus:outline-none focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200 transition-all duration-150 ${
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
                        className="rounded-md bg-red-50 p-3 flex items-start gap-2"
                      >
                        <svg className="h-4 w-4 text-red-600 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <p className="text-sm text-red-600">{error}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isSubmitting || loading}
                    className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-neutral-900 hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-900 transition-all duration-150 disabled:opacity-70 disabled:cursor-not-allowed mt-6"
                  >
                    {isSubmitting || loading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating Account...
                      </span>
                    ) : (
                      "Sign Up"
                    )}
                  </Button>

                  {/* Magic Link Button */}
                </Form>
              )}
            </Formik>

            {/* Login Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-neutral-500">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => router.push('/login')}
                  className="font-medium text-neutral-900 hover:text-neutral-700 transition-colors"
                >
                  Log In
                </button>
              </p>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center">
                <Mail className="w-8 h-8 text-neutral-900" />
              </div>
            </div>
            <h2 className="text-2xl font-semibold text-neutral-900 mb-2">
              Check Your Email
            </h2>
            <p className="text-sm text-neutral-500 mb-6">
              We've sent a verification link to:
            </p>
            <p className="text-base font-medium text-neutral-900 mb-6">
              {submittedEmail}
            </p>
            <p className="text-sm text-neutral-500 mb-4">
              Click the link in the email to verify your address and complete your registration.
            </p>
            <p className="text-xs text-neutral-500">
              Didn't receive the email? Check your spam folder or{" "}
              <button
                onClick={() => setEmailSent(false)}
                className="font-medium text-neutral-900 hover:text-neutral-700 transition-colors"
              >
                try again
              </button>
            </p>
          </div>
        )}
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
