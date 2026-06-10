"use client";

import { useLTIContext } from "@/contexts/LTIContext";

export default function StudentPage() {
    const { user } = useLTIContext();

    return (
        <div className="student-page">
            <h1 className="student-page__heading">
                Bem-vindo, {user?.name || "Estudante"}
            </h1>
            <p className="student-page__course">
                Curso: {user?.courseTitle || "—"}
            </p>
            <div className="student-page__content">
                <p className="student-page__placeholder">
                    Aqui serão listados os áudios disponíveis para você.
                </p>
            </div>
        </div>
    );
}
