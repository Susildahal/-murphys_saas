'use client';

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Image from "next/image";
import axiosInstance from "@/lib/axios";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import app from "@/app/config/firebase";

const validationSchema = Yup.object({
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], "Passwords must match")
    .required("Please confirm your password"),
  phone: Yup.string()
    .matches(/^(\+61|0)?[2-478](?:[ -]?[0-9]){8}$/, "Invalid Australian phone number")
    .required("Phone number is required"),
  gender: Yup.string().required("Gender is required"),  
});

export default function CompleteRegistrationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [verifying, setVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [passwordClick, setPasswordClick] = useState(false);
  const [confirmPasswordClick, setConfirmPasswordClick] = useState(false);

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setError('No verification token provided');
        setVerifying(false);
        return;
      }

      try {
        const response = await axiosInstance.get(`/auth/verify-token?token=${token}`);
        
        if (response.data.success) {
          setTokenValid(true);
          setUserData(response.data.data);
        }
      } catch (err: any) {
        console.error('Token verification error:', err);
        setError(err.response?.data?.message || 'Invalid or expired token');
      } finally {
        setVerifying(false);
      }
    };

    verifyToken();
  }, [token]);

  const handleCompleteRegistration = async (values: any, { setSubmitting }: any) => {
    setLoading(true);
    setError(null);

    try {
      const auth = getAuth(app);

      // 1. Create Firebase user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        userData.email,
        values.password
      );

      // 2. Get Firebase ID token
      const idToken = await userCredential.user.getIdToken();

      // 3. Complete registration in backend
      const response = await axiosInstance.post('/auth/register', {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        gender: values.gender,
        phone: values.phone,
        country: "Australia",
        referralSource: values.referralSource || '',
      }, {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });

      if (response.data.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || err.message || 'Registration failed');
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4 relative overflow-hidden">
      {/* Geometric Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
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
      </div>

      {/* Brand Logo */}
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
        {verifying ? (
          <div className="text-center py-8">
            <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
            <p className="text-neutral-600">Verifying your email...</p>
          </div>
        ) : !tokenValid ? (
          <div className="text-center py-8">
            <div className="text-red-500 mb-4">✕</div>
            <h2 className="text-xl font-semibold text-neutral-900 mb-2">Verification Failed</h2>
            <p className="text-sm text-neutral-600 mb-6">{error}</p>
            <Button
              onClick={() => router.push('/register')}
              className="w-full h-11 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium rounded-lg transition-all"
            >
              Start Over
            </Button>
          </div>
        ) : success ? (
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-neutral-900 mb-2">
              Registration Complete!
            </h2>
            <p className="text-sm text-neutral-600">
              Redirecting to login...
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-neutral-900 mb-2">Complete Registration</h2>
              <p className="text-sm text-neutral-600">
                Email verified for: <strong>{userData?.email}</strong>
              </p>
            </div>

            <Formik
              initialValues={{
                password: "",
                confirmPassword: "",
                phone: "",
                gender: "",
                referralSource: "",
              }}
              validationSchema={validationSchema}
              onSubmit={handleCompleteRegistration}
            >
              {({ isSubmitting, touched, errors, setFieldValue, values }) => (
                <Form className="space-y-4">
                  {/* Phone & Gender */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm font-medium text-neutral-700">
                        Phone Number <span className="text-red-500">*</span>
                      </Label>
                      <Field
                        as={Input}
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="0412 345 678"
                        className={`h-11 rounded border-neutral-300 shadow-none focus-visible:ring-purple-500 ${
                          touched.phone && errors.phone ? "border-red-400" : ""
                        }`}
                      />
                      {touched.phone && errors.phone && (
                        <p className="text-xs text-red-600">{errors.phone}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="gender" className="text-sm font-medium text-neutral-700">
                        Gender <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={values.gender}
                        onValueChange={(value) => setFieldValue('gender', value)}
                      >
                        <SelectTrigger className={`h-11 ${touched.gender && errors.gender ? "border-red-400" : ""}`}>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                          <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                        </SelectContent>
                      </Select>
                      {touched.gender && errors.gender && (
                        <p className="text-xs text-red-600">{errors.gender}</p>
                      )}
                    </div>
                  </div>

                  {/* Password Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm font-medium text-neutral-700">
                        Password <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Field
                          as={Input}
                          id="password"
                          name="password"
                          type={passwordClick ? "text" : "password"}
                          placeholder="••••••••"
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

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-sm font-medium text-neutral-700">
                        Confirm Password <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Field
                          as={Input}
                          id="confirmPassword"
                          name="confirmPassword"
                          type={confirmPasswordClick ? "text" : "password"}
                          placeholder="••••••••"
                          className={`h-11 pr-10 rounded border-neutral-300 shadow-none focus-visible:ring-purple-500 ${
                            touched.confirmPassword && errors.confirmPassword ? "border-red-400" : ""
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setConfirmPasswordClick(!confirmPasswordClick)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                        >
                          {confirmPasswordClick ? <EyeOff className="w-4 h-4 text-blue-700" /> : <Eye className="w-4 h-4 text-blue-600" />}
                        </button>
                      </div>
                      {touched.confirmPassword && errors.confirmPassword && (
                        <p className="text-xs text-red-600">{errors.confirmPassword}</p>
                      )}
                    </div>
                  </div>

                  {/* Referral Source */}
                  <div className="space-y-2">
                    <Label htmlFor="referralSource" className="text-sm font-medium text-neutral-700">
                      How did you hear about us? (Optional)
                    </Label>
                    <Field
                      as={Input}
                      id="referralSource"
                      name="referralSource"
                      type="text"
                      placeholder="e.g., Google, friend referral, social media"
                      className="h-11 rounded border-neutral-300 shadow-none focus-visible:ring-purple-500"
                    />
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
                        Creating account...
                      </span>
                    ) : (
                      "Complete Registration"
                    )}
                  </Button>
                </Form>
              )}
            </Formik>
          </>
        )}
      </motion.div>
    </div>
  );
}
