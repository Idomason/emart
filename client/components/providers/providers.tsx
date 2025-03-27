"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReduxProvider } from "./reduxProvider";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <ReduxProvider>{children}</ReduxProvider>
    </QueryClientProvider>
  );
}
