"use client";

import { useDispatch, useSelector } from "react-redux";
import { logout } from "@/lib/store/features/authSlice";
import { AppDispatch, RootState } from "@/lib/store/store";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const navItems = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "About",
    href: "/about",
  },
  {
    label: "Contact",
    href: "/contact",
  },
  {
    label: "Services",
    href: "/services",
  },
];

// Authenticated user navigation items
const authNavItems = [
  {
    label: "Orders",
    href: "/orders",
  },
  {
    label: "Profile",
    href: "/profile",
  },
];

export function Navbar() {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { toast } = useToast();

  const { mutate: logoutMutation } = useMutation({
    mutationFn: async () => {
      const response = await fetch(`${API_URL}/api/v1/auth/logout`, {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Logout failed");
      }

      return response.json();
    },
    onSuccess: () => {
      // Clear any stored tokens from localStorage
      localStorage.removeItem("socket_token");
      localStorage.removeItem("jwt");

      dispatch(logout());
      toast({
        title: "Success",
        description: "You have successfully logged out",
        duration: 3000,
      });
      router.push("/");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Logout failed",
        variant: "destructive",
        duration: 3000,
      });
    },
  });

  const handleLogout = () => {
    logoutMutation();
  };

  // Determine which nav items to show based on authentication state
  const displayNavItems = [...navItems, ...(user ? authNavItems : [])];

  return (
    <nav className="border-b bg-background sticky top-0 z-50">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <Link href="/" className="text-xl font-bold">
            eMart
          </Link>

          {/* Navigation Links */}
          <ul className="hidden md:flex items-center gap-6">
            {displayNavItems.map((navLink) => (
              <Link
                key={navLink.label}
                href={navLink.href}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {navLink.label}
              </Link>
            ))}
          </ul>

          {/* Auth Buttons */}
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <span className="text-sm text-muted-foreground hidden md:inline-block">
                  Welcome,{" "}
                  <span className="font-semibold text-slate-800 capitalize">
                    {user.email?.split("@")[0]}
                  </span>
                </span>
                <Button onClick={handleLogout} variant="outline">
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={() => router.push("/sign-up")}
                  variant="outline"
                  className="hidden sm:inline-flex"
                >
                  Sign Up
                </Button>
                <Button
                  onClick={() => router.push("/login")}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Login
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
