import type { Metadata } from "next";
import React, { PropsWithChildren } from "react";
import { AuthBrandPanel } from "@/components/auth/AuthBrandPanel";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

const AuthLayout = ({ children }: PropsWithChildren) => {
  return (
    <div className="flex min-h-svh flex-col lg:flex-row">
      <AuthBrandPanel />

      {/* Right form panel */}
      <main className="flex min-h-0 flex-1 flex-col items-center justify-center px-4 py-8 sm:px-6 sm:py-10 lg:px-8 xl:px-12">
        {children}
      </main>
    </div>
  );
};

export default AuthLayout;
