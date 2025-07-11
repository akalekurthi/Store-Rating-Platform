import { useQuery } from "@tanstack/react-query";

interface UserResponse {
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
    address?: string;
    createdAt: string;
    updatedAt: string;
  };
}

export function useAuth() {
  const { data: user, isLoading } = useQuery<UserResponse>({
    queryKey: ["/api/auth/me"],
    retry: false,
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}
