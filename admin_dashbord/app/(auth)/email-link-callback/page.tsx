"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import app from "@/app/config/firebase";
import { getAuth, isSignInWithEmailLink, signInWithEmailLink } from "firebase/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function EmailLinkCallback() {
  const router = useRouter();
  const auth = getAuth(app);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showEmailInput, setShowEmailInput] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = window.location.href;
    if (isSignInWithEmailLink(auth, url)) {
      let storedEmail = window.localStorage.getItem("emailForSignIn") || "";
      if (!storedEmail) {
        setShowEmailInput(true);
      } else {
        setEmail(storedEmail);
        handleSignIn(storedEmail, url);
      }
    } else {
      setStatus("Invalid or expired sign-in link.");
    }
    // eslint-disable-next-line
  }, []);

  const handleSignIn = async (emailToUse: string, url?: string) => {
    setLoading(true);
    setStatus(null);
    try {
      const result = await signInWithEmailLink(auth, emailToUse, url || window.location.href);
      window.localStorage.removeItem("emailForSignIn");
      setStatus("Sign-in successful! Redirecting...");
      setTimeout(() => router.push("/admin/dashboard"), 1500);
    } catch (error: any) {
      setStatus(error.message || "Sign-in failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    handleSignIn(email);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold mb-4">Email Link Sign-In</h1>
      {showEmailInput ? (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-xs">
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <Button type="submit" disabled={loading}>{loading ? "Signing in..." : "Sign In"}</Button>
        </form>
      ) : (
        <Button disabled>{loading ? "Signing in..." : "Processing..."}</Button>
      )}
      {status && <div className={`mt-4 text-center ${status.includes("success") ? "text-green-600" : "text-red-600"}`}>{status}</div>}
    </div>
  );
}
