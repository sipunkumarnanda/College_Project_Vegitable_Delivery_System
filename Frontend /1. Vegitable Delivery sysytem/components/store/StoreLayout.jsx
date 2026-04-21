
'use client'

import { useEffect, useState } from "react"
import Loading from "../Loading"
import Link from "next/link"
import { ArrowRightIcon, Menu } from "lucide-react"
import SellerNavbar from "./StoreNavbar"
import SellerSidebar from "./StoreSidebar"
import { dummyStoreData } from "@/assets/assets"

const StoreLayout = ({ children }) => {

  const [isSeller, setIsSeller] = useState(false)
  const [loading, setLoading] = useState(true)
  const [storeInfo, setStoreInfo] = useState(null)

  // ✅ sidebar toggle
  const [openSidebar, setOpenSidebar] = useState(false)

  const fetchIsSeller = async () => {
    setIsSeller(true)
    setStoreInfo(dummyStoreData)
    setLoading(false)
  }

  useEffect(() => {
    fetchIsSeller()
  }, [])

  if (loading) return <Loading />

  if (!isSeller) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
        <h1 className="text-2xl sm:text-4xl font-semibold text-slate-400">
          You are not authorized to access this page
        </h1>
        <Link href="/" className="bg-slate-700 text-white flex items-center gap-2 mt-8 p-2 px-6 rounded-full">
          Go to home <ArrowRightIcon size={18} />
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen">

      {/* 🔹 Navbar */}
      <SellerNavbar />

      {/* 🔥 MOBILE HEADER (hamburger on RIGHT) */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 border-b bg-white">
        <p className="font-medium text-slate-700">Store</p>

        <button onClick={() => setOpenSidebar(true)}>
          <Menu size={24} />
        </button>
      </div>

      <div className="flex flex-1 h-full relative">

        {/* 🔥 SIDEBAR */}
        <div
          className={`
            fixed md:static top-0 right-0 h-full w-64 bg-white border-l md:border-r z-50
            transform ${openSidebar ? "translate-x-0" : "translate-x-full md:translate-x-0"}
            transition-transform duration-300
          `}
        >
          <SellerSidebar storeInfo={storeInfo} />
        </div>

        {/* 🔥 OVERLAY */}
        {openSidebar && (
          <div
            onClick={() => setOpenSidebar(false)}
            className="fixed inset-0 bg-black/40 md:hidden z-40"
          />
        )}

        {/* 🔹 MAIN CONTENT */}
        <div className="flex-1 h-full p-4 sm:p-5 lg:pl-12 lg:pt-12 overflow-y-auto">
          {children}
        </div>

      </div>
    </div>
  )
}

export default StoreLayout