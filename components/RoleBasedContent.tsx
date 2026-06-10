"use client";

import type { ReactNode } from "react";
import { useLTIContext } from "@/contexts/LTIContext";

export default function RoleBasedContent({
    role,
    children,
}: {
    role: "instructor" | "learner";
    children: ReactNode;
}) {
    const { isInstructor } = useLTIContext();

    if (role === "instructor" && !isInstructor) return null;
    if (role === "learner" && isInstructor) return null;

    return <>{children}</>;
}
