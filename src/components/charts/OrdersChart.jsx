import { useEffect, useState } from "react"
import { supabase } from "../../services/supabaseClient"
import { useTheme } from "../../context/ThemeContext"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts"

export default function OrdersChart() {
  const [data, setData] = useState([])
  const { darkMode } = useTheme()

  useEffect(() => {
    fetchOrders()
  }, [])

  async function fetchOrders() {
    const { data, error } = await supabase
      .from("orders")
      .select("orderdate")
      .order("orderdate", { ascending: true })

    if (error) return

    const grouped = {}
    data.forEach(order => {
      const date = new Date(order.orderdate).toLocaleDateString("en-IN")
      grouped[date] = (grouped[date] || 0) + 1
    })

    const chartData = Object.keys(grouped).map(date => ({
      date,
      orders: grouped[date]
    }))

    setData(chartData)
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#f1f5f9'} />
        <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={{ borderRadius: '0.75rem', border: `1px solid ${darkMode ? '#374151' : '#e2e8f0'}`, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)', backgroundColor: darkMode ? '#1f2937' : '#fff', color: darkMode ? '#f9fafb' : '#111827' }} />
        <Line type="monotone" dataKey="orders" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2, fill: '#fff' }} />
      </LineChart>
    </ResponsiveContainer>
  )
}
