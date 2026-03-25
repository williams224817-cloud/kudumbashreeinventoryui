import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2, Package, MapPin, Users } from 'lucide-react'
import Table from '../components/Table'
import Modal from '../components/Modal'
import Form from '../components/Form'
import { supabase } from '../services/supabaseClient'

export default function MicroUnitDetails() {
  const { unitId } = useParams()
  const navigate = useNavigate()
  const [unit, setUnit] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    fetchUnitDetails()
  }, [unitId])

  const fetchUnitDetails = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log(`Fetching micro unit with unitId: ${unitId}`)

      // Fetch unit details
      const { data: unitData, error: unitError } = await supabase
        .from('microunit')
        .select('*')
        .eq('unitid', unitId)
        .single()

      if (unitError) {
        console.error('Unit fetch error:', unitError)
        throw unitError
      }

      console.log('Unit data fetched:', unitData)
      setUnit(unitData)

      // Fetch products for this unit
      console.log(`Fetching products for unitid: ${unitId}`)
      const { data: productsData, error: productsError } = await supabase
        .from('product')
        .select('*')
        .eq('unitid', unitId)

      if (productsError && productsError.code !== 'PGRST116') {
        console.error('Products fetch error:', productsError)
        throw productsError
      }

      console.log('Products data fetched:', productsData)
      setProducts(productsData || [])
    } catch (err) {
      console.error('Error loading micro unit details:', err)
      setError(err.message || 'Failed to load micro unit details')
    } finally {
      setLoading(false)
    }
  }

  const handleAddProduct = async (formData) => {
    try {
      if (!formData.productname || !formData.category || !formData.unitprice) {
        alert('All fields are required')
        return
      }

      console.log('Adding product with data:', formData)
      const { error: insertError } = await supabase
        .from('product')
        .insert([{
          productname: formData.productname,
          category: formData.category,
          unitprice: parseFloat(formData.unitprice),
          description: formData.description || '',
          unitid: parseInt(unitId)
        }])

      if (insertError) {
        console.error('Insert error:', insertError)
        throw insertError
      }

      console.log('Product added successfully')
      setIsModalOpen(false)
      fetchUnitDetails()
    } catch (err) {
      console.error('Error adding product:', err)
      alert('Error adding product: ' + (err.message || 'Unknown error'))
    }
  }

  const handleDeleteProduct = async (productid) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return

    try {
      console.log('Deleting product with productid:', productid)
      const { error: deleteError } = await supabase
        .from('product')
        .delete()
        .eq('productid', productid)

      if (deleteError) {
        console.error('Delete error:', deleteError)
        throw deleteError
      }

      console.log('Product deleted successfully')
      setProducts(products.filter(p => p.productid !== productid))
    } catch (err) {
      console.error('Error deleting product:', err)
      alert('Error deleting product: ' + (err.message || 'Unknown error'))
    }
  }

  const productColumns = [
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
      key: 'description',
      label: 'Description',
      render: (value) => <span className="text-sm text-gray-600 dark:text-gray-400">{value || 'N/A'}</span>
    }
  ]

  const productFormFields = [
    { name: 'productname', label: 'Product Name', required: true, placeholder: 'Enter product name' },
    { name: 'category', label: 'Category', required: true, placeholder: 'Enter category' },
    { name: 'unitprice', label: 'Unit Price (₹)', type: 'number', required: true, placeholder: '0.00' },
    { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Enter product description' },
  ]

  if (loading) {
    return (
      <div className="space-y-4 animate-fade-in">
        <div className="skeleton h-8 w-48" />
        <div className="skeleton h-40 w-full" />
        <div className="skeleton h-60 w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <p className="text-rose-500 text-sm font-medium">{error}</p>
        <button onClick={() => navigate('/micro-units')} className="text-sm text-blue-600 hover:text-blue-700 font-medium">
          Back to Micro Units
        </button>
      </div>
    )
  }

  if (!unit) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <p className="text-gray-400 text-sm">Micro unit not found</p>
        <button onClick={() => navigate('/micro-units')} className="text-sm text-blue-600 hover:text-blue-700 font-medium">
          Back to Micro Units
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/micro-units')} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <ArrowLeft size={20} className="text-gray-500 dark:text-gray-400" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{unit.unitname}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Micro Unit Details</p>
        </div>
      </div>

      {/* Unit Information Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
              <MapPin size={20} />
            </div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Location</p>
          </div>
          <p className="text-sm font-bold text-gray-900 dark:text-white">{unit.location || 'N/A'}</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
              <Users size={20} />
            </div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Contact</p>
          </div>
          <p className="text-sm font-bold text-gray-900 dark:text-white">{unit.contactperson || 'N/A'}</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
              <Package size={20} />
            </div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Products</p>
          </div>
          <p className="text-sm font-bold text-gray-900 dark:text-white">{products.length}</p>
        </div>
      </div>

      {/* Products Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Products</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Products produced by this micro unit</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 text-sm font-medium shadow-sm hover:shadow-md transition-all"
          >
            <Plus size={16} />
            Add Product
          </button>
        </div>

        {/* Products Table */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
          {products.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-400 dark:text-gray-500">
              No products found for this micro unit. Click "Add Product" to create one.
            </div>
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
                    <th className="px-5 py-3 text-center text-[11px] font-semibold uppercase tracking-wider text-gray-400">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                  {products.map(product => (
                    <tr key={product.productid} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-5 py-3 text-sm font-medium text-blue-600 dark:text-blue-400">#{product.productid}</td>
                      <td className="px-5 py-3 text-sm text-gray-900 dark:text-white">{product.productname}</td>
                      <td className="px-5 py-3 text-sm text-gray-700 dark:text-gray-300">{product.category}</td>
                      <td className="px-5 py-3 text-sm text-right font-semibold text-emerald-600 dark:text-emerald-400">₹{product.unitprice}</td>
                      <td className="px-5 py-3 text-sm text-gray-600 dark:text-gray-400">{product.description || 'N/A'}</td>
                      <td className="px-5 py-3 text-center">
                        <button
                          onClick={() => handleDeleteProduct(product.productid)}
                          className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                          title="Delete product"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Add Product to ${unit.unitname}`}>
        <Form
          fields={productFormFields}
          onSubmit={handleAddProduct}
          onCancel={() => setIsModalOpen(false)}
          submitLabel="Add Product"
        />
      </Modal>
    </div>
  )
}
