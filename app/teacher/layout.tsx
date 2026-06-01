export default function TeacherLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar Navigation for Teachers */}
            <aside className="w-64 bg-slate-900 text-white p-6">
                <h2 className="text-2xl font-bold mb-8">Echo Admin</h2>
                <nav className="flex flex-col space-y-4">
                    <a href="/teacher" className="hover:text-blue-400">Dashboard</a>
                    <a href="/teacher/tests/new" className="hover:text-blue-400">Create Test</a>
                </nav>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 p-8 overflow-y-auto">
                {children}
            </main>
        </div>
    )
}