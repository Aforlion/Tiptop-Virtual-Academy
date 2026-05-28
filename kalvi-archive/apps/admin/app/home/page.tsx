import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Tiptop Academy | Login",
  description:
    "Login to your account to access the dashboard or your learner content.",
};

export default function Home() {
  return (
    <>
    <span className="absolute top-4 z-50 left-[50%] -translate-x-[50%] border rounded-md p-1 font-semibold">
      Admin App
    </span>
      <div
        className="flex flex-col h-screen bg-white/20"
        style={{
          backgroundSize: "2.5rem 2.5rem",
          backgroundImage:
            "linear-gradient(90deg, #c0c0c099 0.063rem, #0000 0), linear-gradient(180deg, #c0c0c099 0.063rem, #0000 0)",
        }}
      >
        <div
          className="flex-1 overflow-y-auto flex flex-col justify-start"
          style={{ background: "radial-gradient(circle,#fff9 0,#fff 99%)" }}
        >
          <div className="w-full px-4 h-16 bg-white shadow shrink-0 z-30 sticky top-0 left-0 right-0">
            {/* header container */}
            <nav className="container mx-auto flex items-center justify-between h-full">
              {/* left side */}
              <div className="flex items-center gap-x-12">
                {/* LOGO */}
                <div className="h-full w-max shrink-0 flex items-center font-bold text-2xl text-[#006FEE]">
                  Tiptop Academy
                </div>
              </div>

              {/* right side */}
              <div className="flex items-center gap-x-2.5">
                {/* icons & cta buttons */}
                <div className="flex-1 lg:flex md:flex hidden items-center justify-end gap-x-2.5">
                  <Link
                    href="/home/login"
                    className="font-semibold relative inline-flex items-center justify-center gap-x-1.5 whitespace-nowrap capitalize box-border px-3.5 py-2 text-sm rounded-md hover:text-opacity-80"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/home/register"
                    className="font-semibold bg-[#006FEE] text-white relative inline-flex items-center justify-center gap-x-1.5 whitespace-nowrap capitalize box-border px-3.5 py-2 text-sm rounded-md hover:text-opacity-80"
                  >
                    Sign up
                  </Link>
                </div>
              </div>
            </nav>
          </div>

          <main className="relative isolate pt-16 h-full">
            <div className="py-24 lg:pb-40">
              <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-2xl text-center">
                  <div className="flex items-center justify-center">
                  </div>
                  <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
                    Welcome to <span className="text-primary">Tiptop Virtual Academy</span>
                  </h1>
                  <p className="mt-6 text-lg leading-8 text-foreground/80">
                    Empowering the next generation of learners with engaging, interactive, and personalized digital education for ages 3-12.
                  </p>
                  <div className="mt-10 flex items-center justify-center gap-x-6">
                  </div>
                </div>
              </div>
            </div>
          </main>
          
        </div>
      </div>
    </>
  );
}
