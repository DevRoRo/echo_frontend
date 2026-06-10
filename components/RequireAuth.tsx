"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useLTIContext } from "@/contexts/LTIContext";

export default function RequireAuth({ children }: { children: ReactNode }) {
    const { isAuthenticated, isLoading } = useLTIContext();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.replace("/auth/error");
        }
    }, [isLoading, isAuthenticated, router]);

    if (isLoading) {
        return (
            <div className="auth-loading">
                Carregando...
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    return <>{children}</>;
}
