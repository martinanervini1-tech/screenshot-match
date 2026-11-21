import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Azulejo } from "@/components/night-desk/tile";
export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset staff password | Casa Lisboa" },
      {
        name: "description",
        content: "Securely reset your Casa Lisboa Night Desk staff password.",
      },
      { property: "og:title", content: "Reset staff password | Casa Lisboa" },
      { property: "og:description", content: "Recover your Casa Lisboa team account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ResetPassword,
});
function ResetPassword() {
  const [recovery, setRecovery] = useState(false);
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.slice(1));
    setRecovery(params.get("type") === "recovery");
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setRecovery(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-sm w-full">
        <Azulejo className="size-12 text-primary mb-5" />
        <h1 className="text-4xl font-serif mb-2">A fresh start.</h1>
        <p className="detail-copy mb-6">Casa Lisboa · Reset your staff password</p>
        {done ? (
          <>
            <p className="form-message">Your password has been updated.</p>
            <Button asChild className="mt-4">
              <a href="/">Return to the Night Desk</a>
            </Button>
          </>
        ) : recovery ? (
          <form
            className="auth-form"
            onSubmit={async (e) => {
              e.preventDefault();
              setBusy(true);
              const { error } = await supabase.auth.updateUser({ password });
              setBusy(false);
              if (error) setMessage(error.message);
              else setDone(true);
            }}
          >
            <label className="form-field">
              New password
              <input
                type="password"
                minLength={8}
                required
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
            {message && (
              <p role="alert" className="form-message">
                {message}
              </p>
            )}
            <Button disabled={busy} type="submit">
              {busy ? "Saving…" : "Update password"}
            </Button>
          </form>
        ) : (
          <>
            <p className="form-message">
              Open the password reset link from your email to choose a new password.
            </p>
            <Button variant="link" asChild>
              <a href="/">Return to the Night Desk</a>
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
