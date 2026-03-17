import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Package, ShoppingCart, Truck } from 'lucide-react'

const features = [
  {
    icon: Package,
    title: 'Inventory Management',
    description: 'Track products, batches, and warehouse stock levels in real time. Get alerts for low stock and manage supply efficiently.',
    color: 'from-blue-500 to-blue-600',
  },
  {
    icon: ShoppingCart,
    title: 'Order Management',
    description: 'Manage supermarket orders and product allocation with a multi-product order builder and status tracking.',
    color: 'from-emerald-500 to-emerald-600',
  },
  {
    icon: Truck,
    title: 'Transport & Payments',
    description: 'Track deliveries from micro units to supermarkets and manage payment records with full revenue analytics.',
    color: 'from-violet-500 to-violet-600',
  },
]

export default function Home() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 -left-40 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-emerald-500/8 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-6xl mx-auto px-6 pt-20 pb-16">
          {/* Badge */}
          <div className="flex justify-center mb-8">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/10 text-sm font-medium backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Kudumbashree Initiative
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-center leading-tight tracking-tight">
            Kudumbashree{' '}
            <span className="bg-gradient-to-r from-blue-400 via-emerald-400 to-violet-400 bg-clip-text text-transparent">
              Micro-Unit
            </span>
            <br />
            Inventory System
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-lg sm:text-xl text-center text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Centralized platform for managing micro-unit production, inventory, and supermarket orders.
          </p>

          {/* Description */}
          <p className="mt-4 text-center text-slate-400 max-w-3xl mx-auto leading-relaxed">
            Built for Kudumbashree micro enterprises across Kerala, this system streamlines the entire supply chain —
            from product manufacturing and quality checks to warehouse inventory, supermarket order fulfillment,
            transport logistics, and payment tracking — all in one unified dashboard.
          </p>

          {/* CTA Button */}
          <div className="flex justify-center mt-10">
            <button
              onClick={() => navigate('/dashboard')}
              className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-xl text-lg font-semibold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-105 active:scale-100 transition-all duration-300"
            >
              Enter Dashboard
              <svg
                className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="max-w-6xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 hover:border-white/20 hover:-translate-y-1 transition-all duration-300"
            >
              {/* Icon */}
              <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} shadow-lg mb-6`}>
                <feature.icon size={28} className="text-white" />
              </div>

              <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
              <p className="text-slate-400 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-8 text-center text-sm text-slate-500">
          Kudumbashree Micro-Unit Inventory Management System &copy; {new Date().getFullYear()}
        </div>
      </div>
    </div>
  )
}
