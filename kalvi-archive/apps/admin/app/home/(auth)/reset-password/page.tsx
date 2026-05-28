import { Metadata } from "next";
import { ResetPasswordForm } from "./_components/form";


export const metadata: Metadata = {
  title: "Tiptop Academy | Reset Password",
  description: "Reset Password",
};

export default function ResetPasswordPage() {
  return <ResetPasswordForm />;
}
