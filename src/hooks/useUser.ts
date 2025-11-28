import useSWR from "swr";

export type SessionUser = {
    id: number;
    username: string;
    role: "admin" | "user";
    email?: string | null;
    displayName?: string;
    bio?: string;
    avatarUrl?: string | null;
};

type AuthResponse = {
    user?: SessionUser;
    error?: string;
};

type ProfileResponse = {
    profile?: {
        displayName?: string;
        bio?: string;
        avatarUrl?: string | null;
    };
    error?: string;
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useUser() {
    const { data: authData, error: authError, isLoading: authLoading, mutate: mutateAuth } = useSWR<AuthResponse>(
        "/api/auth",
        fetcher
    );

    const { data: profileData, error: profileError, isLoading: profileLoading, mutate: mutateProfile } = useSWR<ProfileResponse>(
        authData?.user ? `/api/profile?username=${authData.user.username}` : null,
        fetcher
    );

    const user = authData?.user;
    const profile = profileData?.profile;

    // Merge session user with profile data if available
    const combinedUser: SessionUser | null = user
        ? {
            ...user,
            displayName: profile?.displayName || user.displayName,
            bio: profile?.bio || user.bio,
            avatarUrl: profile?.avatarUrl || user.avatarUrl,
        }
        : null;

    return {
        user: combinedUser,
        isLoading: authLoading || (!!user && profileLoading),
        isError: authError || profileError,
        mutate: async () => {
            await Promise.all([mutateAuth(), mutateProfile()]);
        },
    };
}
