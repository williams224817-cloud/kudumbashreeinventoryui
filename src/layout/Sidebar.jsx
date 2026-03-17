import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Package, Boxes, ShoppingCart, Truck, DollarSign, Zap, Activity, X } from 'lucide-react'

const navSections = [
  {
    items: [
      { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    title: 'Management',
    items: [
      { path: '/micro-units', label: 'Micro Units', icon: Zap },
      { path: '/products', label: 'Products', icon: Package },
      { path: '/inventory', label: 'Inventory', icon: Boxes },
    ],
  },
  {
    title: 'Operations',
    items: [
      { path: '/orders', label: 'Orders', icon: ShoppingCart },
      { path: '/transport', label: 'Transport', icon: Truck },
      { path: '/payments', label: 'Payments', icon: DollarSign },
    ],
  },
  {
    title: 'System',
    items: [
      { path: '/activity-log', label: 'Activity Log', icon: Activity },
    ],
  },
]

export default function Sidebar({ onClose }) {
  const { pathname } = useLocation()

  return (
    <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 min-h-screen flex flex-col">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-sm">
            <Boxes size={18} className="text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900 dark:text-white leading-tight">Kudumbashree</h2>
            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Inventory System</p>
          </div>
        </Link>
        {onClose && (
          <button onClick={onClose} className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <X size={18} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
        {navSections.map((section, sIdx) => (
          <div key={sIdx}>
            {section.title && (
              <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                {section.title}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = pathname === item.path || (item.path !== '/dashboard' && pathname.startsWith(item.path))
                const Icon = item.icon
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-150 ${
                      isActive
                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <Icon size={18} strokeWidth={isActive ? 2.2 : 1.8} />
                    <span>{item.label}</span>
                    {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600" />}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-800">
        <p className="text-[10px] text-gray-400">&copy; {new Date().getFullYear()} Kudumbashree</p>
        <p className="text-[10px] text-gray-400 mt-0.5">Micro Unit Inventory System</p>
      </div>
    </aside>
  )
}