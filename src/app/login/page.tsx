"use client";

import { useAuth } from "@/context/AuthContext";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

// SVG icon for Google
const GoogleIcon = () => (
  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

export default function LoginPage() {
  const { loginWithGoogle, user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  return (
    <div className="flex min-h-screen bg-beige">
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96 fade-in">
          <div>
            <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-purple transition-colors mb-8">
              <ArrowLeft size={16} /> Back to Home
            </Link>
            
            <div className="flex items-center gap-3 mb-8">
              <div className="rounded-[1rem] overflow-hidden shadow-sm border border-purple/10">
                <Image src="/logo.png" alt="HandT Thrift Logo" width={48} height={48} className="object-cover" />
              </div>
              <span className="font-black text-3xl tracking-tighter text-gray-800">
                HandT Thrift
              </span>
            </div>

            <h2 className="mt-8 text-3xl font-black tracking-tight text-foreground">
              Sign In To Continue
            </h2>
            <p className="mt-2 text-sm text-gray-600 font-medium">
              Join Hamirpur&apos;s most trusted online thrift community to buy and sell premium clothes.
            </p>
          </div>

          <div className="mt-10">
            <button
              onClick={loginWithGoogle}
              className="w-full flex items-center justify-center bg-white text-gray-700 font-bold py-4 px-4 rounded-3xl shadow-md border border-gray-200 hover:bg-gray-50 hover:shadow-lg transition-all duration-300"
            >
              <GoogleIcon />
              Continue with Google
            </button>
            
            <p className="text-center text-xs text-gray-400 mt-6 max-w-xs mx-auto">
              By continuing, you agree to HandT Thrift's Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </div>
      
      {/* Decorative Side Panel */}
      <div className="relative hidden w-0 flex-1 lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-lavender/80 via-purple/40 to-blue/40 flex flex-col items-center justify-center">
           <h2 className="text-white text-5xl font-black tracking-tighter drop-shadow-lg text-center leading-[1.2]">
             Sustainable Fashion.<br/>Seamless Experience.
           </h2>
           <p className="mt-4 text-white/90 text-xl font-medium max-w-md text-center">Join Hamirpur's premium thrifting community today.</p>
        </div>
        <Image
          className="absolute inset-0 h-full w-full object-cover mix-blend-overlay opacity-60 pointer-events-none"
          src="https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&q=80"
          alt="Fashion clothes"
          fill
        />
      </div>
    </div>
  );
}
