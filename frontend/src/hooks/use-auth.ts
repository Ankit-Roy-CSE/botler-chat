/* eslint-disable @typescript-eslint/no-explicit-any */
import { API } from "@/lib/axios-client";
import type { LoginType, RegisterType, UserType } from "@/types/auth.type";
import { toast } from "sonner";
import { create } from "zustand";
// import { persist } from "zustand/middleware";
import { useSocket } from "./use-socket";

/**
 * State interface for authentication management and user session tracking.
 */
interface AuthState {
    /** Currently authenticated user data, or `null` if unauthenticated. */
    user: UserType | null;
    /** Flags whether a login API request is currently pending. */
    isLoggingIn: boolean;
    /** Flags whether a registration API request is currently pending. */
    isSigningUp: boolean;
    /** Flags whether the initial authentication check (`isAuthStatus`) is loading. */
    isAuthStatusLoading: boolean;

    /** Registers a new user account. */
    register: (data: RegisterType) => Promise<void>;
    /** Authenticates an existing user. */
    login: (data: LoginType) => Promise<void>;
    /** Logs out the authenticated user and terminates active socket connections. */
    logout: () => Promise<void>;
    /** Verifies the current session state with the backend server on app load. */
    isAuthStatus: () => Promise<void>;
}

/**
 * Zustand hook managing global authentication state, user session lifecycle,
 * and automatic synchronization with the WebSocket connection state.
 */
export const useAuth = create<AuthState>()((set) => ({
    // Initial State
    user: null,
    isSigningUp: false,
    isLoggingIn: false,
    isAuthStatusLoading: false,

    /**
     * Registers a new user account via API, updates session state, and connects WebSockets.
     *
     * @param data Payload containing user registration fields.
     */
    register: async (data: RegisterType) => {
        set({ isSigningUp: true });
        try {
            const response = await API.post("/auth/register", data);
            set({ user: response.data.user });

            // Auto-connect socket session upon successful registration
            useSocket.getState().connectSocket();
            toast.success("Registered successfully");
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Registration failed");
        } finally {
            set({ isSigningUp: false });
        }
    },

    /**
     * Authenticates user credentials, updates session state, and connects WebSockets.
     *
     * @param data Payload containing user login credentials.
     */
    login: async (data: LoginType) => {
        set({ isLoggingIn: true });
        try {
            const response = await API.post("/auth/login", data);
            set({ user: response.data.user });

            // Auto-connect socket session upon successful login
            useSocket.getState().connectSocket();
            toast.success("Logged in successfully");
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Login failed");
        } finally {
            set({ isLoggingIn: false });
        }
    },

    /**
     * Terminates active session on backend, clears user state, and disconnects WebSockets.
     */
    logout: async () => {
        try {
            await API.post("/auth/logout");
            set({ user: null });

            // Terminate WebSocket connection on logout
            useSocket.getState().disconnectSocket();
            toast.success("Logged out successfully");
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Logout failed");
        }
    },

    /**
     * Validates existing session on initial application load or refresh.
     * Restores user state and re-establishes WebSockets if valid.
     */
    isAuthStatus: async () => {
        set({ isAuthStatusLoading: true });
        try {
            const response = await API.get("/auth/status");
            set({ user: response.data.user });

            // Re-establish socket connection if user session is active
            useSocket.getState().connectSocket();
        } catch (err: any) {
            // Quietly fail or notify if session validation fails
            toast.error(err.response?.data?.message || "Authentication failed");
            console.error("Auth status error:", err);
            set({ user: null });
        } finally {
            set({ isAuthStatusLoading: false });
        }
    },
}));

//With Persist
// export const useAuth = create<AuthState>()(
//   persist(
//     (set) => ({
//       user: null,
//       isSigningUp: false,
//       isLoggingIn: false,
//       isAuthStatusLoading: false,

//       register: async (data: RegisterType) => {
//         set({ isSigningUp: true });
//         try {
//           const response = await API.post("/auth/register", data);
//           set({ user: response.data.user });
//           useSocket.getState().connectSocket();
//           toast.success("Register successfully");
//         } catch (err: any) {
//           toast.error(err.response?.data?.message || "Register failed");
//         } finally {
//           set({ isSigningUp: false });
//         }
//       },
//       login: async (data: LoginType) => {
//         set({ isLoggingIn: true });
//         try {
//           const response = await API.post("/auth/login", data);
//           set({ user: response.data.user });
//           useSocket.getState().connectSocket();
//           toast.success("Login successfully");
//         } catch (err: any) {
//           toast.error(err.response?.data?.message || "Register failed");
//         } finally {
//           set({ isLoggingIn: false });
//         }
//       },
//       logout: async () => {
//         try {
//           await API.post("/auth/logout");
//           set({ user: null });
//           useSocket.getState().disconnectSocket();
//           toast.success("Logout successfully");
//         } catch (err: any) {
//           toast.error(err.response?.data?.message || "Register failed");
//         }
//       },
//       isAuthStatus: async () => {
//         set({ isAuthStatusLoading: true });
//         try {
//           const response = await API.get("/auth/status");
//           set({ user: response.data.user });
//           useSocket.getState().connectSocket();
//         } catch (err: any) {
//           toast.error(err.response?.data?.message || "Authentication failed");
//           console.log(err);
//           //set({ user: null})
//         } finally {
//           set({ isAuthStatusLoading: false });
//         }
//       },
//     }),
//     {
//       name: "whop:root",
//     }
//   )
// );