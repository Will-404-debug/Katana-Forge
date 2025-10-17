"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

type GoogleSignInButtonProps = {
  redirectTo?: string;
  className?: string;
  label?: string;
};

export default function GoogleSignInButton({
  redirectTo = "/profile",
  className = "",
  label = "Continuer avec Google",
}: GoogleSignInButtonProps) {
  const [pending, setPending] = useState(false);

  const handleClick = async () => {
    setPending(true);

    try {
      await signIn("google", { callbackUrl: redirectTo });
    } catch {
      setPending(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`flex w-full items-center justify-center gap-3 rounded-lg border border-white/15 bg-black/30 px-4 py-2 text-sm uppercase tracking-[0.3em] text-white/80 transition hover:border-emberGold hover:text-emberGold ${className}`}
      disabled={pending}
    >
      <GoogleIcon />
      <span>{pending ? "Connexion..." : label}</span>
    </button>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden focusable="false" className="h-4 w-4">
      <path
        d="M17.64 9.20455C17.64 8.56637 17.5827 7.95273 17.4764 7.36364H9V10.8455H13.8436C13.635 11.97 13.0009 12.9182 12.0527 13.5545V15.8455H14.9564C16.6582 14.2818 17.64 11.9545 17.64 9.20455Z"
        fill="#4285F4"
      />
      <path
        d="M9 18C11.43 18 13.4673 17.1941 14.9564 15.8455L12.0527 13.5545C11.2486 14.0945 10.2145 14.4091 9 14.4091C6.65273 14.4091 4.67182 12.8291 3.96409 10.71H0.957275V13.0764C2.43818 15.9973 5.48182 18 9 18Z"
        fill="#34A853"
      />
      <path
        d="M3.96409 10.71C3.78409 10.17 3.68182 9.59318 3.68182 9C3.68182 8.40682 3.78409 7.83 3.96409 7.29V4.92364H0.957275C0.347729 6.14318 0 7.53409 0 9C0 10.4659 0.347729 11.8568 0.957275 13.0764L3.96409 10.71Z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.59091C10.3268 3.59091 11.5077 4.04545 12.4418 4.93455L15.0218 2.35455C13.4627 0.901364 11.4254 0 9 0C5.48182 0 2.43818 2.0025 0.957275 4.92364L3.96409 7.29C4.67182 5.17091 6.65273 3.59091 9 3.59091Z"
        fill="#EA4335"
      />
    </svg>
  );
}
