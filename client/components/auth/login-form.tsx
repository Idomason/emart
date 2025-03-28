"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/lib/store/store";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/ui/form-error";
import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useMutation } from "@tanstack/react-query";
import { setUser, setError, clearError } from "@/lib/store/features/authSlice";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export function LoginForm() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { error } = useSelector((state: RootState) => state.auth);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const { mutate, isPending: isLoading } = useMutation({
    mutationFn: async (data: LoginFormData) => {
      const response = await fetch(`${API_URL}/api/v1/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Login failed");
      }

      const responseData = await response.json();

      // Extract token from cookies for socket.io authentication
      const cookies = document.cookie.split(";");
      const socketTokenCookie = cookies.find((cookie) =>
        cookie.trim().startsWith("socket_token=")
      );

      if (socketTokenCookie) {
        const socketToken = socketTokenCookie
          .trim()
          .substring("socket_token=".length);
        // Store token in localStorage for socket authentication
        localStorage.setItem("socket_token", socketToken);
        console.log("Socket token saved to localStorage");
      } else {
        console.warn("No socket_token cookie found after login");
      }

      return responseData;
    },
    onSuccess: (data) => {
      dispatch(setUser(data.data));
      dispatch(clearError());
      router.push("/profile");
    },
    onError: (error: Error) => {
      dispatch(setError(error.message));
    },
  });

  const onSubmit = (data: LoginFormData) => {
    mutate(data);
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full max-w-md px-4"
      >
        <Card className="shadow-lg">
          <CardHeader className="space-y-4">
            <CardTitle className="text-2xl font-bold text-center">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-center text-muted-foreground">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  className="w-full"
                  {...form.register("email")}
                />
                {form.formState.errors.email && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  className="w-full"
                  {...form.register("password")}
                />
                {form.formState.errors.password && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.password.message}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 pt-4">
            {error && <FormError message={error} className="w-full" />}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Sign In"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
