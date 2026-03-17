import React, { useState, useEffect } from 'react'
import { Activity, Package, ShoppingCart, Boxes, Truck, DollarSign, Zap, RefreshCw } from 'lucide-react'
import { supabase } from '../services/supabaseClient'

const typeConfig = {
  product: { icon: Package, color: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
  order: { icon: ShoppingCart, color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' },
  inventory: { icon: Boxes, color: 'bg-violet-50 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400' },
  transport: { icon: Truck, color: 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' },
  payment: { icon: DollarSign, color: 'bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400' },
  microunit: { icon: Zap, color: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' },
}

export default function ActivityLog() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')

  useEffect(() => {
    fetchLogs()
  }, [])

  const fetchLogs = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('activitylog')
        .select('*')
        .order('createdat', { ascending: false })
        .limit(100)

      if (error) throw error
      setLogs(data || [])
    } catch (err) {
      console.error('Error fetching activity logs:', err)
      setLogs([])
    } finally {
      setLoading(false)
    }
  }

  const filteredLogs = logs.filter(log => !filter || log.entitytype === filter)

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Activity Log</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Track all system actions and changes</p>
        </div>
        <button
          onClick={fetchLogs}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-sm font-medium transition-all"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        {['', 'product', 'order', 'inventory', 'transport', 'payment', 'microunit'].map(type => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filter === type
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {type ? type.charAt(0).toUpperCase() + type.slice(1) : 'All'}
          </button>
        ))}
      </div>

      {/* Timeline */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
        {loading ? (
          <div className="p-8 space-y-4">
            {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-12 w-full" />)}
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Activity size={48} strokeWidth={1.5} />
            <p className="mt-3 text-sm font-medium">No activity logs found</p>
            <p className="text-xs mt-1">Actions will appear here as they happen</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50 dark:divide-gray-800">
            {filteredLogs.map((log) => {
              const config = typeConfig[log.entitytype] || typeConfig.product
              const Icon = config.icon
              return (
                <div key={log.logid} className="flex items-start gap-4 px-5 py-4 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                  <div className={`p-2 rounded-lg shrink-0 ${config.color}`}>
                    <Icon size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{log.action}</p>
                    {log.details && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{log.details}</p>}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-gray-400">
                      {log.createdat ? new Date(log.createdat).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : ''}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      {log.createdat ? new Date(log.createdat).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : ''}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
