import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Bell, Moon, Sun, X, Package, ShoppingCart, Boxes } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { supabase } from '../../services/supabaseClient'

export default function Navbar() {
  const { darkMode, toggleDarkMode } = useTheme()
  const navigate = useNavigate()
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [results, setResults] = useState({ products: [], orders: [], inventory: [] })
  const [searching, setSearching] = useState(false)
  const [showNotifs, setShowNotifs] = useState(false)
  const [alerts, setAlerts] = useState([])
  const searchRef = useRef(null)
  const notifRef = useRef(null)

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false)
        setSearchTerm('')
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifs(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Fetch alerts on mount
  useEffect(() => {
    fetchAlerts()
  }, [])

  const fetchAlerts = async () => {
    try {
      const [lowStock, recentOrders, recentPayments] = await Promise.all([
        supabase.from('inventory').select('inventoryid, availablequantity, product(productname)').lt('availablequantity', 10),
        supabase.from('orders').select('orderid, customer, orderdate').order('orderdate', { ascending: false }).limit(3),
        supabase.from('payment').select('paymentid, amount, paymentdate').order('paymentdate', { ascending: false }).limit(3),
      ])

      const items = []
      if (lowStock.data) {
        lowStock.data.forEach(item => {
          items.push({ type: 'warning', message: `Low stock: ${item.product?.productname || 'Unknown'} (${item.availablequantity} left)` })
        })
      }
      if (recentOrders.data) {
        recentOrders.data.forEach(o => {
          items.push({ type: 'info', message: `New order #${o.orderid} from ${o.customer || 'Unknown'}` })
        })
      }
      if (recentPayments.data) {
        recentPayments.data.forEach(p => {
          items.push({ type: 'success', message: `Payment received: ₹${(p.amount || 0).toLocaleString('en-IN')}` })
        })
      }
      setAlerts(items)
    } catch (err) {
      console.error('Error fetching alerts:', err)
    }
  }

  // Global search
  useEffect(() => {
    if (searchTerm.length < 2) {
      setResults({ products: [], orders: [], inventory: [] })
      return
    }
    const timeout = setTimeout(async () => {
      setSearching(true)
      try {
        const [products, orders, inventory] = await Promise.all([
          supabase.from('product').select('productid, productname, category').ilike('productname', `%${searchTerm}%`).limit(5),
          supabase.from('orders').select('orderid, supermarketid, status').or(`supermarketid.ilike.%${searchTerm}%,orderid.eq.${parseInt(searchTerm) || 0}`).limit(5),
          supabase.from('inventory').select('inventoryid, availablequantity, product(productname)').limit(50),
        ])
        const filteredInv = (inventory.data || []).filter(i =>
          i.product?.productname?.toLowerCase().includes(searchTerm.toLowerCase())
        ).slice(0, 5)
        setResults({
          products: products.data || [],
          orders: orders.data || [],
          inventory: filteredInv,
        })
      } catch (err) {
        console.error('Search error:', err)
      } finally {
        setSearching(false)
      }
    }, 300)
    return () => clearTimeout(timeout)
  }, [searchTerm])

  const hasResults = results.products.length > 0 || results.orders.length > 0 || results.inventory.length > 0
  const unreadCount = alerts.filter(a => a.type === 'warning').length

  return (
    <header className="sticky top-0 z-40 h-14 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 flex items-center px-6 gap-4">
      {/* Title */}
      <h1 className="text-sm font-bold text-gray-900 dark:text-white hidden lg:block whitespace-nowrap">
        Kudumbashree Inventory
      </h1>

      <div className="flex-1" />

      {/* Search */}
      <div ref={searchRef} className="relative">
        <div className="flex items-center">
          <div className={`flex items-center transition-all duration-200 ${searchOpen ? 'w-64 sm:w-80' : 'w-0'} overflow-hidden`}>
            <div className="relative w-full">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search products, orders, inventory..."
                className="w-full pl-9 pr-8 py-1.5 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none"
                autoFocus={searchOpen}
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
          <button
            onClick={() => { setSearchOpen(!searchOpen); if (searchOpen) setSearchTerm('') }}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-400 transition-colors"
          >
            <Search size={18} />
          </button>
        </div>

        {/* Search Results Dropdown */}
        {searchOpen && searchTerm.length >= 2 && (
          <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl max-h-80 overflow-y-auto">
            {searching ? (
              <div className="p-4 text-center text-sm text-gray-400">Searching...</div>
            ) : !hasResults ? (
              <div className="p-4 text-center text-sm text-gray-400">No results found</div>
            ) : (
              <div className="py-2">
                {results.products.length > 0 && (
                  <div>
                    <p className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Products</p>
                    {results.products.map(p => (
                      <button
                        key={p.productid}
                        onClick={() => { navigate('/products'); setSearchOpen(false); setSearchTerm('') }}
                        className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
                      >
                        <Package size={14} className="text-blue-500 shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{p.productname}</p>
                          <p className="text-xs text-gray-400">{p.category}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {results.orders.length > 0 && (
                  <div>
                    <p className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Orders</p>
                    {results.orders.map(o => (
                      <button
                        key={o.orderid}
                        onClick={() => { navigate(`/orders/${o.orderid}`); setSearchOpen(false); setSearchTerm('') }}
                        className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
                      >
                        <ShoppingCart size={14} className="text-emerald-500 shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">Order #{o.orderid}</p>
                          <p className="text-xs text-gray-400">{o.supermarketid} — {o.status}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {results.inventory.length > 0 && (
                  <div>
                    <p className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Inventory</p>
                    {results.inventory.map(i => (
                      <button
                        key={i.inventoryid}
                        onClick={() => { navigate('/inventory'); setSearchOpen(false); setSearchTerm('') }}
                        className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
                      >
                        <Boxes size={14} className="text-violet-500 shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{i.product?.productname || 'Unknown'}</p>
                          <p className="text-xs text-gray-400">Stock: {i.availablequantity}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Dark Mode Toggle */}
      <button
        onClick={toggleDarkMode}
        className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
        title={darkMode ? 'Light mode' : 'Dark mode'}
      >
        {darkMode ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      {/* Notifications */}
      <div ref={notifRef} className="relative">
        <button
          onClick={() => setShowNotifs(!showNotifs)}
          className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>

        {showNotifs && (
          <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl max-h-80 overflow-y-auto">
            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Notifications</h3>
            </div>
            {alerts.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-400">No notifications</div>
            ) : (
              <div className="py-1">
                {alerts.map((alert, idx) => (
                  <div key={idx} className="px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <div className="flex items-start gap-2">
                      <span className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${
                        alert.type === 'warning' ? 'bg-amber-500' :
                        alert.type === 'success' ? 'bg-emerald-500' : 'bg-blue-500'
                      }`} />
                      <p className="text-sm text-gray-700 dark:text-gray-300">{alert.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* User Avatar */}
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold cursor-pointer">
        A
      </div>
    </header>
  )
}
