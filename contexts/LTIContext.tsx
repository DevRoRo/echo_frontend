"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export interface LTIUser {
    sub: string;
    name: string;
    email: string;
    roles: string[];
    courseId: string;
    courseTitle: string;
    resourceLinkId: string;
}

interface LTIContextValue {
    user: LTIUser | null;
    sessionToken: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    isInstructor: boolean;
    login: (token: string) => void;
    logout: () => void;
}

const LTIContext = createContext<LTIContextValue | null>(null);

function decodeJwtPayload(token: string): Record<string, unknown> | null {
    try {
        const parts = token.split(".");
        if (parts.length !== 3) return null;
        const payload = parts[1];
        const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
        return JSON.parse(decoded);
    } catch {
        return null;
    }
}

function payloadToUser(payload: Record<string, unknown>): LTIUser {
    return {
        sub: String(payload.sub || ""),
        name: String(payload.name || ""),
        email: String(payload.email || ""),
        roles: Array.isArray(payload.roles) ? payload.roles.map(String) : [],
        courseId: String(payload.course_id || ""),
        courseTitle: String(payload.course_title || ""),
        resourceLinkId: String(payload.resource_link_id || ""),
    };
}

function getInitialState(): { user: LTIUser | null; sessionToken: string | null } {
    if (typeof window === "undefined") return { user: null, sessionToken: null };
    const stored = sessionStorage.getItem("lti_session_token");
    if (!stored) return { user: null, sessionToken: null };
    const payload = decodeJwtPayload(stored);
    if (!payload) return { user: null, sessionToken: null };
    const exp = Number(payload.exp) * 1000;
    if (Date.now() >= exp) {
        sessionStorage.removeItem("lti_session_token");
        return { user: null, sessionToken: null };
    }
    return { user: payloadToUser(payload), sessionToken: stored };
}

export function LTIContextProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState(() => getInitialState());

    const login = useCallback((token: string) => {
        const payload = decodeJwtPayload(token);
        if (!payload) return;
        sessionStorage.setItem("lti_session_token", token);
        setState({ user: payloadToUser(payload), sessionToken: token });
    }, []);

    const logout = useCallback(() => {
        sessionStorage.removeItem("lti_session_token");
        setState({ user: null, sessionToken: null });
        window.location.href = "/auth/error";
    }, []);

    const isAuthenticated = state.user !== null;
    const isInstructor = state.user !== null && state.user.roles.some(
        (r) => r.toLowerCase().includes("instructor") || r.toLowerCase().includes("administrator"),
    );

    return (
        <LTIContext.Provider
            value={{
                user: state.user,
                sessionToken: state.sessionToken,
                isLoading: false,
                isAuthenticated,
                isInstructor,
                login,
                logout,
            }}
        >
            {children}
        </LTIContext.Provider>
    );
}

export function useLTIContext(): LTIContextValue {
    const ctx = useContext(LTIContext);
    if (!ctx) {
        throw new Error("useLTIContext must be used within <LTIContextProvider>");
    }
    return ctx;
}
