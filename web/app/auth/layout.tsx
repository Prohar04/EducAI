import type { Metadata } from "next";
import React, { PropsWithChildren } from "react";
import { AuthBrandPanel } from "@/components/auth/AuthBrandPanel";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

const AuthLayout = ({ children }: PropsWithChildren) => {
  return (
    <div className="flex min-h-screen">
      <AuthBrandPanel />

      {/* Right form panel */}
      <main className="flex flex-1 items-center justify-center px-4 py-12 sm:px-8">
        {children}
      </main>
    </div>
  );
};

export default AuthLayout;
