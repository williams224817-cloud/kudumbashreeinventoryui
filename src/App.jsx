import { BrowserRouter, Routes, Route } from "react-router-dom"
import DashboardLayout from "./layout/DashboardLayout"

import Home from "./pages/Home"
import Dashboard from "./pages/Dashboard"
import Products from "./pages/Products"
import Orders from "./pages/Orders"
import OrderDetails from "./pages/OrderDetails"
import Inventory from "./pages/Inventory"
import Transport from "./pages/Transport"
import Payments from "./pages/Payments"
import MicroUnits from "./pages/MicroUnits"
import MicroUnitDetails from "./pages/MicroUnitDetails"
import ActivityLog from "./pages/ActivityLog"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<DashboardLayout><Dashboard /></DashboardLayout>} />
        <Route path="/products" element={<DashboardLayout><Products /></DashboardLayout>} />
        <Route path="/inventory" element={<DashboardLayout><Inventory /></DashboardLayout>} />
        <Route path="/orders" element={<DashboardLayout><Orders /></DashboardLayout>} />
        <Route path="/orders/:orderId" element={<DashboardLayout><OrderDetails /></DashboardLayout>} />
        <Route path="/transport" element={<DashboardLayout><Transport /></DashboardLayout>} />
        <Route path="/payments" element={<DashboardLayout><Payments /></DashboardLayout>} />
        <Route path="/micro-units" element={<DashboardLayout><MicroUnits /></DashboardLayout>} />
        <Route path="/micro-units/:unitId" element={<DashboardLayout><MicroUnitDetails /></DashboardLayout>} />
        <Route path="/activity-log" element={<DashboardLayout><ActivityLog /></DashboardLayout>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
