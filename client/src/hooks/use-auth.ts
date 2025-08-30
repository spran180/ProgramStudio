import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import type { User, LoginData, SignupData } from "@shared/schema";

interface AuthResponse {
  user: User;
  token: string;
}

export function useAuth() {
  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ["/api/auth/me"],
    retry: false,
    staleTime: Infinity,
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginData): Promise<AuthResponse> => {
      const response = await apiRequest("POST", "/api/auth/login", data);
      const result = await response.json();
      localStorage.setItem("token", result.token);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    },
  });

  const signupMutation = useMutation({
    mutationFn: async (data: SignupData): Promise<AuthResponse> => {
      const response = await apiRequest("POST", "/api/auth/signup", data);
      const result = await response.json();
      localStorage.setItem("token", result.token);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    },
  });

  const logout = () => {
    localStorage.removeItem("token");
    queryClient.setQueryData(["/api/auth/me"], null);
    queryClient.invalidateQueries();
  };

  return {
    user,
    isLoading,
    login: loginMutation.mutate,
    signup: signupMutation.mutate,
    logout,
    isLoginPending: loginMutation.isPending,
    isSignupPending: signupMutation.isPending,
  };
}
