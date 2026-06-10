"use client";

import RequireAuth from "@/components/RequireAuth";
import { useLTIContext } from "@/contexts/LTIContext";

export default function StudentLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <RequireAuth>
            <StudentLayoutInner>{children}</StudentLayoutInner>
        </RequireAuth>
    );
}

function StudentLayoutInner({ children }: { children: React.ReactNode }) {
    const { user, logout } = useLTIContext();

    return (
        <div className="student-layout">
            <header className="student-layout__header">
                <div className="student-layout__header-left">
                    <span className="student-layout__course-title">{user?.courseTitle || "Echo"}</span>
                    <span className="student-layout__user-name">{user?.name || "Estudante"}</span>
                </div>
                <button className="student-layout__btn-logout" onClick={logout}>
                    Sair
                </button>
            </header>
            <main className="student-layout__main">
                {children}
            </main>
        </div>
    );
}
