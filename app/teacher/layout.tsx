export default function TeacherLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="teacher-layout">
            <aside className="teacher-layout__sidebar">
                <h2 className="sidebar__heading">Echo Admin</h2>
                <nav className="sidebar__nav">
                    <a href="/teacher" className="teacher-layout__sidebar-link">Dashboard</a>
                    <a href="/teacher/tests/new" className="teacher-layout__sidebar-link">Create Test</a>
                </nav>
            </aside>
            <main className="teacher-layout__main">
                {children}
            </main>
        </div>
    )
}
