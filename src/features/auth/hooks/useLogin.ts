import { useCallback, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";

type UseLoginOptions = {
  redirectTo?: string;
};

export function useLogin(options: UseLoginOptions = {}) {
  const { redirectTo = "/dashboard" } = options;

  const navigate = useNavigate();
  const translateApp = useTranslation().t;
  const { signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const resetError = useCallback(() => setError(""), []);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setError("");
      setLoading(true);

      try {
        const { error: signInError } = await signIn(email, password);

        if (signInError) {
          // Si ton backend renvoie error.message
          setError(signInError.message ?? translateApp("auth.login.error"));
          showToast(
            signInError.message ?? translateApp("auth.login.error"),
            "error",
          );
          return;
        }

        navigate(redirectTo);
      } catch {
        setError(translateApp("auth.login.error"));
      } finally {
        setLoading(false);
      }
    },
    [email, password, signIn, navigate, redirectTo, translateApp],
  );

  return {
    // i18n
    translateApp,

    // fields
    email,
    setEmail,
    password,
    setPassword,

    // ui state
    error,
    loading,

    // actions
    handleSubmit,
    resetError,
  };
}
