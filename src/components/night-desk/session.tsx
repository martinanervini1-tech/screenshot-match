import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { LovableMark } from "@lovable.dev/cloud-auth-js/react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
const SessionContext = createContext<{
  user: User | null;
  staff: boolean;
  name: string;
  openAccount: () => void;
}>({ user: null, staff: false, name: "Hotel team", openAccount: () => {} });
export const useStaff = () => useContext(SessionContext);
export function StaffProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [staff, setStaff] = useState(false);
  const [name, setName] = useState("Hotel team");
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [mode, setMode] = useState<"signin" | "signup" | "forgot">("signin");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    let active = true;
    async function sync() {
      const { data } = await supabase.auth.getUser();
      if (!active) return;
      setUser(data.user);
      setStaff(false);
      if (data.user) {
        const [profile, role] = await Promise.all([
          supabase.from("profiles").select("display_name").eq("id", data.user.id).single(),
          supabase.rpc("is_staff"),
        ]);
        if (!active) return;
        setName(profile.data?.display_name || "Hotel team");
        setDisplayName(profile.data?.display_name || "");
        setStaff(Boolean(role.data));
      } else setName("Hotel team");
    }
    void sync();
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (!["SIGNED_IN", "SIGNED_OUT", "USER_UPDATED"].includes(event)) return;
      setTimeout(() => {
        void sync();
        if (event !== "SIGNED_OUT") void queryClient.invalidateQueries();
        else queryClient.removeQueries({ queryKey: ["desk", "staff"] });
      }, 0);
    });
    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [queryClient]);
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      if (user) {
        const { error } = await supabase
          .from("profiles")
          .update({ display_name: displayName })
          .eq("id", user.id);
        if (error) throw error;
        setName(displayName);
        toast.success("Your profile was saved");
        setOpen(false);
      } else if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setOpen(false);
      } else if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin, data: { display_name: displayName } },
        });
        if (error) throw error;
        setMessage(
          "Check your email to confirm your account. Your manager will then need to approve staff access.",
        );
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin + "/reset-password",
        });
        if (error) throw error;
        setMessage("If an account exists for this address, a password reset link is on its way.");
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  }
  async function social(provider: "google" | "lovable") {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth(provider, {
      redirect_uri: window.location.origin,
    });
    setBusy(false);
    if (result.error) setMessage(result.error.message);
    else if (!result.redirected) setOpen(false);
  }
  return (
    <SessionContext.Provider
      value={{
        user,
        staff,
        name,
        openAccount: () => {
          setOpen(true);
          setMessage("");
        },
      }}
    >
      {children}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogTitle>
            {user
              ? "Your staff profile"
              : mode === "signup"
                ? "Join the Casa Lisboa team"
                : mode === "forgot"
                  ? "Reset your password"
                  : "Welcome back to Casa Lisboa"}
          </DialogTitle>
          <DialogDescription>
            {user
              ? staff
                ? "Approved hotel staff"
                : "Your account is awaiting staff approval."
              : "Team access to the Night Desk."}
          </DialogDescription>
          <form className="auth-form" onSubmit={submit}>
            {(user || mode === "signup") && (
              <label className="form-field">
                Display name
                <input
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  maxLength={100}
                />
              </label>
            )}
            {!user && (
              <>
                <label className="form-field">
                  Email address
                  <input
                    required
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </label>
                {mode !== "forgot" && (
                  <label className="form-field">
                    Password
                    <input
                      required
                      type="password"
                      minLength={8}
                      autoComplete={mode === "signin" ? "current-password" : "new-password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </label>
                )}
              </>
            )}
            {message && (
              <p className="form-message" role="status">
                {message}
              </p>
            )}
            <Button disabled={busy} type="submit">
              {busy
                ? "Please wait…"
                : user
                  ? "Save profile"
                  : mode === "signup"
                    ? "Create account"
                    : mode === "forgot"
                      ? "Send reset link"
                      : "Sign in"}
            </Button>
          </form>
          {user ? (
            <Button
              variant="outline"
              onClick={async () => {
                await supabase.auth.signOut();
                setOpen(false);
              }}
            >
              Sign out
            </Button>
          ) : (
            <>
              {mode !== "forgot" && (
                <>
                  <div className="auth-separator">or</div>
                  <Button variant="outline" disabled={busy} onClick={() => social("google")}>
                    <svg aria-hidden="true" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"
                      />
                    </svg>
                    Continue with Google
                  </Button>
                  <Button variant="outline" disabled={busy} onClick={() => social("lovable")}>
                    <LovableMark />
                    Continue with Lovable
                  </Button>
                </>
              )}
              <div className="flex justify-between gap-2">
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => {
                    setMode(mode === "signup" ? "signin" : "signup");
                    setMessage("");
                  }}
                >
                  {mode === "signup" ? "Already have an account?" : "Create a team account"}
                </Button>
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => {
                    setMode(mode === "forgot" ? "signin" : "forgot");
                    setMessage("");
                  }}
                >
                  {mode === "forgot" ? "Back to sign in" : "Forgot password?"}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </SessionContext.Provider>
  );
}
