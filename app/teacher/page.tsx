"use client";

import { useLTIContext } from "@/contexts/LTIContext";

export default function TeacherPage() {
    const { user } = useLTIContext();

    return (
        <div className="teacher-page">
            <h1 className="teacher-page__heading">Painel do Professor</h1>

            {user && (
                <div className="teacher-page__info">
                    <div className="teacher-page__info-row">
                        <span className="teacher-page__info-label">Curso:</span>
                        <span className="teacher-page__info-value">{user.courseTitle}</span>
                    </div>
                    <div className="teacher-page__info-row">
                        <span className="teacher-page__info-label">Professor:</span>
                        <span className="teacher-page__info-value">{user.name}</span>
                    </div>
                </div>
            )}
        </div>
    );
}
