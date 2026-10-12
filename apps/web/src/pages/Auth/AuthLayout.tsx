import type { ReactNode } from "react";

export default function AuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen flex">

      <div className="hidden lg:flex w-1/2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white items-center justify-center">

        <div className="text-center">

          <h1 className="text-5xl font-bold">
            Smart Bus Tracking
          </h1>

          <p className="mt-4 text-xl">
            Safe • Smart • Connected
          </p>

        </div>

      </div>

      <div className="flex w-full lg:w-1/2 justify-center items-center p-10">
        {children}
      </div>

    </div>
  );
}