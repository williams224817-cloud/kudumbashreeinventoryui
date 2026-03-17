import { useState, useEffect } from "react"
import { supabase } from "../services/supabaseClient"

export function useDashboardStats() {
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    inventory: 0,
    payments: 0,
    transport: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getStats()
  }, [])

  async function getStats() {
    try {
      setLoading(true)
      const [products, orders, inventory, payments, transport] = await Promise.all([
        supabase.from("product").select("*", { count: "exact", head: true }),
        supabase.from("orders").select("*", { count: "exact", head: true }),
        supabase.from("inventory").select("*", { count: "exact", head: true }),
        supabase.from("payment").select("*", { count: "exact", head: true }),
        supabase.from("transport").select("*", { count: "exact", head: true }),
      ])

      setStats({
        products: products.count || 0,
        orders: orders.count || 0,
        inventory: inventory.count || 0,
        payments: payments.count || 0,
        transport: transport.count || 0,
      })
    } catch (error) {
      console.error("Error fetching stats:", error)
    } finally {
      setLoading(false)
    }
  }

  return { stats, loading, refresh: getStats }
}
