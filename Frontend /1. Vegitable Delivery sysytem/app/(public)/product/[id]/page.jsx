
'use client'

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ProductDetails from "@/components/ProductDetails";
import api from "@/lib/api";
import toast from "react-hot-toast"; // ✅ ADD

const ProductPage = () => {

  const params = useParams();
  const id = params?.id;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    if (!id) return;

    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${id}`);

        const data = res.data?.data || null;

        if (!data) {
          toast.error("Product not found"); // ❌ toast
        }

        setProduct(data);

      } catch (err) {
        console.error(err);

        toast.error("Failed to load product"); // ❌ toast

        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();

  }, [id]);

  if (!id) return <p>Waiting for product...</p>;

  if (loading) {
    return (
      <div className="p-6">
        <p>Loading product...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-6">
        <p className="text-red-500">Product not found</p>
      </div>
    );
  }

  return <ProductDetails product={product} />;
};

export default ProductPage;