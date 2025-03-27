"use client";

import { Provider } from "react-redux";
import { store } from "@/lib/store";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./AuthProvider";

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <AuthProvider>{children}</AuthProvider>
      </Provider>
    </QueryClientProvider>
  );
}
