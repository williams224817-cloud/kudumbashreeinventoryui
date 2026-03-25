import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Package, ShoppingCart, Truck } from 'lucide-react'
import { motion } from 'framer-motion'

const features = [
  {
    icon: Package,
    title: 'Inventory Management',
    description: 'Track products, batches, and warehouse stock levels in real time. Get alerts for low stock and manage supply efficiently.',
    color: 'from-blue-500 to-blue-600',
    gradient: 'from-blue-500/20 to-blue-600/20',
  },
  {
    icon: ShoppingCart,
    title: 'Order Management',
    description: 'Manage supermarket orders and product allocation with a multi-product order builder and status tracking.',
    color: 'from-emerald-500 to-emerald-600',
    gradient: 'from-emerald-500/20 to-emerald-600/20',
  },
  {
    icon: Truck,
    title: 'Transport & Payments',
    description: 'Track deliveries from micro units to supermarkets and manage payment records with full revenue analytics.',
    color: 'from-violet-500 to-violet-600',
    gradient: 'from-violet-500/20 to-violet-600/20',
  },
]

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: 'easeOut' },
  },
}

const badgeVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
}

const buttonVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.6, delay: 0.3 } },
  hover: { scale: 1.05, transition: { duration: 0.2 } },
  tap: { scale: 0.95 },
}

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.15 },
  }),
  hover: { y: -8, transition: { duration: 0.3 } },
}

export default function Home() {
  const navigate = useNavigate()

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white overflow-hidden"
    >
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Animated Background Blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Floating blob 1 - Blue */}
          <motion.div
            className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
            animate={{
              y: [0, -30, 0],
              x: [0, 20, 0],
            }}
            transition={{
              duration: 8,
              ease: 'easeInOut',
              repeat: Infinity,
            }}
          />

          {/* Floating blob 2 - Violet */}
          <motion.div
            className="absolute top-1/2 -left-40 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl"
            animate={{
              y: [0, 30, 0],
              x: [0, -20, 0],
            }}
            transition={{
              duration: 7,
              ease: 'easeInOut',
              repeat: Infinity,
              delay: 1,
            }}
          />

          {/* Floating blob 3 - Emerald */}
          <motion.div
            className="absolute bottom-0 right-1/4 w-80 h-80 bg-emerald-500/8 rounded-full blur-3xl"
            animate={{
              y: [0, 25, 0],
              x: [0, -15, 0],
            }}
            transition={{
              duration: 9,
              ease: 'easeInOut',
              repeat: Infinity,
              delay: 0.5,
            }}
          />
        </div>

        {/* Content */}
        <motion.div
          className="relative max-w-6xl mx-auto px-6 pt-20 pb-16"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Badge with animation */}
          <motion.div
            className="flex justify-center mb-8"
            variants={badgeVariants}
          >
            <motion.span
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/10 text-sm font-medium backdrop-blur-sm hover:bg-white/20 hover:border-white/20"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <motion.span
                className="w-2 h-2 rounded-full bg-emerald-400"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              Kudumbashree Initiative
            </motion.span>
          </motion.div>

          {/* Title - Split into parts for stagger effect */}
          <div className="text-center">
            <motion.h1
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight"
              variants={itemVariants}
            >
              Kudumbashree{' '}
              <motion.span
                className="inline-block bg-gradient-to-r from-blue-400 via-emerald-400 to-violet-400 bg-clip-text text-transparent"
                animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                transition={{ duration: 3, repeat: Infinity }}
                style={{ backgroundSize: '200% 200%' }}
              >
                Micro-Unit
              </motion.span>
              <br />
              <motion.span variants={itemVariants} className="inline-block">
                Inventory System
              </motion.span>
            </motion.h1>
          </div>

          {/* Subtitle */}
          <motion.p
            className="mt-6 text-lg sm:text-xl text-center text-slate-300 max-w-2xl mx-auto leading-relaxed"
            variants={itemVariants}
          >
            Centralized platform for managing micro-unit production, inventory, and supermarket orders.
          </motion.p>

          {/* Description */}
          <motion.p
            className="mt-4 text-center text-slate-400 max-w-3xl mx-auto leading-relaxed"
            variants={itemVariants}
          >
            Built for Kudumbashree micro enterprises across Kerala, this system streamlines the entire supply chain —
            from product manufacturing and quality checks to warehouse inventory, supermarket order fulfillment,
            transport logistics, and payment tracking — all in one unified dashboard.
          </motion.p>

          {/* CTA Button */}
          <motion.div className="flex justify-center mt-10" variants={itemVariants}>
            <motion.button
              onClick={() => navigate('/dashboard')}
              className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-xl text-lg font-semibold shadow-lg shadow-blue-500/25"
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              {/* Animated background glow */}
              <motion.div
                className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500 to-emerald-500 opacity-0 blur-lg -z-10"
                animate={{ opacity: [0.2, 0.4, 0.2] }}
                transition={{ duration: 2, repeat: Infinity }}
              />

              Enter Dashboard
              <motion.svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </motion.svg>
            </motion.button>
          </motion.div>
        </motion.div>
      </div>

      {/* Feature Cards Section */}
      <motion.div
        className="max-w-6xl mx-auto px-6 pb-24"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              custom={index}
              variants={cardVariants}
              whileHover="hover"
              className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 overflow-hidden hover:border-white/20"
            >
              {/* Hover gradient background */}
              <motion.div
                className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 -z-10`}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />

              {/* Icon with animation */}
              <motion.div
                className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} shadow-lg mb-6`}
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.3 }}
              >
                <feature.icon size={28} className="text-white" />
              </motion.div>

              {/* Title */}
              <motion.h3
                className="text-xl font-bold text-white mb-3"
                variants={itemVariants}
              >
                {feature.title}
              </motion.h3>

              {/* Description */}
              <motion.p
                className="text-slate-400 leading-relaxed"
                variants={itemVariants}
              >
                {feature.description}
              </motion.p>

              {/* Card shine effect on hover */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0"
                whileHover={{ opacity: 0.1, x: ['-100%', '100%'] }}
                transition={{ duration: 0.6 }}
              />
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Footer */}
      <motion.div
        className="border-t border-white/10"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-6xl mx-auto px-6 py-8 text-center text-sm text-slate-500">
          Kudumbashree Micro-Unit Inventory Management System &copy; {new Date().getFullYear()}
        </div>
      </motion.div>
    </motion.div>
  )
}
