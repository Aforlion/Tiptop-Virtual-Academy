import { Metadata } from "next";
import { ForgotPasswordForm } from "./_components/form";

export const metadata: Metadata = {
  title: "Tiptop Academy | Forgot Password",
  description: "Forgot password",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
