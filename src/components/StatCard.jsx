import React from 'react'

export default function StatCard({ title, value, subtitle, icon: Icon, color = 'blue' }) {
  const themes = {
    blue:   { bg: 'bg-blue-50 dark:bg-blue-950',   icon: 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400',   border: 'border-blue-200 dark:border-blue-800' },
    green:  { bg: 'bg-emerald-50 dark:bg-emerald-950', icon: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-800' },
    orange: { bg: 'bg-amber-50 dark:bg-amber-950',  icon: 'bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400',  border: 'border-amber-200 dark:border-amber-800' },
    red:    { bg: 'bg-rose-50 dark:bg-rose-950',   icon: 'bg-rose-100 text-rose-600 dark:bg-rose-900/50 dark:text-rose-400',   border: 'border-rose-200 dark:border-rose-800' },
    purple: { bg: 'bg-violet-50 dark:bg-violet-950', icon: 'bg-violet-100 text-violet-600 dark:bg-violet-900/50 dark:text-violet-400', border: 'border-violet-200 dark:border-violet-800' },
  }
  const t = themes[color] || themes.blue

  return (
    <div className={`relative overflow-hidden bg-white dark:bg-gray-900 rounded-xl border ${t.border} p-5 hover:shadow-lg hover:scale-[1.02] transition-all duration-200 animate-fade-in`}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>}
        </div>
        {Icon && (
          <div className={`p-2.5 rounded-lg ${t.icon}`}>
            <Icon size={20} strokeWidth={2} />
          </div>
        )}
      </div>
      {/* decorative accent */}
      <div className={`absolute -bottom-3 -right-3 w-16 h-16 rounded-full ${t.bg} opacity-60`} />
    </div>
  )
}
