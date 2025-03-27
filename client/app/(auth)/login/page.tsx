import { LoginForm } from "@/components/auth/login-form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login | eMart",
  description: "Login to your eMart account",
};

export default function LoginPage() {
  return <LoginForm />;
}
