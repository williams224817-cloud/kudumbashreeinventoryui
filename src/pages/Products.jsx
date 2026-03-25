import React, { useState, useEffect } from 'react'
import { Search } from 'lucide-react'
import Table from '../components/Table'
import { supabase } from '../services/supabaseClient'

export default function Products() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('Fetching products...')

      const { data, error: fetchError } = await supabase
        .from('product')
        .select('*')

      if (fetchError) {
        console.error('Fetch error:', fetchError)
        throw fetchError
      }

      console.log('Products fetched:', data)
      setProducts(data || [])
    } catch (err) {
      console.error('Error fetching products:', err)
      setError(err.message || 'Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    { key: 'productid', label: 'Product ID', sortable: true },
    { key: 'productname', label: 'Product Name', sortable: true },
    { key: 'category', label: 'Category', sortable: true },
    { 
      key: 'unitprice', 
      label: 'Price (₹)', 
      sortable: true,
      render: (value) => <span className="font-semibold text-gray-900 dark:text-white">₹{value || 0}</span>
    },
    {
      key: 'unitid',
      label: 'Unit ID',
      render: (unitid) => <span className="text-sm text-gray-700 dark:text-gray-300">Unit: {unitid || 'N/A'}</span>
    }
  ]

  const filteredProducts = products.filter(p =>
    p.productname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-rose-500 text-sm font-medium">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Products</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">View and manage products from all micro units</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search products by name or category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm dark:text-gray-100 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none transition-all"
        />
      </div>

      {/* Table - View Only */}
      <Table
        columns={columns}
        data={filteredProducts}
        loading={loading}
      />
    </div>
  )
}