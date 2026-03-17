import React, { useState } from 'react'
import { Plus, Search } from 'lucide-react'
import Table from '../components/Table'
import Form from '../components/Form'
import Modal from '../components/Modal'
import { useProducts } from '../hooks/useData'

export default function Products() {
  const { products, loading, error, addProduct, updateProduct, deleteProduct } = useProducts()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

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
  ]

  const formFields = [
    { name: 'productname', label: 'Product Name', required: true, placeholder: 'Enter product name' },
    { name: 'category', label: 'Category', required: true, placeholder: 'Enter category' },
    { name: 'unitprice', label: 'Unit Price (₹)', type: 'number', required: true, placeholder: '0.00' },
    { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Enter product description' },
  ]

  const filteredProducts = products.filter(p =>
    p.productname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAddProduct = async (formData) => {
    try {
      await addProduct({
        ...formData,
        unitprice: parseFloat(formData.unitprice)
      })
      setIsModalOpen(false)
      setEditingProduct(null)
    } catch (error) {
      alert('Error adding product: ' + error.message)
    }
  }

  const handleEditProduct = (product) => {
    setEditingProduct(product)
    setIsModalOpen(true)
  }

  const handleDeleteProduct = async (productid) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(productid)
      } catch (error) {
        alert('Error deleting product: ' + error.message)
      }
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingProduct(null)
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Products</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your product catalog</p>
        </div>
        <button
          onClick={() => { setEditingProduct(null); setIsModalOpen(true) }}
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 text-sm font-medium shadow-sm hover:shadow-md transition-all"
        >
          <Plus size={16} />
          Add Product
        </button>
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

      {/* Table */}
      <Table
        columns={columns}
        data={filteredProducts}
        loading={loading}
        onEdit={handleEditProduct}
        onDelete={handleDeleteProduct}
      />

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingProduct ? 'Edit Product' : 'Add New Product'}>
        <Form
          fields={formFields}
          initialData={editingProduct}
          onSubmit={handleAddProduct}
          onCancel={handleCloseModal}
          submitLabel={editingProduct ? 'Update Product' : 'Add Product'}
        />
      </Modal>
    </div>
  )
}