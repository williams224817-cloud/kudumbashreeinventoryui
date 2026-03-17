import { useEffect, useState } from "react"
import { supabase } from "../../services/supabaseClient"
import { useTheme } from "../../context/ThemeContext"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts"

export default function RevenueChart() {
  const [data, setData] = useState([])
  const { darkMode } = useTheme()

  useEffect(() => {
    fetchRevenue()
  }, [])

  async function fetchRevenue() {
    const { data, error } = await supabase
      .from("payment")
      .select("paymentdate, amount")
      .order("paymentdate", { ascending: true })

    if (error) return

    const grouped = {}
    data.forEach(payment => {
      const date = new Date(payment.paymentdate).toLocaleDateString("en-IN")
      grouped[date] = (grouped[date] || 0) + (payment.amount || 0)
    })

    const chartData = Object.keys(grouped).map(date => ({
      date,
      revenue: Math.round(grouped[date])
    }))

    setData(chartData)
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#f1f5f9'} />
        <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <Tooltip formatter={(value) => `₹${value.toLocaleString("en-IN")}`} contentStyle={{ borderRadius: '0.75rem', border: `1px solid ${darkMode ? '#374151' : '#e2e8f0'}`, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)', backgroundColor: darkMode ? '#1f2937' : '#fff', color: darkMode ? '#f9fafb' : '#111827' }} />
        <Bar dataKey="revenue" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
