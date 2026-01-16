"use client";
import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, UserPlus, CheckCircle, AlertCircle, Sparkles } from "lucide-react";
import axiosInstance from "@/lib/axios";
import { registerUser } from "@/lib/registerUser";
import { createUserInFirestore } from "@/lib/firebaseUser";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useParams } from "next/navigation";

interface CreateAccountPageProps {
  token?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}

const CreateAccountPage = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const pathToken = (params as { token?: string })?.token;
  const queryToken = searchParams?.get?.("token");
  const token = pathToken ?? queryToken ?? "";

  const extractToken = (input: string) => {
    if (!input) return "";
    let v = input;
    for (let i = 0; i < 5; i++) {
      try {
        const decoded = decodeURIComponent(v);
        if (decoded === v) break;
        v = decoded;
      } catch {
        break;
      }
    }
    v = v.replace(/^[\?&]*token=/i, "");
    const jwt = v.match(/[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/);
    return jwt ? jwt[0] : v;
  };

  const raw = extractToken(token);
  const encoded = encodeURIComponent(raw);

  const [showDialog, setShowDialog] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'success' | 'error'>('error');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [user, setUser] = useState<CreateAccountPageProps | undefined>();

  const validate = () => {
    if (!email) return "Email is required";
    if (!password) return "Password is required";
    if (password.length < 6) return "Password must be at least 6 characters";
    if (password !== confirmPassword) return "Passwords do not match";
    return null;
  };

  const varifyEmailFromToken = async (token: string) => {
    try {
      const response = await axiosInstance.post(`/invite/verify-token`, {
        token: encoded,
      });
      setUser(response.data.data);
      setEmail(response.data.data.email);
    } catch (error: any) {
      setMessageType('error');
      setMessage(error?.response?.data?.message || 'Invalid or expired token.');
    }
  };

  useEffect(() => {
    if (token) {
      varifyEmailFromToken(token);
    }
  }, [token]);

  const handleAcceptInvite = async () => {
    if (!email) {
      setMessage('No email to accept');
      setMessageType('error');
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      await axiosInstance.post('/invite/update-status', {
        email,
        status: 'accepted'
      });
      setMessageType('success');
      setMessage('Invite accepted. Please set up your account.');
    } catch (err: any) {
      setMessageType('error');
      setMessage(err?.message || 'Failed to accept invite. You can still create an account.');
    } finally {
      setLoading(false);
      setShowDialog(false);
      setShowForm(true);
    }
  };

  const handleRejectInvite = async () => {
    if (!email) {
      setMessage('No email to reject');
      setMessageType('error');
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      await axiosInstance.post('/invite/update-status', {
        email,
        status: 'rejected'
      });
      setMessageType('success');
      setMessage('Invite rejected successfully.');
      setShowDialog(false);
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    } catch (err: any) {
      setMessageType('error');
      setMessage(err?.message || 'Failed to reject invite.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = async () => {
    setMessage(null);
    const error = validate();
    if (error) {
      setMessage(error);
      setMessageType('error');
      return;
    }
    setLoading(true);
    try {
      await registerUser(email, password);
      await createUserInFirestore({ email });
      setMessageType('success');
      setMessage('Account created successfully.');
      setTimeout(() => {
        window.location.href = '/profile';
      }, 100);
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setMessage('Email is already in use. Please log in instead.');
      } else {
        setMessage(err?.message || 'Failed to create account.');
      }
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-1000"></div>
      </div>

      {/* Invitation Dialog */}
      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent className="max-w-md border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
          <AlertDialogHeader>
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Mail className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
              </div>
            </div>
            <AlertDialogTitle className="text-center text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              You're Invited!
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-gray-600 text-base mt-2">
              Join our platform and start your journey
            </AlertDialogDescription>
            
            <div className="text-center space-y-4 mt-6">
              {user && (
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-5 border border-blue-100">
                  <p className="text-sm text-gray-500 mb-2">Welcome,</p>
                  <p className="text-lg font-semibold text-gray-800 mb-3">
                    {user.firstName} {user.lastName}
                  </p>
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4" />
                    <p className="font-medium">{user.email}</p>
                  </div>
                </div>
              )}
              
              {user && (
                <p className="text-gray-700 font-medium">
                  Would you like to accept this invitation?
                </p>
              )}
              
              {user === undefined && (
                <div className="py-4">
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg">
                    <Link href="/login">Go to Login</Link>
                  </Button>
                </div>
              )}
            </div>
          </AlertDialogHeader>

          {message && messageType === 'error' && (
            <Alert variant="destructive" className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          <AlertDialogFooter className="flex-col sm:flex-row gap-3 mt-6">
            <AlertDialogCancel
              onClick={handleRejectInvite}
              disabled={loading || (messageType === 'error' && !!message)}
              className="w-full sm:w-auto border-gray-300 hover:bg-gray-100"
            >
              {loading ? 'Declining...' : 'Decline'}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleAcceptInvite}
              disabled={loading || (messageType === 'error' && !!message)}
              className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Accept Invitation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Account Creation Form */}
      {showForm && (
        <div className="w-full max-w-md relative z-10">
          <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 p-8 md:p-10">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
                <UserPlus className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Create Account
              </h1>
              <p className="text-gray-600">
                Set up your password to get started
              </p>
            </div>

            {/* Form */}
            <div className="space-y-5">
              {/* Email Field */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">
                  Email Address
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-12 pl-12 pr-4 rounded-xl border-2 border-gray-200 bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none text-gray-800"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">
                  Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-12 pl-12 pr-12 rounded-xl border-2 border-gray-200 bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none text-gray-800"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">
                  Confirm Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full h-12 pl-12 pr-12 rounded-xl border-2 border-gray-200 bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none text-gray-800"
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Message Alert */}
              {message && (
                <Alert variant={messageType === 'success' ? 'default' : 'destructive'} className={messageType === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{message}</AlertDescription>
                </Alert>
              )}

              {/* Submit Button */}
              <button
                onClick={handleCreateAccount}
                disabled={loading}
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Creating Account...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5" />
                    Create Account
                  </>
                )}
              </button>
            </div>

            {/* Footer */}
            <div className="mt-8 text-center">
              <p className="text-gray-600">
                Already have an account?{" "}
                <a href="/login" className="text-blue-600 font-semibold hover:text-purple-600 transition-colors">
                  Sign in
                </a>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateAccountPage;