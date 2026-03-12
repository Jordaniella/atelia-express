import { Link } from "react-router-dom";
import { MailWarning, Mail, Lock, User } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { useLogin } from "@/features/auth/hooks/useLogin";
import CAuth from "./style";
import Logo from "@/components/Logo";

const LoginPage = () => {
  const {
    translateApp,
    email,
    setEmail,
    password,
    setPassword,
    error,
    loading,
    handleSubmit,
  } = useLogin({ redirectTo: "/dashboard" });

  return (
    <CAuth.Container>
      {/* <CAuth.Content className="atel-infos">
        <Logo />
        <div>
          <h1 className="text-primary">
            {translateApp("auth.login.title")}
          </h1>
          <p>{translateApp("auth.login.subtitle")}</p>
        </div>
      </CAuth.Content> */}
      <CAuth.Content>
        <div className="flex justify-center align-center">
          <Logo />
        </div>
        <div className="atel-login">
          <div className="text-center">
            <h1 className="text-[3rem]">Sign In</h1>
            <p className="mt-2">Continue to launch your journey</p>
          </div>

          <form onSubmit={handleSubmit}>
            {error && <div className="text-red-500 p-2 text-center border-[#e50000] border-[1.5px] rounded-md">{error}</div>}

            <Input
              label={translateApp("auth.login.email")}
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            > {error ? (
                <MailWarning className="text-red-500" />
              ) : (
                <Mail className="w-4 h-4 text-gray-400" />
              )}
            </Input>

            <Input
              label={translateApp("auth.login.password")}
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            >
              <Lock
                className={`w-4 h-4 ${error ? "text-red-500" : "text-gray-400"}`}
              />
            </Input>

            <Button type="submit" isLoading={loading}>
              {translateApp("auth.login.submit")}
            </Button>
          </form>

          <div className="text-center">
            <p className="text-[var(--text-primary)]">
              {translateApp("auth.login.noAccount")}{" "}
              <span className="underline">
                <Link
                  to="/register"
                  className="hover:text-[var(--brand-primary)]"
                >
                  {translateApp("auth.login.signUp")}
                </Link>
              </span>
            </p>
          </div>
        </div>
      </CAuth.Content>
    </CAuth.Container>
  );
};

export default LoginPage;
