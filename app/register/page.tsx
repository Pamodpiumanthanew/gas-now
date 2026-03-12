"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Flame } from "lucide-react";

export default function RegisterPage() {
  const [role, setRole] = useState<"BUYER" | "SELLER" | null>(null);
  const [adminWhatsapp, setAdminWhatsapp] = useState("");

  const router = useRouter();

  useEffect(() => {
    // Fetch admin whatsapp setting
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.adminWhatsapp) {
          setAdminWhatsapp(data.adminWhatsapp);
        }
      });
  }, []);

  if (!role) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
          <div className="mx-auto flex justify-center items-center mt-2 mb-4">
            <img src="/logoo.jpeg" alt="Gas Now Logo" className="h-16 w-auto" />
          </div>
          <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-blue-600 mb-8">
            Join Gas Now
          </h2>
          <div className="grid grid-cols-1 gap-4">
            <button
              onClick={() => setRole("BUYER")}
              className="py-4 px-6 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              I am a Buyer
            </button>
            <button
              onClick={() => setRole("SELLER")}
              className="py-4 px-6 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
              I am a Seller
            </button>
          </div>
          <div className="mt-8">
            <Link
              href="/login"
              className="font-medium text-gray-600 hover:text-gray-900"
            >
              Already have an account? Sign in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => setRole(null)}
            className="text-sm font-medium text-gray-500 hover:text-gray-700"
          >
            &larr; Back
          </button>
          <div className="flex items-center space-x-2">
            <Flame className="h-6 w-6 text-orange-600" />
            <h2 className="text-xl font-bold text-gray-900">
              {role === "BUYER" ? "Buyer Registration" : "Seller Registration"}
            </h2>
          </div>
        </div>

        {role === "SELLER" ? (
          <SellerRegistrationForm adminWhatsapp={adminWhatsapp} />
        ) : (
          <BuyerRegistrationForm />
        )}
      </div>
    </div>
  );
}

function BuyerRegistrationForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    name: "",
    address: "",
    email: "",
    phone: "",
  });
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/register/buyer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Registration failed");
      }

      router.push("/login?registered=true");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white py-8 px-6 shadow rounded-lg text-black">
      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded text-sm">{error}</div>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-700">Username</label>
        <input
          type="text"
          required
          value={formData.username}
          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Password</label>
        <input
          type="password"
          required
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Name</label>
        <input
          type="text"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Phone Number</label>
        <input
          type="text"
          required
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Email Address (Optional)</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Address</label>
        <textarea
          required
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>
      <button
        type="submit"
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
      >
        Register Buyer Account
      </button>
    </form>
  );
}

function SellerRegistrationForm({ adminWhatsapp }: { adminWhatsapp: string }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    shopName: "",
    phone: "",
    address: "",
    brands: "BOTH", // LAUGFS, LITRO, BOTH
    cylinders: [] as string[],
  });
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (formData.cylinders.length === 0) {
        throw new Error("Please select at least one gas cylinder type");
      }

      const res = await fetch("/api/register/seller", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Registration failed");
      }

      // Redirect to WhatsApp assuming payment
      if (adminWhatsapp) {
        window.location.href = `https://wa.me/${adminWhatsapp}?text=Hi Admin, I have registered a new seller account for '${formData.shopName}'. Please accept my request after payment processing.`;
      } else {
        router.push("/login?pending=true");
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const toggleCylinder = (weight: string) => {
    setFormData((prev) => ({
      ...prev,
      cylinders: prev.cylinders.includes(weight)
        ? prev.cylinders.filter((c) => c !== weight)
        : [...prev.cylinders, weight],
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white py-8 px-6 shadow rounded-lg mb-10 text-black">
      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded text-sm">{error}</div>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-700">Username</label>
        <input
          type="text"
          required
          value={formData.username}
          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Password</label>
        <input
          type="password"
          required
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>
      <hr />
      <div>
        <label className="block text-sm font-medium text-gray-700">Shop Name</label>
        <input
          type="text"
          required
          value={formData.shopName}
          onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Phone Number</label>
        <input
          type="text"
          required
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Shop Address</label>
        <textarea
          required
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Brands Available</label>
        <select
          value={formData.brands}
          onChange={(e) => setFormData({ ...formData, brands: e.target.value })}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="BOTH">Both (Laugfs & Litro)</option>
          <option value="LAUGFS">Laugfs Only</option>
          <option value="LITRO">Litro Only</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Available Cylinder Types (Select one or more)</label>
        <div className="space-y-2">
          {["12.5kg", "5kg", "2.3kg"].map((weight) => (
            <label key={weight} className="inline-flex items-center mr-4">
              <input
                type="checkbox"
                checked={formData.cylinders.includes(weight)}
                onChange={() => toggleCylinder(weight)}
                className="rounded border-gray-300 text-orange-600 shadow-sm focus:border-orange-300 focus:ring focus:ring-offset-0 focus:ring-orange-200 focus:ring-opacity-50"
              />
              <span className="ml-2 text-gray-700">{weight}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="pt-4">
        <p className="text-sm text-gray-500 mb-4 text-center">
          After registering, you will be redirected to WhatsApp to contact the Admin for payment and verification.
        </p>
        <button
          type="submit"
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#25D366] hover:bg-[#128C7E]"
        >
          Register & Contact Admin on WhatsApp
        </button>
      </div>
    </form>
  );
}
