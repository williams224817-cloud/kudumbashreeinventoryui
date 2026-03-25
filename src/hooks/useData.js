import { useState, useEffect } from 'react'
import { supabase } from '../services/supabaseClient'

// PHASE 2: useProducts - Fetch all products from 'product' table
export function useProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('product')
        .select('*, microunit(unitname)')
      if (error) throw error
      setProducts(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const addProduct = async (product) => {
    try {
      // Validate required fields
      if (!product.productname) throw new Error('Product name is required')
      if (!product.unitid) throw new Error('Unit ID is required')
      
      const { data, error } = await supabase
        .from('product')
        .insert([{
          productname: product.productname,
          category: product.category || '',
          unitprice: parseFloat(product.unitprice) || 0,
          description: product.description || '',
          unitid: product.unitid
        }])
        .select('*, microunit(unitname)')
      if (error) throw error
      setProducts([...products, ...(data || [])])
      return data
    } catch (err) {
      throw new Error(`Database schema mismatch: ${err.message}`)
    }
  }

  const updateProduct = async (productid, product) => {
    try {
      const { data, error } = await supabase
        .from('product')
        .update({
          productname: product.productname,
          category: product.category,
          unitprice: parseFloat(product.unitprice),
          description: product.description,
          unitid: product.unitid
        })
        .eq('productid', productid)
        .select('*, microunit(unitname)')
      if (error) throw error
      setProducts(products.map(p => p.productid === productid ? data[0] : p))
      return data
    } catch (err) {
      throw new Error(`Database schema mismatch: ${err.message}`)
    }
  }

  const deleteProduct = async (productid) => {
    try {
      const { error } = await supabase
        .from('product')
        .delete()
        .eq('productid', productid)
      if (error) throw error
      setProducts(products.filter(p => p.productid !== productid))
    } catch (err) {
      throw new Error(`Database schema mismatch: ${err.message}`)
    }
  }

  return { products, setProducts, loading, error, addProduct, updateProduct, deleteProduct, fetchProducts }
}

// Helper hook: useProductsByUnit - Fetch products for a specific micro unit
export function useProductsByUnit(unitid) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (unitid) {
      fetchProductsByUnit()
    }
  }, [unitid])

  const fetchProductsByUnit = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('product')
        .select('*')
        .eq('unitid', unitid)
      if (error) throw error
      setProducts(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return { products, loading, error, fetchProductsByUnit }
}

// PHASE 4: useInventory - Fetch inventory with product JOIN
export function useInventory() {
  const [inventory, setInventory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchInventory()
  }, [])

  const fetchInventory = async () => {
    try {
      setLoading(true)
      let result = await supabase
        .from('inventory')
        .select(`
          inventoryid,
          availablequantity,
          productid,
          product(productname, category, unitprice)
        `)
      if (result.error) {
        result = await supabase.from('inventory').select('*')
      }
      if (result.error) throw result.error
      setInventory(result.data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const updateInventory = async (inventoryid, quantity) => {
    const { data, error } = await supabase
      .from('inventory')
      .update({ availablequantity: quantity })
      .eq('inventoryid', inventoryid)
      .select()
    if (error) throw error
    setInventory(inventory.map(i => i.inventoryid === inventoryid ? data[0] : i))
  }

  return { inventory, loading, error, updateInventory, fetchInventory }
}

// PHASE 5: useOrders - Fetch orders sorted by date
export function useOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      let result = await supabase
        .from('orders')
        .select('*')
        .order('orderdate', { ascending: false })
      if (result.error) {
        result = await supabase.from('orders').select('*')
      }
      if (result.error) throw result.error
      setOrders(result.data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const addOrder = async (order) => {
    try {
      // Validate required fields for orders table
      if (!order.supermarketid) throw new Error('Supermarket ID is required')
      if (!order.totalamount || order.totalamount <= 0) throw new Error('Valid total amount is required')
      
      console.log('Creating order with payload:', {
        supermarketid: order.supermarketid,
        totalamount: order.totalamount,
        orderdate: order.orderdate || new Date().toISOString()
      })
      
      const { data, error } = await supabase
        .from('orders')
        .insert([{
          supermarketid: order.supermarketid,
          totalamount: order.totalamount,
          orderdate: order.orderdate || new Date().toISOString()
          // Note: 'status' column will be added to database soon
          // status: order.status || 'Pending'
        }])
        .select()
      
      if (error) {
        console.error('Order insert error:', error)
        throw error
      }
      
      console.log('Order created successfully:', data)
      fetchOrders()
      return data
    } catch (err) {
      console.error('Error in addOrder:', err)
      throw new Error(`Failed to create order: ${err.message}`)
    }
  }

  const updateOrderStatus = async (orderid, status) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: status })
        .eq('orderid', orderid)
      if (error) throw error
      fetchOrders()
    } catch (err) {
      throw new Error(`Database schema mismatch: ${err.message}`)
    }
  }

  return { orders, loading, error, addOrder, updateOrderStatus, fetchOrders }
}

