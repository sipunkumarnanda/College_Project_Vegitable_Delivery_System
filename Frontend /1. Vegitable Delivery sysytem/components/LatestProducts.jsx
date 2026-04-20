
'use client'

import React, { useEffect } from 'react'
import Title from './Title'
import ProductCard from './ProductCard'
import { useSelector, useDispatch } from 'react-redux'
import { fetchProducts } from '@/lib/features/product/productSlice'

const LatestProducts = () => {

const dispatch = useDispatch()
const displayQuantity = 4

const { items: products = [], loading, error } = useSelector(
(state) => state.product || {}
)

useEffect(() => {
if (!products.length) {
dispatch(fetchProducts())
}
}, [dispatch])

const sortedProducts = products
?.slice()
?.sort((a, b) => {
return new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0)
})
?.slice(0, displayQuantity)

return ( <div className="px-6 my-24 max-w-7xl mx-auto">

  <Title
    title="Freshly Arrived Vegetables"
    description={`Showing ${
      products.length < displayQuantity
        ? products.length
        : displayQuantity
    } of ${products.length} fresh items`}
    href="/shop"
  />

  {loading && <p className="mt-6 text-gray-500">Loading...</p>}
  {error && <p className="mt-6 text-red-500">Error: {error}</p>}

  {/* ✅ FIXED GRID */}
  <div className="mt-12 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
    {sortedProducts?.length > 0 ? (
      sortedProducts.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))
    ) : (
      !loading && <p>No products available</p>
    )}
  </div>

</div>

)
}

export default LatestProducts
