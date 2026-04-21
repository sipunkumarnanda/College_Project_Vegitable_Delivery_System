
'use client'

import { useEffect, useState } from "react"
import Loading from "@/components/Loading"
import api from "@/lib/api"

export default function StoreOrders() {

  const [orders, setOrders] = useState([])
  const [filteredOrders, setFilteredOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const today = new Date().toISOString().split("T")[0]

  // ✅ Date filter state
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")

  const fetchOrders = async () => {
    try {
      const res = await api.get("/vendor/orders")
      if (res.data.success) {
        setOrders(res.data.data)
        setFilteredOrders(res.data.data) // ✅ initial
      }
    } catch (error) {
      console.error("Orders error:", error.response?.data || error.message)
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId, status) => {
    try {
      await api.put(`/vendor/orders/${orderId}/status`, { status })
      fetchOrders()
    } catch (error) {
      console.error("Update status error:", error)
    }
  }

  const openModal = (order) => {
    setSelectedOrder(order)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setSelectedOrder(null)
    setIsModalOpen(false)
  }

  // ✅ Filter logic
  const handleFilter = () => {
  if (!fromDate || !toDate) return;

  if (fromDate > toDate) {
    alert("From date cannot be greater than To date");
    return;
  }

  const from = new Date(fromDate);
  const to = new Date(toDate);
  to.setHours(23, 59, 59, 999);

  const result = orders.filter(order => {
    const orderDate = new Date(order.createdAt);
    return orderDate >= from && orderDate <= to;
  });

  setFilteredOrders(result);
};

  const handleReset = () => {
    setFilteredOrders(orders)
    setFromDate("")
    setToDate("")
  }

  const handlePrintInvoice = async (orderId) => {
    try {
      const res = await api.get(`/vendor/orders/${orderId}/invoice`, {
        responseType: "blob",
      })

      const file = new Blob([res.data], { type: "application/pdf" })
      const fileURL = URL.createObjectURL(file)

      const newWindow = window.open(fileURL)
      newWindow.onload = () => newWindow.print()

    } catch (error) {
      console.error("Invoice error:", error)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  if (loading) return <Loading />

  return (
    <div className="p-2 sm:p-4">

      <h1 className="text-xl sm:text-2xl text-slate-500 mb-4">
        Store <span className="text-slate-800 font-medium">Orders</span>
      </h1>

      {/* ✅ DATE FILTER */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4 items-start sm:items-center">

        <div className="flex gap-2 items-center">
          <label className="text-sm">From:</label>
          <input
            type="date"
            value={fromDate}
            max={today}
            onChange={(e) => setFromDate(e.target.value)}
            className="border px-2 py-1 rounded text-sm"
          />
        </div>

        <div className="flex gap-2 items-center">
          <label className="text-sm">To:</label>
          <input
            type="date"
            value={toDate}
              max={today}   
            onChange={(e) => setToDate(e.target.value)}
            className="border px-2 py-1 rounded text-sm"
          />
        </div>

        <button
          onClick={handleFilter}
          className="bg-green-600 text-white px-4 py-1 rounded text-sm"
        >
          Filter
        </button>

        <button
          onClick={handleReset}
          className="bg-gray-200 px-4 py-1 rounded text-sm"
        >
          Reset
        </button>

      </div>

      {filteredOrders.length === 0 ? (
        <p>No orders found</p>
      ) : (
        <>
          {/* ================= DESKTOP TABLE ================= */}
          <div className="hidden md:block overflow-x-auto rounded-md shadow border">
            <table className="w-full text-sm text-left text-gray-600">
              <thead className="bg-gray-50 text-xs uppercase">
                <tr>
                  <th className="px-4 py-3">Sr.</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredOrders.map((order, index) => (
                  <tr key={order._id} className="border-t hover:bg-gray-50">

                    <td className="px-4 py-3">{index + 1}</td>

                    <td className="px-4 py-3">
                      {order.user?.name || "Customer"}
                    </td>

                    <td className="px-4 py-3 font-medium">
                      ₹{order.totalPrice?.amount}
                    </td>

                    <td className="px-4 py-3">
                      <select
                        value={order.status}
                        onChange={(e) =>
                          updateOrderStatus(order._id, e.target.value)
                        }
                        className="border rounded px-2 py-1"
                      >
                        <option>PENDING</option>
                        <option>CONFIRMED</option>
                        <option>SHIPPED</option>
                        <option>DELIVERED</option>
                        <option>CANCELLED</option>
                      </select>
                    </td>

                    <td className="px-4 py-3 text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>

                    <td className="px-4 py-3">
                      <button
                        onClick={() => openModal(order)}
                        className="bg-slate-100 px-3 py-1 rounded"
                      >
                        View
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ================= MOBILE ================= */}
          <div className="md:hidden space-y-4">

            {filteredOrders.map((order) => (
              <div key={order._id} className="border rounded-lg p-4 shadow-sm">

                <div className="flex justify-between">
                  <p className="font-medium">
                    {order.user?.name || "Customer"}
                  </p>
                  <p className="text-sm text-gray-500">
                    ₹{order.totalPrice?.amount}
                  </p>
                </div>

                <p className="text-xs text-gray-400 mt-1">
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>

                <div className="flex justify-between items-center mt-3">
                  <select
                    value={order.status}
                    onChange={(e) =>
                      updateOrderStatus(order._id, e.target.value)
                    }
                    className="border rounded px-2 py-1 text-xs"
                  >
                    <option>PENDING</option>
                    <option>CONFIRMED</option>
                    <option>SHIPPED</option>
                    <option>DELIVERED</option>
                    <option>CANCELLED</option>
                  </select>

                  <button
                    onClick={() => openModal(order)}
                    className="bg-slate-100 px-2 py-1 rounded text-sm"
                  >
                    Details
                  </button>
                </div>

              </div>
            ))}

          </div>
        </>
      )}

      {/* ================= MODAL ================= */}
      {isModalOpen && selectedOrder && (
        <div onClick={closeModal} className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-2xl mx-4">

            <h2 className="text-lg sm:text-xl font-semibold mb-4 text-center">
              Order Details
            </h2>

            <div className="text-sm space-y-1 mb-4">
              <p><b>Order ID:</b> {selectedOrder._id}</p>
              <p><b>Status:</b> {selectedOrder.status}</p>
              <p><b>Date:</b> {new Date(selectedOrder.createdAt).toLocaleString()}</p>
              <p><b>Payment:</b> {selectedOrder.paymentMethod || "COD"}</p>
            </div>

            <div className="text-sm space-y-1 mb-4">
              <p><b>Name:</b> {selectedOrder.user?.name}</p>
              <p><b>Phone:</b> {selectedOrder.shippingAddress?.phone}</p>
            </div>

            <div className="text-sm mb-4">
              <p><b>Address:</b></p>
              <p>{selectedOrder.shippingAddress?.street}, {selectedOrder.shippingAddress?.city}</p>
            </div>

            <div className="mb-4">
              <h3 className="font-semibold mb-2">Products</h3>

              {selectedOrder.items?.map((item, i) => (
                <div key={i} className="border p-2 rounded mb-2 text-sm">
                  <p className="font-medium">{item.productName}</p>
                  <p>Qty: {item.quantity}</p>
                  <p>₹{item.price.amount}</p>
                </div>
              ))}
            </div>

            <div className="text-right font-semibold mb-4">
              Total: ₹{selectedOrder.totalPrice?.amount}
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => handlePrintInvoice(selectedOrder._id)}
                className="px-3 py-2 bg-green-600 text-white rounded text-sm"
              >
                Print
              </button>

              <button
                onClick={closeModal}
                className="px-3 py-2 bg-gray-200 rounded text-sm"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}