// PHASE 7: useTransport - Fetch and manage transport records
export function useTransport() {
  const [transport, setTransport] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchTransport()
  }, [])

  const fetchTransport = async () => {
    try {
      setLoading(true)
      // Try with ordering first, fall back to simple select
      let result = await supabase
        .from('transport')
        .select('*')
        .order('transportid', { ascending: false })
      if (result.error) {
        result = await supabase.from('transport').select('*')
      }
      if (result.error) throw result.error
      setTransport(result.data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const addTransport = async (shipment) => {
    try {
      // Validate required fields for transport table
      if (!shipment.vehiclenumber) throw new Error('Vehicle number is required')
      if (!shipment.drivername) throw new Error('Driver name is required')
      
      const { data, error } = await supabase
        .from('transport')
        .insert([{
          vehiclenumber: shipment.vehiclenumber,
          drivername: shipment.drivername,
          origin: shipment.origin || '',
          destination: shipment.destination || '',
          status: shipment.status || 'Pending',
          orderid: shipment.orderid || null
        }])
        .select()
      if (error) throw error
      fetchTransport()
      return data
    } catch (err) {
      throw new Error(`Database schema mismatch: ${err.message}`)
    }
  }

  const updateTransportStatus = async (transportid, status) => {
    try {
      const { error } = await supabase
        .from('transport')
        .update({ status: status })
        .eq('transportid', transportid)
      if (error) throw error
      fetchTransport()
    } catch (err) {
      throw new Error(`Database schema mismatch: ${err.message}`)
    }
  }

  return { transport, loading, error, addTransport, updateTransportStatus, fetchTransport }
}

// PHASE 8: usePayments - Fetch and manage payment records
export function usePayments() {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchPayments()
  }, [])

  const fetchPayments = async () => {
    try {
      setLoading(true)
      let result = await supabase
        .from('payment')
        .select('*')
        .order('paymentdate', { ascending: false })
      if (result.error) {
        result = await supabase.from('payment').select('*')
      }
      if (result.error) throw result.error
      setPayments(result.data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const addPayment = async (paymentRecord) => {
    const { data, error } = await supabase
      .from('payment')
      .insert([{
        orderid: paymentRecord.orderid,
        amount: paymentRecord.amount,
        paymentstatus: 'Completed',
        paymentdate: new Date().toISOString()
      }])
      .select()
    if (error) throw error
    fetchPayments()
    return data
  }

  const updatePaymentStatus = async (paymentid, status) => {
    const { error } = await supabase
      .from('payment')
      .update({ paymentstatus: status })
      .eq('paymentid', paymentid)
    if (error) throw error
    fetchPayments()
  }

  return { payments, loading, error, addPayment, updatePaymentStatus, fetchPayments }
}

// PHASE 9: Dashboard statistics - Count queries
export async function getDashboardStats() {
  try {
    const [productsRes, ordersRes, inventoryRes] = await Promise.all([
      supabase.from('product').select('*', { count: 'exact', head: true }),
      supabase.from('orders').select('*', { count: 'exact', head: true }),
      supabase.from('inventory').select('*', { count: 'exact', head: true })
    ])

    return {
      totalProducts: productsRes.count || 0,
      totalOrders: ordersRes.count || 0,
      totalInventory: inventoryRes.count || 0,
      error: null
    }
  } catch (err) {
    return {
      totalProducts: 0,
      totalOrders: 0,
      totalInventory: 0,
      error: err.message
    }
  }
}

// PHASE 9A: Chart data - Orders per day
export async function getOrdersPerDay() {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('orderdate, totalamount')
      .order('orderdate', { ascending: true })
    
    if (error) throw error

    // Group orders by date
    const grouped = {}
    data.forEach(order => {
      const date = new Date(order.orderdate).toLocaleDateString('en-IN')
      if (!grouped[date]) grouped[date] = 0
      grouped[date]++
    })

    return Object.entries(grouped).map(([date, count]) => ({
      date,
      orders: count
    }))
  } catch (err) {
    return []
  }
}

// PHASE 9B: Chart data - Inventory levels
export async function getInventoryLevels() {
  try {
    const { data, error } = await supabase
      .from('inventory')
      .select(`
        product(productname),
        availablequantity
      `)
      .order('availablequantity', { ascending: false })
      .limit(10)
    
    if (error) throw error

    return data.map(item => ({
      name: item.product?.productname || 'Unknown',
      stock: item.availablequantity
    }))
  } catch (err) {
    return []
  }
}

// PHASE 9C: Chart data - Payment summary
export async function getPaymentSummary() {
  try {
    const { data, error } = await supabase
      .from('payment')
      .select('paymentstatus, amount')
    
    if (error) throw error

    const summary = {
      Completed: { value: 0, color: '#10b981' },
      Pending: { value: 0, color: '#f59e0b' },
      Failed: { value: 0, color: '#ef4444' }
    }

    data.forEach(payment => {
      const status = payment.paymentstatus || 'Pending'
      if (summary[status]) {
        summary[status].value += payment.amount || 0
      }
    })

    return Object.entries(summary).map(([name, { value, color }]) => ({
      name,
      value: Math.round(value),
      fill: color
    }))
  } catch (err) {
    return []
  }
}

// PHASE 10: useMicroUnits - Fetch and manage micro unit records
export function useMicroUnits() {
  const [microUnits, setMicroUnits] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchMicroUnits()
  }, [])

  const fetchMicroUnits = async () => {
    try {
      setLoading(true)
      // Try with batch join first, fall back to simple select
      let result = await supabase
        .from('microunit')
        .select('*, batch(batchid, quantity, productiondate, expirydate, qualitystatus, product(productname))')
      if (result.error) {
        result = await supabase.from('microunit').select('*')
      }
      if (result.error) throw result.error
      setMicroUnits(result.data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const addMicroUnit = async (unit) => {
    const { data, error } = await supabase
      .from('microunit')
      .insert([unit])
      .select()
    if (error) throw error
    fetchMicroUnits()
    return data
  }

  const updateMicroUnit = async (unitid, unit) => {
    const { data, error } = await supabase
      .from('microunit')
      .update(unit)
      .eq('unitid', unitid)
      .select()
    if (error) throw error
    fetchMicroUnits()
    return data
  }

  const deleteMicroUnit = async (unitid) => {
    const { error } = await supabase
      .from('microunit')
      .delete()
      .eq('unitid', unitid)
    if (error) throw error
    setMicroUnits(microUnits.filter(u => u.unitid !== unitid))
  }

  return { microUnits, loading, error, addMicroUnit, updateMicroUnit, deleteMicroUnit, fetchMicroUnits }
}
