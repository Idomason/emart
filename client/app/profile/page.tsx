"use client";

import { useSelector } from "react-redux";
import { RootState } from "@/app/lib/store/store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Image from "next/image";

export default function ProfilePage() {
  const { user, isLoading } = useSelector((state: RootState) => state.auth);
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) router.push("/login");
  }, [user, isLoading, router]);

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="relative bg-gradient-to-b from-background to-muted">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="text-left space-y-6">
            <h1 className="text-5xl font-bold tracking-tight">
              Welcome Back{" "}
              <span className="text-primary">Quality Products</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Discover a world of amazing deals, seamless shopping, and
              personalized service. Join thousands of satisfied customers who
              trust us for their shopping needs.
            </p>
            <div className="flex gap-4">
              <button className="bg-primary text-primary-foreground px-6 py-3 rounded-md hover:bg-primary/90 transition-colors">
                Order Now
              </button>
              <button className="border border-input bg-background px-6 py-3 rounded-md hover:bg-accent transition-colors">
                Learn More
              </button>
            </div>
          </div>
          <div className="relative h-[400px] w-full">
            <Image
              src="/images/order-image.jpg"
              alt="Shopping experience"
              fill
              className="object-cover rounded-lg shadow-xl"
              priority
            />
          </div>
        </div>
      </div>
    </div>
  );
}
