"use client";

import Link from "next/link";
import Image from "next/image";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";

export default function Hero() {
  const { user } = useSelector((state: RootState) => state.auth);

  return (
    <div className="relative bg-gradient-to-b from-background to-muted">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="text-left space-y-6">
            <h1 className="text-5xl font-bold tracking-tight">
              Your One-Stop Shop for{" "}
              <span className="text-primary">Quality Products</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Discover a world of amazing deals, seamless shopping, and
              personalized service. Join thousands of satisfied customers who
              trust us for their shopping needs.
            </p>
            <div className="flex gap-4">
              <Link
                href={user ? "/orders" : "/sign-up"}
                className="bg-primary cursor-pointer text-primary-foreground px-6 py-3 rounded-md hover:bg-primary/90 transition-colors"
              >
                {user ? "Order Now" : "Try Now"}
              </Link>
              <Link
                href="/products"
                className="border cursor-pointer border-input bg-background px-6 py-3 rounded-md hover:bg-accent transition-colors"
              >
                Learn More
              </Link>
            </div>
          </div>
          <div className="relative h-[400px] w-full">
            <Image
              src="/images/hero-image.jpg"
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
