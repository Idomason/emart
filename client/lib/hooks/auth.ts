import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authApi } from "../api-client/auth";
import { LoginCredentials, SignupCredentials, User } from "@/types";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { clearError, setUser } from "@/lib/store/features/authSlice";

export const useLogin = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await authApi.login(
        credentials.email,
        credentials.password
      );
      return response.data;
    },
    onSuccess: (data) => {
      dispatch(setUser(data));
      queryClient.setQueryData(["user"], data);
      router.push("/profile");
    },
    onError: (error: Error) => {
      dispatch(clearError());
    },
  });
};

export const useSignup = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: SignupCredentials) => {
      const response = await authApi.signup(credentials);
      return response.data;
    },
    onSuccess: (data) => {
      dispatch(setUser(data));
      queryClient.setQueryData(["user"], data);
      router.push("/profile");
    },
    onError: (error: Error) => {
      dispatch(clearError());
    },
  });
};

export const useLogout = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      dispatch(setUser(null));
      queryClient.setQueryData(["user"], null);
      queryClient.clear();
      router.push("/login");
    },
  });
};

export const useProfile = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const response = await authApi.getProfile();
      const data = response.data;
      dispatch(setUser(data));
      return data;
    },
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
