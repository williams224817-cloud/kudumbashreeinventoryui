import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Package, ShoppingCart, TrendingUp, DollarSign, Boxes, Truck, ArrowUpRight, AlertTriangle } from 'lucide-react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import StatCard from '../components/StatCard'
import OrdersChart from '../components/charts/OrdersChart'
import InventoryChart from '../components/charts/InventoryChart'
import { supabase } from '../services/supabaseClient'
import { useDashboardStats } from '../hooks/useDashboardStats'
import { getPaymentSummary } from '../hooks/useData'

export default function Dashboard() {
  const navigate = useNavigate()
  const { stats, loading: statsLoading, refresh: refreshStats } = useDashboardStats()
  const [recentOrders, setRecentOrders] = useState([])
  const [paymentChart, setPaymentChart] = useState([])
  const [lowStockCount, setLowStockCount] = useState(0)
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [loading, setLoading] = useState(true)

  const refreshAll = async () => {
    await Promise.all([loadDashboardData(), refreshStats()])
  }

  useEffect(() => {
    loadDashboardData()

    const channel = supabase.channel('dashboard-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => refreshAll())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payment' }, () => refreshAll())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'inventory' }, () => refreshAll())
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const { data: orders } = await supabase
        .from('orders')
        .select('*')
        .order('orderdate', { ascending: false })
        .limit(5)
      setRecentOrders(orders || [])
      const paymentData = await getPaymentSummary()
      setPaymentChart(paymentData)

      const { count: lowCount } = await supabase
        .from('inventory')
        .select('*', { count: 'exact', head: true })
        .lte('availablequantity', 10)
      setLowStockCount(lowCount || 0)

      const { data: revData } = await supabase
        .from('payment')
        .select('amount')
        .eq('paymentstatus', 'completed')
      setTotalRevenue((revData || []).reduce((s, p) => s + (p.amount || 0), 0))
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Welcome to Kudumbashree Inventory Management System</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 stagger">
        <StatCard title="Total Products" value={stats.products} subtitle="Active products" icon={Package} color="blue" />
        <StatCard title="Inventory Items" value={stats.inventory} subtitle="Total stock units" icon={Boxes} color="green" />
        <StatCard title="Total Orders" value={stats.orders} subtitle="All orders" icon={ShoppingCart} color="orange" />
        <StatCard title="Payments" value={stats.payments} subtitle="Transaction records" icon={DollarSign} color="purple" />
        <StatCard title="Transport" value={stats.transport} subtitle="Active shipments" icon={Truck} color="red" />
      </div>

      {/* Quick Insights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/30">
            <DollarSign size={22} className="text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Total Revenue</p>
            <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">₹{totalRevenue.toLocaleString('en-IN')}</p>
            <p className="text-[11px] text-gray-400">From completed payments</p>
          </div>
        </div>
        {lowStockCount > 0 && (
          <div className="bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-100 dark:border-rose-900 shadow-sm p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-rose-100 dark:bg-rose-900/50">
              <AlertTriangle size={22} className="text-rose-600 dark:text-rose-400" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400">Low Stock Alert</p>
              <p className="text-xl font-bold text-rose-700 dark:text-rose-400 mt-0.5">{lowStockCount} items</p>
              <button onClick={() => navigate('/inventory')} className="text-[11px] text-rose-600 dark:text-rose-400 hover:underline font-medium">View inventory →</button>
            </div>
          </div>
        )}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Orders Per Day</h2>
          <OrdersChart />
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Top Inventory Levels</h2>
          <InventoryChart />
        </div>
      </div>

      {/* Payment Summary Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Payment Summary</h2>
          {paymentChart.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={paymentChart}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {paymentChart.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `₹${value.toLocaleString('en-IN')}`} />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-sm text-gray-400 dark:text-gray-500">No data available</div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Payment Status Breakdown</h2>
          <div className="space-y-2.5">
            {paymentChart.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50/80 dark:bg-gray-800/80 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.fill }} />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.name}</span>
                </div>
                <span className="text-sm font-bold text-gray-900 dark:text-white">₹{item.value.toLocaleString('en-IN')}</span>
              </div>
            ))}
            {paymentChart.length === 0 && (
              <div className="text-center py-8 text-sm text-gray-400 dark:text-gray-500">No payment data</div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <TrendingUp size={16} className="text-gray-400" />
            Recent Orders
          </h2>
          <button onClick={() => navigate('/orders')} className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
            View all <ArrowUpRight size={12} />
          </button>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 space-y-3">
              {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-10 w-full" />)}
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-400 dark:text-gray-500">No recent orders</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-50 dark:border-gray-800">
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">Order ID</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">Status</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">Date</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">Total</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order, idx) => (
                  <tr
                    key={idx}
                    onClick={() => navigate(`/orders/${order.orderid}`)}
                    className="border-b border-gray-50 dark:border-gray-800 last:border-0 hover:bg-blue-50/40 dark:hover:bg-blue-900/20 cursor-pointer transition-colors"
                  >
                    <td className="px-5 py-3.5 text-sm text-blue-600 font-medium">#{order.orderid}</td>
                    <td className="px-5 py-3.5 text-sm">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                        (order.orderstatus || '').toLowerCase() === 'completed' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' :
                        (order.orderstatus || '').toLowerCase() === 'pending' ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' :
                        (order.orderstatus || '').toLowerCase() === 'processing' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
                        'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                      }`}>
                        {order.orderstatus || 'Pending'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-500 dark:text-gray-400">
                      {order.orderdate ? new Date(order.orderdate).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-5 py-3.5 text-sm font-semibold text-gray-900 dark:text-white">₹{order.totalamount || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}