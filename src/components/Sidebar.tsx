export default function Sidebar() {
  return (
    <aside className="w-64 h-screen bg-gradient-to-b from-blue-600 to-blue-400 text-white flex flex-col p-6">
      <h2 className="text-2xl font-bold mb-8">Panel</h2>
      <nav className="flex flex-col gap-4">
        <button className="text-left px-3 py-2 rounded-lg bg-white/20 hover:bg-white/30 transition">
          Requisiciones
        </button>
      </nav>
    </aside>
  );
}
