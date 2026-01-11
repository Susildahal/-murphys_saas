"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Eye, EyeOff } from "lucide-react";
import { auth } from "@/app/config/firebase";
import {
  getAuth,
  reauthenticateWithCredential,
  EmailAuthProvider,
  updatePassword,
} from "firebase/auth";
import { showSuccessToast, showErrorToast } from "@/lib/toast-handler";
import { formatAuthMessage } from "@/lib/firebaseAuthError";

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);

  const currentUser = getAuth().currentUser || auth.currentUser;
  const userEmail = currentUser?.email ?? "Not available";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      showErrorToast("Please fill all fields", "Validation Error");
      return;
    }

    if (newPassword !== confirmPassword) {
      showErrorToast(
        "New password and confirm password do not match",
        "Validation Error"
      );
      return;
    }

    if (newPassword.length < 6) {
      showErrorToast(
        "Password must be at least 6 characters",
        "Validation Error"
      );
      return;
    }

    setLoading(true);
    try {
      if (!currentUser || !currentUser.email) {
        throw new Error("No authenticated user found. Please login again.");
      }

      const credential = EmailAuthProvider.credential(
        currentUser.email,
        currentPassword
      );

      await reauthenticateWithCredential(currentUser, credential);
      await updatePassword(currentUser, newPassword);

      showSuccessToast("Password changed successfully", "Success");

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      // If this is a Firebase auth error with a string code like 'auth/xxx', map it to a friendly message
      if (typeof err?.code === "string" && /^auth\//i.test(err.code)) {
        const code = String(err.code).replace(/^auth\//i, "").replace(/-/g, "_").toUpperCase();
        const fbMessage = formatAuthMessage(code);
        showErrorToast(fbMessage, "Error");
        setLoading(false);
        return;
      }

      // Try to extract the most specific message from common API/error shapes
      let message: string | undefined;

      // 1) Axios-style response body: err.response.data
      try {
        const d = err?.response?.data;
        if (d) {
          // if data is a stringified JSON, try to parse
          const data = typeof d === "string" ? (() => {
            try { return JSON.parse(d); } catch (e) { return d; }
          })() : d;

          if (data) {
            if (typeof data === "string" && data.trim().length) message = data;
            if (!message && data.error) {
              if (typeof data.error === "string") message = data.error;
              else if (data.error.message) message = data.error.message;
              else if (Array.isArray(data.error.errors) && data.error.errors[0]?.message) message = data.error.errors[0].message;
            }
            if (!message && data.message) message = data.message;
            if (!message && Array.isArray(data.errors) && data.errors[0]?.message) message = data.errors[0].message;
          }
        }
      } catch (e) {
        // ignore
      }

      // 2) Top-level err.error
      if (!message && err?.error) {
        const eTop = err.error;
        if (typeof eTop === "string") message = eTop;
        else if (eTop?.message) message = eTop.message;
        else if (Array.isArray(eTop?.errors) && eTop.errors[0]?.message) message = eTop.errors[0].message;
      }

      // 3) Err.message
      if (!message && err?.message) message = err.message;

      // 4) If err is a string or toString() gives useful output
      if (!message && typeof err === "string" && err.trim()) message = err;
      if (!message && err?.toString) {
        const s = String(err.toString());
        if (s && s !== "[object Object]") message = s;
      }

      // 5) Try to parse JSON-like string if still unhelpful
      if (!message) {
        try {
          const parsed = JSON.parse(JSON.stringify(err));
          if (parsed?.error?.message) message = parsed.error.message;
          else if (parsed?.message) message = parsed.message;
        } catch (e) {
          // ignore
        }
      }

      // Final fallback
      if (!message) message = "";

      // Remove any occurrence of the word "Firebase" and any auth code like "auth/xxx" (case-insensitive)
      try {
        message = message
          .replace(/firebase[:\s-]*/ig, "")
          .replace(/\(?auth\/[^)\s]*\)?/ig, "")
          .replace(/auth[:\s-]*/ig, "")
          .trim();
      } catch (e) {
        // ignore if not a string
      }

      showErrorToast(message ?? "Failed to change password", "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="">
    <div className="p-4 max-w-2xl mx-auto   ">
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl">Security Settings</CardTitle>
          <CardDescription>
            Change your account password securely
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Email */}
          <div className="space-y-1">
            <Label>Email</Label>
            <Input value={userEmail} disabled />
          </div>

          <Separator />

          {/* Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Current password */}
            <div className="space-y-1">
              <Label>Current Password</Label>
              <div className="relative">
                <Input
                  type={showCurrent ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* New password */}
            <div className="space-y-1">
              <Label>New Password</Label>
              <div className="relative">
                <Input
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                Minimum 6 characters
              </p>
            </div>

            {/* Confirm password */}
            <div className="space-y-1">
              <Label>Confirm New Password</Label>
              <div className="relative">
                <Input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={loading}>
                {loading ? "Updating..." : "Update Password"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
    </div>
  );
}
