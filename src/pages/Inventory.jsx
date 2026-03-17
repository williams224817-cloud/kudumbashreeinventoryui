import React, { useState } from 'react'
import { AlertCircle, AlertTriangle, Boxes, Search, TrendingDown, DollarSign } from 'lucide-react'
import Table from '../components/Table'
import { useInventory } from '../hooks/useData'

export default function Inventory() {
  const { inventory, loading, error } = useInventory()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterWarehouse, setFilterWarehouse] = useState('')

  const columns = [
    { key: 'inventoryid', label: 'Inventory ID', sortable: true },
    { 
      key: 'product', 
      label: 'Product Name',
      render: (product) => <span className="font-medium text-gray-900 dark:text-white">{product?.productname || 'N/A'}</span>
    },
    { 
      key: 'product', 
      label: 'Category',
      render: (product) => product?.category || 'N/A'
    },
    { key: 'availablequantity', label: 'Current Stock', sortable: true },
    {
      key: 'availablequantity',
      label: 'Status',
      render: (qty) => {
        const level = qty || 0
        if (level <= 10) return <span className="inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400">Low Stock</span>
        if (level <= 50) return <span className="inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">Medium</span>
        return <span className="inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">Good</span>
      }
    }
  ]

  const filteredInventory = inventory.filter(item =>
    (item.product?.productname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     item.productid?.toString().includes(searchTerm)) &&
    (!filterWarehouse || item.warehouse?.toString() === filterWarehouse)
  )

  const lowStockItems = inventory.filter(item => (item.availablequantity || 0) <= 10)
  const totalValue = inventory.reduce((sum, item) => sum + ((item.availablequantity || 0) * (item.product?.unitprice || 0)), 0)

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-rose-500 text-sm font-medium">Database connection error</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Inventory Management</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Monitor stock levels across warehouses</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 stagger">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm p-5 flex items-start gap-4">
          <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"><Boxes size={20} /></div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Total Items</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5">{inventory.length}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm p-5 flex items-start gap-4">
          <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"><TrendingDown size={20} /></div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Low Stock</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5">{lowStockItems.length}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm p-5 flex items-start gap-4">
          <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"><DollarSign size={20} /></div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Total Value</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5">₹{totalValue.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <div className="bg-rose-50 dark:bg-rose-950/50 border border-rose-100 dark:border-rose-900 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={16} className="text-rose-600 dark:text-rose-400" />
            <h3 className="text-sm font-semibold text-rose-800 dark:text-rose-300">Low Stock Alert — {lowStockItems.length} item{lowStockItems.length > 1 ? 's' : ''} below threshold</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {lowStockItems.map(item => (
              <span key={item.inventoryid} className="inline-flex items-center gap-1.5 bg-white/80 dark:bg-gray-900/80 text-rose-700 dark:text-rose-400 px-3 py-1 rounded-full text-xs font-medium border border-rose-200 dark:border-rose-800">
                {item.product?.productname || 'Unknown'}
                <span className="bg-rose-600 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">{item.availablequantity}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by product name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm dark:text-gray-100 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none transition-all"
          />
        </div>
        <input
          type="text"
          placeholder="Filter by warehouse..."
          value={filterWarehouse}
          onChange={(e) => setFilterWarehouse(e.target.value)}
          className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm dark:text-gray-100 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none transition-all"
        />
      </div>

      {/* Table */}
      <Table columns={columns} data={filteredInventory} loading={loading} />
    </div>
  )
}