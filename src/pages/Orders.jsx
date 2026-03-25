import React, { useState, useEffect } from 'react'
import { Plus, Trash2, ShoppingCart, Clock, CheckCircle2, ListFilter } from 'lucide-react'
import Table from '../components/Table'
import Modal from '../components/Modal'
import { useOrders, useProducts } from '../hooks/useData'

export default function Orders() {
  const { orders, loading, error, addOrder } = useOrders()
  const { products } = useProducts()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [filterStatus, setFilterStatus] = useState('')

  const [supermarketid, setSupermarketid] = useState('')
  const [orderItems, setOrderItems] = useState([{ productid: '', quantity: 1 }])

  const columns = [
    { key: 'orderid', label: 'Order ID', sortable: true },
    { key: 'supermarketid', label: 'Supermarket ID', sortable: true },
    { key: 'totalamount', label: 'Total', sortable: true, render: (val) => <span className="font-semibold text-gray-900 dark:text-white">₹{val || 0}</span> },
    { 
      key: 'status', 
      label: 'Status',
      render: (status) => (
        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
          (status || '').toLowerCase() === 'completed' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' :
          (status || '').toLowerCase() === 'pending' ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' :
          (status || '').toLowerCase() === 'cancelled' ? 'bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400' :
          'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
        }`}>
          {status || 'Pending'}
        </span>
      )
    },
    { key: 'orderdate', label: 'Date', render: (date) => date ? new Date(date).toLocaleDateString() : 'N/A' },
  ]

  const filteredOrders = orders.filter(order =>
    !filterStatus || order.status === filterStatus
  )

  const getProduct = (id) => products.find(p => p.productid === Number(id))
  const getLineTotal = (item) => {
    const product = getProduct(item.productid)
    return product ? product.unitprice * item.quantity : 0
  }
  const orderTotal = orderItems.reduce((sum, item) => sum + getLineTotal(item), 0)
  const addItem = () => setOrderItems([...orderItems, { productid: '', quantity: 1 }])
  const removeItem = (index) => { if (orderItems.length > 1) setOrderItems(orderItems.filter((_, i) => i !== index)) }
  const updateItem = (index, field, value) => {
    setOrderItems(orderItems.map((item, i) => i === index ? { ...item, [field]: value } : item))
  }

  const resetForm = () => { setSupermarketid(''); setOrderItems([{ productid: '', quantity: 1 }]) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!supermarketid.trim()) return alert('Supermarket ID is required')
    if (!orderItems.some(i => i.productid)) return alert('Add at least one product')
    try {
      console.log('Submitting order:', { supermarketid: supermarketid.trim(), totalamount: orderTotal })
      await addOrder({ 
        supermarketid: supermarketid.trim(), 
        totalamount: orderTotal, 
        orderdate: new Date().toISOString() 
      })
      resetForm()
      setIsModalOpen(false)
      alert('Order created successfully!')
    } catch (error) {
      console.error('Order submission error:', error)
      alert('Error creating order: ' + error.message)
    }
  }

  const stats = {
    total: orders.length,
    pending: orders.filter(o => (o.status || '').toLowerCase() === 'pending').length,
    completed: orders.filter(o => (o.status || '').toLowerCase() === 'completed').length,
  }

  const inputClass = "w-full px-3 py-2.5 bg-gray-50/50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm dark:text-gray-100 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none transition-all"

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Orders</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage customer orders</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 text-sm font-medium shadow-sm hover:shadow-md transition-all"
        >
          <Plus size={16} />
          New Order
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 stagger">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm p-5 flex items-start gap-4">
          <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"><ShoppingCart size={20} /></div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Total Orders</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5">{stats.total}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm p-5 flex items-start gap-4">
          <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"><Clock size={20} /></div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Pending</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5">{stats.pending}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm p-5 flex items-start gap-4">
          <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"><CheckCircle2 size={20} /></div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Completed</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5">{stats.completed}</p>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2">
        <ListFilter size={16} className="text-gray-400" />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm dark:text-gray-100 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none transition-all"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Table */}
      <Table columns={columns} data={filteredOrders} loading={loading} />

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => { resetForm(); setIsModalOpen(false) }} title="Create New Order">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">Supermarket ID <span className="text-rose-500">*</span></label>
            <input type="text" value={supermarketid} onChange={(e) => setSupermarketid(e.target.value)} placeholder="Enter supermarket ID" className={inputClass} />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Products</label>
            <div className="space-y-2.5">
              {orderItems.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <select value={item.productid} onChange={(e) => updateItem(index, 'productid', e.target.value)} className={`flex-1 ${inputClass}`}>
                    <option value="">Select Product</option>
                    {products.map(p => (
                      <option key={p.productid} value={p.productid}>{p.productname} — ₹{p.unitprice}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', Math.max(1, parseInt(e.target.value) || 1))}
                    className={`w-20 text-center ${inputClass}`}
                  />
                  <span className="w-24 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">₹{getLineTotal(item)}</span>
                  <button type="button" onClick={() => removeItem(index)} className="p-1.5 text-gray-400 hover:text-rose-500 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
            <button type="button" onClick={addItem} className="mt-2 text-blue-600 hover:text-blue-700 text-xs font-semibold flex items-center gap-1">
              <Plus size={14} /> Add Product
            </button>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl flex justify-between items-center">
            <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Order Total</span>
            <span className="text-xl font-bold text-emerald-600">₹{orderTotal.toLocaleString('en-IN')}</span>
          </div>

          <div className="flex gap-2 pt-2">
            <button type="submit" className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all">
              <ShoppingCart size={16} /> Create Order
            </button>
            <button type="button" onClick={() => { resetForm(); setIsModalOpen(false) }} className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 py-2.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-sm font-medium transition-all">
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}