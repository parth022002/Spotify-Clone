import { useEffect, useState, createContext, useContext, useCallback } from 'react';
import { UserDetails, Subscription } from '@/types';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
}

type UserContextType = {
  accessToken: string | null;
  user: User | null;
  userDetails: UserDetails | null;
  isLoading: boolean;
  subscription: Subscription | null;
  login: (email: string, password: string) => Promise<boolean>;
  registerUser: (email: string, password: string, fullName: string) => Promise<boolean>;
  logout: () => Promise<void>;
};

export const UserContext = createContext<UserContextType | undefined>(
  undefined
);

export interface Props {
  [propName: string]: any;
}

export const MyUserContextProvider = (props: Props) => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSession = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/session");
      if (response.ok) {
        const userData = await response.json();
        if (userData) {
          setUser(userData);
          // Fetch additional details from Neon
          const [detailsRes, subRes] = await Promise.all([
            fetch(`/api/user/details?id=${userData.id}`),
            fetch(`/api/user/subscription?id=${userData.id}`)
          ]);

          if (detailsRes.ok) {
            const details = await detailsRes.json();
            setUserDetails(details);
          }
          if (subRes.ok) {
            const sub = await subRes.json();
            setSubscription(sub);
          }
        } else {
          setUser(null);
          setUserDetails(null);
          setSubscription(null);
        }
      }
    } catch (error) {
      console.error("Error fetching session:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        toast.success("Successfully logged in!");
        await fetchSession();
        router.refresh();
        return true;
      } else {
        const errText = await response.text();
        toast.error(errText || "Invalid credentials");
        return false;
      }
    } catch (error) {
      toast.error("Something went wrong");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const registerUser = async (email: string, password: string, fullName: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, fullName }),
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        toast.success("Account created successfully!");
        await fetchSession();
        router.refresh();
        return true;
      } else {
        const errText = await response.text();
        toast.error(errText || "Registration failed");
        return false;
      }
    } catch (error) {
      toast.error("Something went wrong");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (response.ok) {
        setUser(null);
        setUserDetails(null);
        setSubscription(null);
        toast.success("Logged out successfully");
        router.refresh();
        router.push("/");
      } else {
        toast.error("Failed to log out");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    accessToken: user ? user.id : null,
    user,
    userDetails,
    isLoading,
    subscription,
    login,
    registerUser,
    logout,
  };

  return <UserContext.Provider value={value} {...props} />;
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error(`useUser must be used within a MyUserContextProvider.`);
  }
  return context;
};
