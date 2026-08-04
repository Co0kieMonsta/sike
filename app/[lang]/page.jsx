"use client";
import Image from "next/image";
import LogInForm from "@/app/[lang]/auth/(login)/login3/login-form.jsx";
import auth3Light from "@/public/images/auth/mountain.png"
import auth3Dark from "@/public/images/auth/auth3-dark.png"
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/provider/auth.provider";
import { Loader2 } from "lucide-react";

const LoginPage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Si ya hay usuario y está redirigiendo, devolvemos null para no parpadear el form
  if (user) return null;

  return (
    <div className="loginwrapper  flex justify-center items-center relative overflow-hidden">
      <Image
        src={auth3Dark}
        alt="background image"
        className="absolute top-0 left-0 w-full h-full light:hidden" />
      <Image
        src={auth3Light}
        alt="background image"
        className="absolute top-0 left-0 w-full h-full object-cover dark:hidden" />
      <div className="w-full bg-background   py-5 max-w-xl  rounded-xl relative z-10 2xl:p-16 xl:p-12 p-10 m-4 ">
        <LogInForm />
      </div>
    </div>
  );
};

export default LoginPage;
