import { useEffect, useState, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { X } from "lucide-react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

type Props = {
  children: ReactNode;
};

export default function AppLayout({ children }: Props) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  return (
    <div className="flex min-h-screen w-full max-w-full overflow-x-clip bg-slate-100">
      {/* Desktop sidebar */}
      <div className="hidden shrink-0 md:block">
        <Sidebar />
      </div>

      {/* Mobile backdrop */}
      {mobileMenuOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 max-w-[85vw] overflow-y-auto transition-transform duration-300 md:hidden ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={() => setMobileMenuOpen(false)}
          className="absolute right-2 top-3 z-10 rounded-lg bg-slate-800 p-2 text-white"
        >
          <X size={20} />
        </button>
        <Sidebar />
      </div>

      {/* Application area */}
      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar onMenuClick={() => setMobileMenuOpen(true)} />

        <main className="min-w-0 w-full flex-1 overflow-x-hidden p-3 sm:p-5 lg:p-7 xl:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}