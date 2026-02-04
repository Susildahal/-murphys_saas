'use client'

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

export default function CompleteRegistrationClient() {
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-lg bg-white border border-gray-200 p-10"
      >
        {verifying ? (
          <div className="text-center py-12">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600 text-base">Verifying your email...</p>
          </div>
        ) : !tokenValid ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-6 bg-red-100 flex items-center justify-center text-red-600 text-3xl font-bold">
              ✕
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Verification Failed</h2>
            <p className="text-base text-gray-600 mb-8">{error}</p>
            <Button
              onClick={() => router.push('/register')}
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white text-base"
            >
              Start Over
            </Button>
          </div>
        ) : success ? (
          <div className="text-center py-12">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Registration Complete!
            </h2>
            <p className="text-base text-gray-600">
              Redirecting to login...
            </p>
          </div>
        ) : (
          <>
            <div className="mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Complete Registration</h2>
              <p className="text-base text-gray-500">
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
                <Form className="space-y-5">
                  {/* Phone & Gender */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Field
                        as={Input}
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="Phone Number"
                        className={`h-12 text-base ${touched.phone && errors.phone ? "border-red-500" : ""
                          }`}
                      />
                      {touched.phone && errors.phone && (
                        <p className="text-sm text-red-600 mt-2">{errors.phone}</p>
                      )}
                    </div>

                    <div>
                      <Select
                        value={values.gender}
                        onValueChange={(value) => setFieldValue('gender', value)}
                      >
                        <SelectTrigger className={`h-12 text-base ${touched.gender && errors.gender ? "border-red-500" : ""}`}>
                          <SelectValue placeholder="Gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                          <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                        </SelectContent>
                      </Select>
                      {touched.gender && errors.gender && (
                        <p className="text-sm text-red-600 mt-2">{errors.gender}</p>
                      )}
                    </div>
                  </div>

                  {/* Password Fields */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="relative">
                        <Field
                          as={Input}
                          id="password"
                          name="password"
                          type={passwordClick ? "text" : "password"}
                          placeholder="Password"
                          className={`h-12 text-base pr-12 ${touched.password && errors.password ? "border-red-500" : ""
                            }`}
                        />
                        <button
                          type="button"
                          onClick={() => setPasswordClick(!passwordClick)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {passwordClick ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {touched.password && errors.password && (
                        <p className="text-sm text-red-600 mt-2">{errors.password}</p>
                      )}
                    </div>

                    <div>
                      <div className="relative">
                        <Field
                          as={Input}
                          id="confirmPassword"
                          name="confirmPassword"
                          type={confirmPasswordClick ? "text" : "password"}
                          placeholder="Confirm Password"
                          className={`h-12 text-base pr-12 ${touched.confirmPassword && errors.confirmPassword ? "border-red-500" : ""
                            }`}
                        />
                        <button
                          type="button"
                          onClick={() => setConfirmPasswordClick(!confirmPasswordClick)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {confirmPasswordClick ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {touched.confirmPassword && errors.confirmPassword && (
                        <p className="text-sm text-red-600 mt-2">{errors.confirmPassword}</p>
                      )}
                    </div>
                  </div>

                  {/* Referral Source */}
                  <div>
                    <Field
                      as={Input}
                      id="referralSource"
                      name="referralSource"
                      type="text"
                      placeholder="How did you hear about us? (Optional)"
                      className="h-12 text-base"
                    />
                  </div>

                  {/* Error Message */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-red-50 text-red-800 text-sm p-4 border border-red-200"
                      >
                        {error}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isSubmitting || loading}
                    className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white text-base"
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
