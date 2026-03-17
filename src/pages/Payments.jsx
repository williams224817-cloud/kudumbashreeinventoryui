import React, { useState } from 'react'
import { DollarSign, ListFilter, Clock, CheckCircle2, CreditCard } from 'lucide-react'
import Table from '../components/Table'
import RevenueChart from '../components/charts/RevenueChart'
import { usePayments } from '../hooks/useData'

export default function Payments() {
  const { payments, loading, error } = usePayments()
  const [filterStatus, setFilterStatus] = useState('')

  const columns = [
    { key: 'paymentid', label: 'Payment ID', sortable: true },
    { key: 'orderid', label: 'Order ID', sortable: true },
    { key: 'amount', label: 'Amount', sortable: true, render: (val) => <span className="font-semibold text-gray-900 dark:text-white">₹{val || 0}</span> },
    {
      key: 'paymentstatus',
      label: 'Status',
      render: (status) => {
        const s = (status || '').toLowerCase()
        return (
          <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
            s === 'completed' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' :
            s === 'pending' ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' :
            s === 'failed' ? 'bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400' :
            'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
          }`}>
            {status || 'Pending'}
          </span>
        )
      }
    },
    { key: 'paymentdate', label: 'Date', render: (date) => date ? new Date(date).toLocaleDateString() : 'N/A' },
  ]

  const filteredPayments = payments.filter(payment =>
    !filterStatus || (payment.paymentstatus || '').toLowerCase() === filterStatus
  )

  const stats = {
    total: payments.length,
    completed: payments.filter(p => (p.paymentstatus || '').toLowerCase() === 'completed').length,
    totalAmount: payments
      .filter(p => (p.paymentstatus || '').toLowerCase() === 'completed')
      .reduce((sum, p) => sum + (p.amount || 0), 0),
    pending: payments.filter(p => (p.paymentstatus || '').toLowerCase() === 'pending').length,
  }

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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Payments</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Track all payment transactions</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm p-5 flex items-start gap-4">
          <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"><CreditCard size={20} /></div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Transactions</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5">{stats.total}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm p-5 flex items-start gap-4">
          <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"><CheckCircle2 size={20} /></div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Completed</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5">{stats.completed}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm p-5 flex items-start gap-4">
          <div className="p-2.5 rounded-lg bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400"><DollarSign size={20} /></div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Total Received</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5">₹{stats.totalAmount.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm p-5 flex items-start gap-4">
          <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"><Clock size={20} /></div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Pending</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5">{stats.pending}</p>
          </div>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm p-5">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Revenue Per Day</h2>
        <RevenueChart />
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
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {/* Table */}
      <Table columns={columns} data={filteredPayments} loading={loading} />
    </div>
  )
}