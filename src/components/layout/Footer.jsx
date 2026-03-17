export default function Footer() {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
      <div className="max-w-[1440px] mx-auto px-6 py-3 flex items-center justify-between text-[11px] text-gray-400">
        <span>Kudumbashree Micro-Unit Inventory Management System &copy; {new Date().getFullYear()}</span>
        <span>Built with React + Supabase</span>
      </div>
    </footer>
  )
}
