"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useLTIContext } from "@/contexts/LTIContext";

function LaunchHandler() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { login, isAuthenticated, isInstructor } = useLTIContext();

    useEffect(() => {
        const token = searchParams.get("session_token");
        if (!token) {
            router.replace("/auth/error");
            return;
        }
        login(token);
    }, [searchParams, router, login]);

    useEffect(() => {
        if (!isAuthenticated) return;
        if (isInstructor) {
            router.replace("/teacher");
        } else {
            router.replace("/student");
        }
    }, [isAuthenticated, isInstructor, router]);

    return (
        <div className="auth-loading">
            Processando autenticação...
        </div>
    );
}

export default function LTILaunchPage() {
    return (
        <Suspense fallback={<div className="auth-loading">Carregando...</div>}>
            <LaunchHandler />
        </Suspense>
    );
}
