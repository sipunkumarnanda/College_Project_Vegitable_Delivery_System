
'use client'
import { ArrowRight, StarIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"

const ProductDescription = ({ product }) => {

    const [selectedTab, setSelectedTab] = useState('Details')

    if (!product) return null;

    const formatDate = (dateString) => {
        try {
            return new Date(dateString).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            })
        } catch {
            return dateString
        }
    }

    return (
        <div className="my-18 text-sm text-slate-600">

            {/* Tabs */}
            <div className="flex border-b border-slate-200 mb-6 max-w-2xl">
                {['Details', 'Reviews'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setSelectedTab(tab)}
                        className={`${tab === selectedTab ? 'border-b font-semibold text-slate-800' : 'text-slate-400'} px-3 py-2`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* DETAILS */}
            {selectedTab === "Details" && (
                <div className="max-w-xl space-y-4">

                    <p>{product.description}</p>

                    <div className="mt-4 text-sm text-slate-500 space-y-1">
                        {product.packedAt && <p>Packed: {formatDate(product.packedAt)}</p>}
                        {product.harvestDate && <p>Harvested: {formatDate(product.harvestDate)}</p>}
                        {product.origin && <p>Source: {product.origin}</p>}
                        {product.unit && <p>Package: {product.unit}</p>}
                    </div>
                </div>
            )}

            {/* REVIEWS */}
            {selectedTab === "Reviews" && (
                <div className="mt-6">
                    {product.rating?.length > 0 ? (
                        product.rating.map((item, index) => (
                            <div key={index} className="flex gap-5 mb-4">

                                <Image
                                    src={item?.user?.image || "/avatar.png"}
                                    alt="user"
                                    width={50}
                                    height={50}
                                    className="rounded-full"
                                />

                                <div>
                                    <p>{item?.user?.name}</p>
                                    <p>{item.review}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p>No reviews yet</p>
                    )}
                </div>
            )}

            {/* STORE */}
            {product.store && (
                <div className="flex gap-3 mt-10 items-center">

                    <Image
                        src={product.store.logo || "/store.png"}
                        alt="store"
                        width={60}
                        height={60}
                        className="rounded-full"
                    />

                    <div>
                        <p>Sold by {product.store.name}</p>

                        <Link href={`/shop/${product.store.username}`}>
                            View Store <ArrowRight size={14} />
                        </Link>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ProductDescription