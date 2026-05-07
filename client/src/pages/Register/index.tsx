import { useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useTranslation } from "react-i18next";
import CAuth from "../Login/style";
import Logo from "@/components/Logo";
import Stepper from "@/components/ui/Stepper";
import { ArrowLeft, MailWarning, Mail, Lock, User } from "lucide-react";
import { useToast } from "@/contexts/ToastContext";
import { isEmailValid } from "@/features/auth/helper";

export const RegisterPage = () => {
  const translateApp = useTranslation().t;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const { signUp } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const checkPasswordStrength = (
    password: string,
  ): {
    short: boolean;
    noNumber: boolean;
    noSpecial: boolean;
    upper: boolean;
  } => {
    // Minimum 8 characters, at least one uppercase letter, one lowercase letter, one number and one special character
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()-+]).{8,}$/;
    return {
      short: password.length < 8,
      noNumber: !/\d/.test(password),
      noSpecial: !/[!@#$%^&*()-+]/.test(password),
      upper: !/[A-Z]/.test(password),
    };
  };

  const similarPassword = (): boolean => {
    return password === confirmPassword;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    const { error } = await signUp(email, password, name);

    if (error) {
      setError(error.message);
      showToast(error.message, "error");
      setLoading(false);
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <CAuth.Container>
      <CAuth.Content>
        <div>
          <div className="flex justify-between align-center gap-7">
            <Logo />
            {step > 1 && (
              <Button
                type="button"
                className="w-full"
                onClick={() => {
                  setStep((prev) => prev - 1);
                }}
                variant="ghost"
              >
                <ArrowLeft className="w-4 h-4" />
                Prev
              </Button>
            )}
          </div>
        </div>
        <div className="atel-login">
          {error && (
            <div className="error-submit p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
              {error}
            </div>
          )}
          {step === 1 ? (
            <div className="text-center">
              <h1 className="text-[2.5rem]">
                {translateApp("auth.register.title")}
              </h1>
              <p className="mt-2">{translateApp("auth.register.subtitle")}</p>
            </div>
          ) : (
            <>
              <div className="center-block">
                <Stepper currentStep={step - 1} />
              </div>
            </>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {step === 1 && (
              <>
                <Input
                  label={translateApp("auth.register.email")}
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={
                    email && !isEmailValid(email)
                      ? translateApp("auth.register.errors.invalidEmail")
                      : undefined
                  }
                  required
                >
                  {email && !isEmailValid(email) ? (
                    <MailWarning className="text-red-500" />
                  ) : (
                    <Mail className="w-4 h-4 text-gray-400" />
                  )}
                </Input>
                <Button
                  type="button"
                  className="w-full"
                  onClick={() => {
                    setStep(2);
                  }}
                  disabled={!isEmailValid(email)}
                >
                  {translateApp("auth.register.next")}
                </Button>
              </>
            )}
            {step === 2 && (
              <>
                <Input
                  label={translateApp("auth.register.fullName")}
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  error={
                    name.length < 2 && name.length > 0
                      ? "Name must be at least 2 characters"
                      : undefined
                  }
                  required
                >
                  <User
                    className={`w-4 h-4 ${name.length < 2 && name.length > 0 ? "text-red-500" : "text-gray-400"}`}
                  />
                </Input>
                <Button
                  type="button"
                  className="w-full"
                  onClick={() => {
                    setStep(3);
                  }}
                  disabled={name.length < 2}
                >
                  {translateApp("auth.register.next")}
                </Button>
              </>
            )}
            {step === 3 && (
              <>
                <Input
                  label={translateApp("auth.register.password")}
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={
                    password && checkPasswordStrength(password).short
                      ? translateApp("auth.register.errors.passwordTooShort")
                      : checkPasswordStrength(password).noNumber
                        ? translateApp("auth.register.errors.passwordNoNumber")
                        : checkPasswordStrength(password).noSpecial
                          ? translateApp(
                              "auth.register.errors.passwordNoSpecial",
                            )
                          : checkPasswordStrength(password).upper
                            ? translateApp(
                                "auth.register.errors.passwordNoUpper",
                              )
                            : undefined
                  }
                  required
                >
                  <Lock
                    className={`w-4 h-4 ${password && (checkPasswordStrength(password).upper || checkPasswordStrength(password).noSpecial || checkPasswordStrength(password).short || checkPasswordStrength(password).noNumber) ? "text-red-500" : "text-gray-400"}`}
                  />
                </Input>

                <Input
                  label="Confirm Password"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  error={
                    confirmPassword.length > 0 && !similarPassword()
                      ? translateApp("auth.register.errors.passwordsNoMatch")
                      : undefined
                  }
                  required
                >
                  <Lock
                    className={`w-4 h-4 ${confirmPassword.length > 0 && !similarPassword() ? "text-red-500" : "text-gray-400"}`}
                  />
                </Input>

                <Button type="submit" className="w-full" isLoading={loading}>
                  {translateApp("auth.register.submit")}
                </Button>
              </>
            )}
          </form>
          {step === 1 && (
            <div className="text-center">
              <p className="text-[var(--text-primary)]">
                {translateApp("auth.register.hasAccount")}{" "}
                <span className="underline">
                  <Link
                    to="/login"
                    className="hover:text-[var(--brand-primary)]"
                  >
                    {translateApp("auth.register.signIn")}
                  </Link>
                </span>
              </p>
            </div>
          )}
        </div>
      </CAuth.Content>
    </CAuth.Container>
  );
};
