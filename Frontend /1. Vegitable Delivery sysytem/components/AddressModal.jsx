
'use client';

import { XIcon } from "lucide-react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import api from "@/lib/api";
import { useDispatch } from "react-redux";
import { setAddresses } from "@/lib/features/address/addressSlice";

const AddressModal = ({ setShowAddressModal, editData, editIndex }) => {

  const dispatch = useDispatch();
  const isEdit = !!editData;

  const [address, setAddress] = useState({
    fullName: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    country: '',
    landmark: ''
  });

  // ✅ Prefill for edit
  useEffect(() => {
    if (editData) {
      setAddress(editData);
    }
  }, [editData]);

  const handleChange = (e) => {
    setAddress({
      ...address,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let res;

      if (isEdit) {
        res = await api.put(`/address/${editIndex}`, address);
        toast.success("Address updated");
      } else {
        res = await api.post("/address", address);
        toast.success("Address added");
      }

      dispatch(setAddresses(res.data.data));
      setShowAddressModal(false);

    } catch (err) {
      toast.error("Something went wrong");
    }
  };

  return (
    <form
  onSubmit={handleSubmit}
  className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
  onClick={() => setShowAddressModal(false)} // 👈 outside click closes
>

  {/* 🛑 STOP CLICK INSIDE */}
  <div
    className="bg-white p-6 rounded w-full max-w-md space-y-3"
    onClick={(e) => e.stopPropagation()} // 👈 prevent closing
  >

    <h2 className="text-lg font-semibold">
      {isEdit ? "Update Address" : "Add Address"}
    </h2>

    <input name="fullName" value={address.fullName} onChange={handleChange} placeholder="Full Name" className="border p-2 w-full" required />
    <input name="phone" value={address.phone} onChange={handleChange} placeholder="Phone" className="border p-2 w-full" required />
    <input name="street" value={address.street} onChange={handleChange} placeholder="Street" className="border p-2 w-full" required />

    <div className="flex gap-2">
      <input name="city" value={address.city} onChange={handleChange} placeholder="City" className="border p-2 w-full" required />
      <input name="state" value={address.state} onChange={handleChange} placeholder="State" className="border p-2 w-full" required />
    </div>

    <div className="flex gap-2">
      <input name="zip" value={address.zip} onChange={handleChange} placeholder="Zip" className="border p-2 w-full" required />
      <input name="country" value={address.country} onChange={handleChange} placeholder="Country" className="border p-2 w-full" required />
    </div>

    <input name="landmark" value={address.landmark} onChange={handleChange} placeholder="Landmark" className="border p-2 w-full" />

    <button className="bg-green-600 text-white w-full py-2 rounded">
      {isEdit ? "Update Address" : "Save Address"}
    </button>

  </div>

  {/* ❌ CLOSE ICON */}
  <XIcon
    size={28}
    className="absolute top-5 right-5 cursor-pointer"
    onClick={() => setShowAddressModal(false)}
  />
</form>
  );
};

export default AddressModal;