import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { LoginCredentials, RegisterCredentials, User } from "@/types/auth";

export { useAuth } from "@/context/AuthContext";

export function useLogin() {
  const { login } = useAuth();

  return useMutation<User, Error, LoginCredentials>({
    mutationFn: async (credentials: LoginCredentials) => {
      return await login(credentials);
    },
  });
}

export function useRegister() {
  const { register } = useAuth();

  return useMutation<User, Error, RegisterCredentials>({
    mutationFn: async (payload: RegisterCredentials) => {
      return await register(payload);
    },
  });
}

export function useForgotPassword() {
  const { forgotPassword } = useAuth();

  return useMutation<User, Error, string>({
    mutationFn: async (identifier: string) => {
      return await forgotPassword(identifier);
    },
  });
}
