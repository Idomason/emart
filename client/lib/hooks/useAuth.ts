import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";

export const useAuth = () => {
  const { user, isLoading, error } = useSelector(
    (state: RootState) => state.auth
  );

  return {
    user,
    isLoading,
    error,
    isAuthenticated: !!user,
  };
};
