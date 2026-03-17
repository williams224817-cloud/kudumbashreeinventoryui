import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Package, Truck, DollarSign, ShoppingCart, CheckCircle, Clock, Loader2, MapPin } from 'lucide-react'
import { supabase } from '../services/supabaseClient'

export default function OrderDetails() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchOrderDetails()
  }, [orderId])

  const fetchOrderDetails = async () => {
    try {
      setLoading(true)
      setError(null)
      const { data, error: fetchError } = await supabase
        .from('orders')
        .select(`
          *,
          orderitem(orderitemid, orderedquantity, priceperunit, product(productname, category)),
          transport(*),
          payment(*)
        `)
        .eq('orderid', orderId)
        .single()
      if (fetchError) throw fetchError
      setOrder(data)
    } catch (err) {
      setError('Database connection error')
      console.error('Error fetching order details:', err)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const s = (status || '').toLowerCase()
    const styles = {
      completed: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
      pending: 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
      processing: 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
      cancelled: 'bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400',
      delivered: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
      in_transit: 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
      failed: 'bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400',
    }
    return (
      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${styles[s] || 'bg-gray-50 text-gray-600'}`}>
        {status || 'N/A'}
      </span>
    )
  }

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
        <button onClick={() => navigate('/orders')} className="text-sm text-blue-600 hover:text-blue-700 font-medium">
          Back to Orders
        </button>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <p className="text-gray-400 text-sm">Order not found</p>
        <button onClick={() => navigate('/orders')} className="text-sm text-blue-600 hover:text-blue-700 font-medium">
          Back to Orders
        </button>
      </div>
    )
  }

  const orderItems = order.orderitem || []
  const transportRecords = Array.isArray(order.transport) ? order.transport : order.transport ? [order.transport] : []
  const paymentRecords = Array.isArray(order.payment) ? order.payment : order.payment ? [order.payment] : []

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/orders')} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <ArrowLeft size={20} className="text-gray-500 dark:text-gray-400" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Order #{order.orderid}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {order.orderdate ? new Date(order.orderdate).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
          </p>
        </div>
      </div>

      {/* Order Info */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm p-5">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
          <ShoppingCart size={16} className="text-gray-400" /> Order Information
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Order ID</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">#{order.orderid}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Customer</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">{order.customer || 'N/A'}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Status</p>
            <div className="mt-1">{getStatusBadge(order.orderstatus)}</div>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Total Amount</p>
            <p className="text-sm font-bold text-emerald-600 mt-0.5">₹{(order.totalamount || 0).toLocaleString('en-IN')}</p>
          </div>
        </div>
      </div>

      {/* Order Workflow Pipeline */}
      {(() => {
        const steps = [
          { key: 'pending', label: 'Pending', icon: Clock, color: 'amber' },
          { key: 'processing', label: 'Processing', icon: Loader2, color: 'blue' },
          { key: 'shipped', label: 'Shipped', icon: MapPin, color: 'violet' },
          { key: 'delivered', label: 'Delivered', icon: CheckCircle, color: 'emerald' },
        ]
        const statusMap = { pending: 0, processing: 1, shipped: 2, in_transit: 2, delivered: 3, completed: 3 }
        const currentStep = statusMap[(order.orderstatus || '').toLowerCase()] ?? 0
        const colorMap = {
          amber: { active: 'bg-amber-500 dark:bg-amber-400', ring: 'ring-amber-200 dark:ring-amber-800', line: 'bg-amber-400', text: 'text-amber-700 dark:text-amber-400' },
          blue: { active: 'bg-blue-500 dark:bg-blue-400', ring: 'ring-blue-200 dark:ring-blue-800', line: 'bg-blue-400', text: 'text-blue-700 dark:text-blue-400' },
          violet: { active: 'bg-violet-500 dark:bg-violet-400', ring: 'ring-violet-200 dark:ring-violet-800', line: 'bg-violet-400', text: 'text-violet-700 dark:text-violet-400' },
          emerald: { active: 'bg-emerald-500 dark:bg-emerald-400', ring: 'ring-emerald-200 dark:ring-emerald-800', line: 'bg-emerald-400', text: 'text-emerald-700 dark:text-emerald-400' },
        }
        return (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-5">Order Progress</h2>
            <div className="flex items-center justify-between">
              {steps.map((step, idx) => {
                const StepIcon = step.icon
                const reached = idx <= currentStep
                const c = colorMap[step.color]
                return (
                  <div key={step.key} className="flex items-center flex-1 last:flex-none">
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                        reached ? `${c.active} text-white ring-4 ${c.ring}` : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
                      }`}>
                        <StepIcon size={18} />
                      </div>
                      <span className={`mt-2 text-xs font-semibold ${reached ? c.text : 'text-gray-400 dark:text-gray-500'}`}>{step.label}</span>
                    </div>
                    {idx < steps.length - 1 && (
                      <div className={`flex-1 h-1 mx-2 rounded-full transition-all duration-300 ${
                        idx < currentStep ? colorMap[steps[idx + 1].color].line : 'bg-gray-200 dark:bg-gray-700'
                      }`} />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })()}

      {/* Order Items */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50 dark:border-gray-800">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Package size={16} className="text-gray-400" /> Order Items
          </h2>
        </div>
        {orderItems.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-400 dark:text-gray-500">No items in this order</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-50 dark:border-gray-800">
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">Product</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">Category</th>
                  <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-gray-400">Qty</th>
                  <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-gray-400">Price/Unit</th>
                  <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-gray-400">Total</th>
                </tr>
              </thead>
              <tbody>
                {orderItems.map((item, idx) => (
                  <tr key={item.orderitemid || idx} className="border-b border-gray-50 dark:border-gray-800 last:border-0 hover:bg-blue-50/30 dark:hover:bg-blue-900/20 transition-colors">
                    <td className="px-5 py-3.5 text-sm font-medium text-gray-900 dark:text-white">{item.product?.productname || 'Unknown'}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-500 dark:text-gray-400">{item.product?.category || 'N/A'}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-700 dark:text-gray-300 text-right">{item.orderedquantity}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-700 dark:text-gray-300 text-right">₹{item.priceperunit || 0}</td>
                    <td className="px-5 py-3.5 text-sm font-semibold text-gray-900 dark:text-white text-right">
                      ₹{((item.orderedquantity || 0) * (item.priceperunit || 0)).toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50/60 dark:bg-gray-800/60">
                  <td colSpan={4} className="px-5 py-3 text-right text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Grand Total</td>
                  <td className="px-5 py-3 text-right text-base font-bold text-emerald-600">₹{(order.totalamount || 0).toLocaleString('en-IN')}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Transport & Payment */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
            <Truck size={16} className="text-gray-400" /> Transport
          </h2>
          {transportRecords.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-6">No transport records</p>
          ) : (
            <div className="space-y-3">
              {transportRecords.map((t, idx) => (
                <div key={t.transportid || idx} className="border border-gray-100 dark:border-gray-800 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Vehicle</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white mt-0.5">{t.vehiclenumber || t.vehicle_number || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Driver</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white mt-0.5">{t.drivername || t.driver_name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Status</p>
                      <div className="mt-1">{getStatusBadge(t.transportstatus || t.status)}</div>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Departure</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white mt-0.5">
                        {t.departuredate || t.departure_date ? new Date(t.departuredate || t.departure_date).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
            <DollarSign size={16} className="text-gray-400" /> Payment
          </h2>
          {paymentRecords.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-6">No payment records</p>
          ) : (
            <div className="space-y-3">
              {paymentRecords.map((p, idx) => (
                <div key={p.paymentid || idx} className="border border-gray-100 dark:border-gray-800 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Amount</p>
                      <p className="text-base font-bold text-emerald-600 mt-0.5">₹{(p.amount || 0).toLocaleString('en-IN')}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Status</p>
                      <div className="mt-1">{getStatusBadge(p.paymentstatus || p.status)}</div>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Date</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white mt-0.5">
                        {p.paymentdate || p.transaction_date ? new Date(p.paymentdate || p.transaction_date).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Method</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white mt-0.5">{p.paymentmethod || p.payment_method || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
