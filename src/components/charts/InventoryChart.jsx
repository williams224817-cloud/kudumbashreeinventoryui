import { useEffect, useState } from "react"
import { supabase } from "../../services/supabaseClient"
import { useTheme } from "../../context/ThemeContext"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts"

export default function InventoryChart() {
  const [data, setData] = useState([])
  const { darkMode } = useTheme()

  useEffect(() => {
    fetchInventory()
  }, [])

  async function fetchInventory() {
    const { data, error } = await supabase
      .from("inventory")
      .select(`
        availablequantity,
        product(productname)
      `)
      .order("availablequantity", { ascending: false })
      .limit(10)

    if (error) return

    const formatted = data.map(item => ({
      name: item.product?.productname || "Unknown",
      stock: item.availablequantity
    }))

    setData(formatted)
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={{ borderRadius: '0.75rem', border: `1px solid ${darkMode ? '#374151' : '#e2e8f0'}`, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)', backgroundColor: darkMode ? '#1f2937' : '#fff', color: darkMode ? '#f9fafb' : '#111827' }} />
        <Bar dataKey="stock" fill="#10b981" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
