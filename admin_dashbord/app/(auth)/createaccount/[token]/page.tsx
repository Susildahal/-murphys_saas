"use client";
import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, UserPlus, XCircle, CheckCircle, AlertCircle } from "lucide-react";
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

import { useParams} from "next/navigation"



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

  // Normalize and extract the JWT if the token value was encoded or prefixed (e.g. "token=..." or double-encoded)
  const extractToken = (input: string) => {
    if (!input) return "";
    let v = input;
    // Try decoding multiple times in case of double-encoding (e.g. %253D)
    for (let i = 0; i < 5; i++) {
      try {
        const decoded = decodeURIComponent(v);
        if (decoded === v) break;
        v = decoded;
      } catch {
        break;
      }
    }
    // Remove any leading query-like prefix (token=, ?token=, &token=)
    v = v.replace(/^[\?&]*token=/i, "");
    // Extract JWT-like pattern if present
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
    
   setUser(response.data.data)
   setEmail(response.data.data.email);
  
    }
    catch (error: any) {
        setMessageType('error');
        setMessage(error?.response?.data?.message || 'Invalid or expired token.');
        // Don't close dialog on error, keep it open to show the error message
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
      // If the backend call fails, still allow the user to proceed to create an account
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
      },100);
    } catch (err: any) 
    {
      if(err.code === 'auth/email-already-in-use') {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-6">
      {/* Shadcn Alert Dialog */}
      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                <Mail className="w-6 h-6 text-primary-foreground" />
              </div>
            </div>
            <AlertDialogTitle className="text-center text-2xl">
              Invitation Received
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              You've been invited to join our platform.
            </AlertDialogDescription>
            <div className="text-center space-y-4 mt-3">
              <div className=" rounded-lg p-3 inline-block text-left">
                <p className="text-xs text-muted-foreground mb-1"> { user && `Hii ${user?.firstName} ${user?.lastName}`}</p> 
                { user && (
                <>
                <p className="text-xs text-muted-foreground mb-1">Invite for:</p>
                <p className="font-semibold text-foreground">{user?.email || 'your email'}</p>
                </>
                )}  
              </div>
              { user &&  <div>Would you like to accept this invitation?</div> }
              {user === undefined && <div > <Button> <Link href="/login">Go to login page</Link> </Button>  </div>}
            </div>
          </AlertDialogHeader>
          
          {message && messageType === 'error' && (
            <Alert variant="destructive">g
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel 
              onClick={handleRejectInvite}
              disabled={loading || (messageType === 'error' && !!message)}
              className="w-full sm:w-auto"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Declining...
                </>
              ) : (
                'Decline'
              )}
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleAcceptInvite}
              disabled={loading || (messageType === 'error' && !!message)}
              className="w-full sm:w-auto"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Accept Invitation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Account Creation Form */}
      {showForm && (
        <div className="w-full max-w-md">
          <div className="bg-card rounded-lg shadow-lg border p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-primary rounded-full mb-4">
                <UserPlus className="w-7 h-7 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-bold mb-2">Create Your Account</h1>
              <p className="text-sm text-muted-foreground">
                Set up your password to get started
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-10 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-10 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {message && (
                <Alert variant={messageType === 'success' ? 'default' : 'destructive'}>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{message}</AlertDescription>
                </Alert>
              )}

              <button
                onClick={handleCreateAccount}
                disabled={loading}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Creating Account...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Create Account
                  </>
                )}
              </button>
            </div>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <a href="/login" className="text-primary font-medium hover:underline">
                Sign in
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateAccountPage;