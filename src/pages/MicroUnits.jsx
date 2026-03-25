import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Zap, Search, CheckCircle2, XCircle, ChevronDown, ChevronUp, Package, Eye } from 'lucide-react'
import Table from '../components/Table'
import Form from '../components/Form'
import Modal from '../components/Modal'
import { useMicroUnits, useProductsByUnit, useProducts } from '../hooks/useData'

export default function MicroUnits() {
  const navigate = useNavigate()
  const { microUnits, loading, error, addMicroUnit, deleteMicroUnit } = useMicroUnits()
  const { addProduct } = useProducts()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)
  const [selectedUnitForProduct, setSelectedUnitForProduct] = useState(null)
  const { products: unitProducts } = useProductsByUnit(selectedUnitForProduct?.unitid)
  const [expandedUnit, setExpandedUnit] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  const columns = [
    { key: 'unitid', label: 'Unit ID', sortable: true },
    { key: 'unitname', label: 'Unit Name', sortable: true },
    { key: 'location', label: 'Location', sortable: true },
    { key: 'ownername', label: 'Owner', sortable: true },
    { key: 'phone', label: 'Phone' },
    {
      key: 'batch',
      label: 'Batches',
      render: (batches, row) => (
        <button
          onClick={(e) => { e.stopPropagation(); setExpandedUnit(expandedUnit === row.unitid ? null : row.unitid) }}
          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
        >
          <Package size={12} /> {(batches || []).length} batches
          {expandedUnit === row.unitid ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (status) => (
        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
          (status || '').toLowerCase() === 'active' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' :
          (status || '').toLowerCase() === 'inactive' ? 'bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400' :
          'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
        }`}>
          {status || 'Active'}
        </span>
      )
    },
    {
      key: 'unitid',
      label: 'Actions',
      render: (unitid, row) => (
        <button
          onClick={() => navigate(`/micro-units/${unitid}`)}
          className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors"
        >
          <Eye size={14} /> View
        </button>
      )
    },
  ]

  const formFields = [
    { name: 'unitname', label: 'Unit Name', required: true, placeholder: 'Enter micro unit name' },
    { name: 'location', label: 'Location', required: true, placeholder: 'Enter location' },
    { name: 'ownername', label: 'Owner Name', required: true, placeholder: 'Enter owner name' },
    { name: 'phone', label: 'Phone Number', placeholder: '+91 ...' },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'Active', label: 'Active' },
        { value: 'Inactive', label: 'Inactive' },
      ]
    },
    { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Describe the micro unit' },
  ]

  const productFormFields = [
    { name: 'productname', label: 'Product Name', required: true, placeholder: 'Enter product name' },
    { name: 'category', label: 'Category', required: true, placeholder: 'Enter category' },
    { name: 'unitprice', label: 'Unit Price (₹)', type: 'number', required: true, placeholder: '0.00' },
    { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Enter product description' },
  ]

  const filteredUnits = microUnits.filter(u =>
    u.unitname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.ownername?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAddUnit = async (formData) => {
    try {
      await addMicroUnit(formData)
      setIsModalOpen(false)
    } catch (err) {
      alert('Error adding micro unit: ' + err.message)
    }
  }

  const handleAddProduct = async (formData) => {
    try {
      if (!selectedUnitForProduct?.unitid) {
        alert('No unit selected')
        return
      }
      await addProduct({
        ...formData,
        unitid: selectedUnitForProduct.unitid,
        unitprice: parseFloat(formData.unitprice)
      })
      setIsProductModalOpen(false)
    } catch (error) {
      alert('Error adding product: ' + error.message)
    }
  }

  const handleDelete = async (row) => {
    if (window.confirm('Are you sure you want to delete this micro unit?')) {
      try {
        await deleteMicroUnit(row.unitid)
      } catch (err) {
        alert('Error deleting micro unit: ' + err.message)
      }
    }
  }

  const activeCount = microUnits.filter(u => (u.status || '').toLowerCase() === 'active').length

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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Micro Units</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage Kudumbashree micro enterprise units</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 text-sm font-medium shadow-sm hover:shadow-md transition-all"
        >
          <Plus size={16} />
          Add Micro Unit
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 stagger">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm p-5 flex items-start gap-4">
          <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"><Zap size={20} /></div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Total Units</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5">{microUnits.length}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm p-5 flex items-start gap-4">
          <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"><CheckCircle2 size={20} /></div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Active</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5">{activeCount}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm p-5 flex items-start gap-4">
          <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400"><XCircle size={20} /></div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Inactive</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5">{microUnits.length - activeCount}</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name, location, or contact..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm dark:text-gray-100 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none transition-all"
        />
      </div>

      {/* Table */}
      <Table columns={columns} data={filteredUnits} loading={loading} onDelete={handleDelete} />

      {/* Expanded Batch View */}
      {expandedUnit && (() => {
        const unit = microUnits.find(u => u.unitid === expandedUnit)
        const batches = unit?.batch || []
        return (
          <div className="space-y-4">
            {/* Batches Section */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden animate-fade-in">
              <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Package size={16} className="text-blue-500" />
                  Batches for {unit?.unitname || 'Unit'}
                </h3>
                <button onClick={() => setExpandedUnit(null)} className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">Close</button>
              </div>
              {batches.length === 0 ? (
                <div className="p-8 text-center text-sm text-gray-400 dark:text-gray-500">No batches found for this unit</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-50 dark:border-gray-800">
                        <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">Batch ID</th>
                        <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">Product</th>
                        <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-gray-400">Quantity</th>
                        <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">Production Date</th>
                        <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">Expiry Date</th>
                        <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">Quality</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                      {batches.map(b => (
                        <tr key={b.batchid} className="hover:bg-blue-50/30 dark:hover:bg-blue-900/20 transition-colors">
                          <td className="px-5 py-3 text-sm font-medium text-blue-600 dark:text-blue-400">#{b.batchid}</td>
                          <td className="px-5 py-3 text-sm text-gray-900 dark:text-white">{b.product?.productname || 'N/A'}</td>
                          <td className="px-5 py-3 text-sm text-gray-700 dark:text-gray-300 text-right">{b.quantity}</td>
                          <td className="px-5 py-3 text-sm text-gray-500 dark:text-gray-400">{b.productiondate ? new Date(b.productiondate).toLocaleDateString() : 'N/A'}</td>
                          <td className="px-5 py-3 text-sm text-gray-500 dark:text-gray-400">{b.expirydate ? new Date(b.expirydate).toLocaleDateString() : 'N/A'}</td>
                          <td className="px-5 py-3">
                            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                              (b.qualitystatus || '').toLowerCase() === 'passed' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                              (b.qualitystatus || '').toLowerCase() === 'failed' ? 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' :
                              'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                            }`}>
                              {b.qualitystatus || 'Pending'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Products Section */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden animate-fade-in">
              <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Package size={16} className="text-emerald-500" />
                  Products for {unit?.unitname || 'Unit'}
                </h3>
                <button 
                  onClick={() => { setSelectedUnitForProduct(unit); setIsProductModalOpen(true) }}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-xs font-medium transition-all"
                >
                  <Plus size={14} /> Add Product
                </button>
              </div>
              {unitProducts.length === 0 ? (
                <div className="p-8 text-center text-sm text-gray-400 dark:text-gray-500">No products found for this unit</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-50 dark:border-gray-800">
                        <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">Product ID</th>
                        <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">Product Name</th>
                        <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">Category</th>
                        <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-gray-400">Unit Price</th>
                        <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                      {unitProducts.map(p => (
                        <tr key={p.productid} className="hover:bg-emerald-50/30 dark:hover:bg-emerald-900/20 transition-colors">
                          <td className="px-5 py-3 text-sm font-medium text-emerald-600 dark:text-emerald-400">#{p.productid}</td>
                          <td className="px-5 py-3 text-sm text-gray-900 dark:text-white">{p.productname}</td>
                          <td className="px-5 py-3 text-sm text-gray-700 dark:text-gray-300">{p.category}</td>
                          <td className="px-5 py-3 text-sm text-gray-600 dark:text-gray-400 text-right font-semibold">₹{p.unitprice}</td>
                          <td className="px-5 py-3 text-sm text-gray-500 dark:text-gray-400">{p.description || 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )
      })()}

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Micro Unit">
        <Form fields={formFields} onSubmit={handleAddUnit} onCancel={() => setIsModalOpen(false)} submitLabel="Add Micro Unit" />
      </Modal>

      {/* Product Modal */}
      <Modal isOpen={isProductModalOpen} onClose={() => setIsProductModalOpen(false)} title={`Add Product to ${selectedUnitForProduct?.unitname || 'Unit'}`}>
        <Form 
          fields={productFormFields} 
          onSubmit={handleAddProduct} 
          onCancel={() => setIsProductModalOpen(false)} 
          submitLabel="Add Product" 
        />
      </Modal>
    </div>
  )
}