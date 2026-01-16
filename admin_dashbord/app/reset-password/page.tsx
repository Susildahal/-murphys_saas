"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// Small client redirector so both query-style links ( ?mode=...&oobCode=... ) and
// path-style links (/reset-password/<mode>?oobCode=...) work. Some Firebase email
// links use query params; your app had a dynamic route expecting the mode as a path
// segment which caused 404s when visitors opened links containing only query params.

export default function ResetPasswordRedirect() {
  const router = useRouter();
  const search = useSearchParams();

  useEffect(() => {
    // Read the mode and codes from query string
    const mode = search?.get("mode");
    const oobCode = search?.get("oobCode");
    const apiKey = search?.get("apiKey");
    const continueUrl = search?.get("continueUrl");

    if (mode) {
      // Build destination preserving other params
      const params = new URLSearchParams();
      if (oobCode) params.set("oobCode", oobCode);
      if (apiKey) params.set("apiKey", apiKey);
      if (continueUrl) params.set("continueUrl", continueUrl);

      const dest = `/reset-password/${encodeURIComponent(mode)}${params.toString() ? `?${params.toString()}` : ""}`;
      // Replace so back button is clean
      router.replace(dest);
      return;
    }

    // No mode in query — if someone visits /reset-password directly, just stay here or
    // navigate to a default help page. We'll navigate to the page that instructs the user
    // how to request a reset.
    router.replace('/forgot-password');
  }, [router, search]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="text-center">
        <p className="text-sm text-muted-foreground">Redirecting to reset page...</p>
      </div>
    </div>
  );
}
