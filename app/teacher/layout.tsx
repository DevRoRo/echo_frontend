"use client";

import RequireAuth from "@/components/RequireAuth";
import { useLTIContext } from "@/contexts/LTIContext";

export default function TeacherLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <RequireAuth>
            <TeacherLayoutInner>{children}</TeacherLayoutInner>
        </RequireAuth>
    );
}

function TeacherLayoutInner({ children }: { children: React.ReactNode }) {
    const { user, isInstructor, logout } = useLTIContext();

    return (
        <div className="teacher-layout">
            <aside className="teacher-layout__sidebar">
                <h2 className="sidebar__heading">Echo Admin</h2>

                {user && (
                    <div className="sidebar__user-info">
                        <span className="sidebar__user-name">{user.name}</span>
                        <span className="sidebar__course-title">{user.courseTitle}</span>
                        <span className={`sidebar__role-badge${isInstructor ? " sidebar__role-badge--instructor" : ""}`}>
                            {isInstructor ? "Professor" : "Administrador"}
                        </span>
                    </div>
                )}

                <nav className="sidebar__nav">
                    <a href="/teacher" className="teacher-layout__sidebar-link">Dashboard</a>
                    <a href="/teacher/tests/createAudio" className="teacher-layout__sidebar-link">Criar Áudio</a>
                    <a href="/teacher/tests/audioRecords" className="teacher-layout__sidebar-link">Audio Records</a>
                </nav>

                <div className="sidebar__footer">
                    <button className="sidebar__btn-logout" onClick={logout}>
                        Sair
                    </button>
                </div>
            </aside>
            <main className="teacher-layout__main">
                {children}
            </main>
        </div>
    );
}
