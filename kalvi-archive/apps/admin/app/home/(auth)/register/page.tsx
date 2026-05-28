import { Metadata } from "next";
import { RegisterationForm } from "./_components/form";


export const metadata: Metadata = {
  title: "Tiptop Academy | Register",
  description: "Register to Tiptop Academy",
};

export default function RegisterPage() {
  return <RegisterationForm />;
}
