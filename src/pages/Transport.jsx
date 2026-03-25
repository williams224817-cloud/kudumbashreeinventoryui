import React, { useState } from 'react'
import { Plus, Truck, ArrowRight, CheckCircle, ListFilter, MapPin } from 'lucide-react'
import Table from '../components/Table'
import Form from '../components/Form'
import Modal from '../components/Modal'
import { useTransport } from '../hooks/useData'

export default function Transport() {
  const { transport, loading, error, addTransport, updateTransportStatus } = useTransport()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [filterStatus, setFilterStatus] = useState('')

  const nextStatus = {
    pending: { label: 'Start Transit', next: 'in_transit', color: 'bg-blue-600 hover:bg-blue-700' },
    in_transit: { label: 'Mark Delivered', next: 'delivered', color: 'bg-emerald-600 hover:bg-emerald-700' },
  }

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await updateTransportStatus(id, newStatus)
    } catch (error) {
      alert('Error updating status: ' + error.message)
    }
  }

  const columns = [
    { key: 'transportid', label: 'Transport ID', sortable: true },
    { key: 'vehiclenumber', label: 'Vehicle', sortable: true },
    { key: 'drivername', label: 'Driver', sortable: true },
    { key: 'origin', label: 'Origin', sortable: true },
    { key: 'destination', label: 'Destination', sortable: true },
    { key: 'orderid', label: 'Order ID', sortable: true },
    {
      key: 'status',
      label: 'Status',
      render: (status) => {
        const s = (status || '').toLowerCase()
        return (
          <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
            s === 'delivered' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' :
            s === 'in transit' || s === 'in_transit' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
            s === 'pending' ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' :
            'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
          }`}>
            {status || 'Pending'}
          </span>
        )
      }
    },
    {
      key: 'status',
      label: 'Action',
      render: (status, row) => {
        const s = (status || '').toLowerCase()
        const action = nextStatus[s]
        if (!action) return <span className="text-emerald-600 text-xs font-medium flex items-center gap-1"><CheckCircle size={13} /> Done</span>
        return (
          <button
            onClick={() => handleStatusUpdate(row.transportid, action.next)}
            className={`${action.color} text-white px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 shadow-sm transition-all`}
          >
            {action.label} <ArrowRight size={12} />
          </button>
        )
      }
    }
  ]

  const formFields = [
    { name: 'vehiclenumber', label: 'Vehicle Number/Plate', required: true, placeholder: 'KL-01-AB-1234' },
    { name: 'drivername', label: 'Driver Name', required: true, placeholder: 'Enter driver name' },
    { name: 'origin', label: 'Origin', required: true, placeholder: 'Enter origin location' },
    { name: 'destination', label: 'Destination', required: true, placeholder: 'Enter destination location' },
    { name: 'orderid', label: 'Order ID', type: 'number', placeholder: 'Associated order ID' },
  ]

  const filteredTransport = transport.filter(item =>
    !filterStatus || (item.status || '').toLowerCase() === filterStatus
  )

  const handleAddTransport = async (formData) => {
    try {
      await addTransport(formData)
      setIsModalOpen(false)
    } catch (error) {
      alert('Error creating transport record: ' + error.message)
    }
  }

  const pendingCount = transport.filter(t => (t.status || '').toLowerCase() === 'pending').length
  const inTransitCount = transport.filter(t => ['in transit', 'in_transit'].includes((t.status || '').toLowerCase())).length
  const deliveredCount = transport.filter(t => (t.status || '').toLowerCase() === 'delivered').length

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Transport Management</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Track shipments and logistics</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 text-sm font-medium shadow-sm hover:shadow-md transition-all"
        >
          <Plus size={16} />
          New Shipment
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 stagger">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm p-5 flex items-start gap-4">
          <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"><Truck size={20} /></div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Total Shipments</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5">{transport.length}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm p-5 flex items-start gap-4">
          <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"><MapPin size={20} /></div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">In Transit</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5">{inTransitCount}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm p-5 flex items-start gap-4">
          <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"><CheckCircle size={20} /></div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Delivered</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5">{deliveredCount}</p>
          </div>
        </div>
      </div>

      {/* Pipeline */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm p-5">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">Shipment Pipeline</h3>
        <div className="flex items-center justify-around">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-amber-50 dark:bg-amber-900/30 border-2 border-amber-200 dark:border-amber-700 flex items-center justify-center text-amber-700 dark:text-amber-400 text-lg font-bold">
              {pendingCount}
            </div>
            <p className="mt-2 text-xs font-medium text-gray-500 dark:text-gray-400">Pending</p>
          </div>
          <ArrowRight size={20} className="text-gray-300 dark:text-gray-600" />
          <div className="text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-200 dark:border-blue-700 flex items-center justify-center text-blue-700 dark:text-blue-400 text-lg font-bold">
              {inTransitCount}
            </div>
            <p className="mt-2 text-xs font-medium text-gray-500 dark:text-gray-400">In Transit</p>
          </div>
          <ArrowRight size={20} className="text-gray-300 dark:text-gray-600" />
          <div className="text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-emerald-50 dark:bg-emerald-900/30 border-2 border-emerald-200 dark:border-emerald-700 flex items-center justify-center text-emerald-700 dark:text-emerald-400 text-lg font-bold">
              {deliveredCount}
            </div>
            <p className="mt-2 text-xs font-medium text-gray-500 dark:text-gray-400">Delivered</p>
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
          <option value="in_transit">In Transit</option>
          <option value="delivered">Delivered</option>
          <option value="delayed">Delayed</option>
        </select>
      </div>

      {/* Table */}
      <Table columns={columns} data={filteredTransport} loading={loading} />

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Shipment">
        <Form fields={formFields} onSubmit={handleAddTransport} onCancel={() => setIsModalOpen(false)} submitLabel="Create Shipment" />
      </Modal>
    </div>
  )
}