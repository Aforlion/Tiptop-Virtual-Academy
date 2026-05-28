import { LoginForm } from "./_components/form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tiptop Academy | Sign In",
  description: "Sign in to Tiptop Academy",
};

export default function LoginPage() {
  return <LoginForm />;
}
