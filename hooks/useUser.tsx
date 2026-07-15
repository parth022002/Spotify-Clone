import { useEffect, useState, createContext, useContext } from 'react';
import {
  useUser as useSupaUser,
  useSessionContext,
  User
} from '@supabase/auth-helpers-react';

import { UserDetails, Subscription } from '@/types';

type UserContextType = {
  accessToken: string | null;
  user: User | null;
  userDetails: UserDetails | null;
  isLoading: boolean;
  subscription: Subscription | null;
};

export const UserContext = createContext<UserContextType | undefined>(
  undefined
);

export interface Props {
  [propName: string]: any;
}

export const MyUserContextProvider = (props: Props) => {
  const {
    session,
    isLoading: isLoadingUser,
  } = useSessionContext();
  const user = useSupaUser();
  const accessToken = session?.access_token ?? null;
  const [isLoadingData, setIsloadingData] = useState(false);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);

  const getUserDetails = () =>
    fetch(`/api/user/details?id=${user?.id}`)
      .then((res) => (res.ok ? res.json() : null));

  const getSubscription = () =>
    fetch(`/api/user/subscription?id=${user?.id}`)
      .then((res) => (res.ok ? res.json() : null));

  useEffect(() => {
    if (user && !isLoadingData && !userDetails && !subscription) {
      setIsloadingData(true);

      // Sync user profile with Neon database
      fetch("/api/user/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: user.id,
          full_name: user.user_metadata?.full_name || user.email || "",
          avatar_url: user.user_metadata?.avatar_url || null,
        }),
      })
        .then(() => {
          Promise.allSettled([getUserDetails(), getSubscription()]).then(
            (results) => {
              const userDetailsPromise = results[0];
              const subscriptionPromise = results[1];

              if (userDetailsPromise.status === 'fulfilled')
                setUserDetails(userDetailsPromise.value as UserDetails);

              if (subscriptionPromise.status === 'fulfilled')
                setSubscription(subscriptionPromise.value as Subscription);

              setIsloadingData(false);
            }
          );
        })
        .catch((err) => {
          console.error("Error syncing user:", err);
          setIsloadingData(false);
        });
    } else if (!user && !isLoadingUser && !isLoadingData) {
      setUserDetails(null);
      setSubscription(null);
    }
  }, [user, isLoadingUser]);

  const value = {
    accessToken,
    user,
    userDetails,
    isLoading: isLoadingUser || isLoadingData,
    subscription
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
