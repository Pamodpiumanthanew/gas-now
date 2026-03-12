"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Flame, Droplet, MapPin, Clock, Phone, MessageCircle, Star } from "lucide-react";

type Shop = {
  id: string;
  name: string;
  address: string;
  phone: string;
  whatsapp: string | null;
  isOpen: boolean;
  openTime: string | null;
  closeTime: string | null;
  stocks: any[];
  reviews: any[];
};

export default function ShopList({ brand }: { brand: "LAUGFS" | "LITRO" }) {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);

  const themeConfig = {
    LAUGFS: {
      color: "yellow",
      bgClass: "bg-yellow-50",
      textClass: "text-yellow-800",
      borderClass: "border-yellow-400",
      buttonClass: "bg-yellow-400 hover:bg-yellow-500 text-black",
      icon: <Flame className="h-6 w-6 text-yellow-600" />,
      headerBg: "bg-black",
      headerText: "text-yellow-400"
    },
    LITRO: {
      color: "blue",
      bgClass: "bg-blue-50",
      textClass: "text-blue-800",
      borderClass: "border-blue-400",
      buttonClass: "bg-blue-600 hover:bg-blue-700 text-white",
      icon: <Droplet className="h-6 w-6 text-blue-500" />,
      headerBg: "bg-blue-600",
      headerText: "text-white"
    }
  };

  const theme = themeConfig[brand];

  useEffect(() => {
    fetch(`/api/shops/brand/${brand.toLowerCase()}`)
      .then((res) => res.json())
      .then((data) => {
        setShops(data);
        setLoading(false);
      });
  }, [brand]);

  return (
    <div className={`min-h-screen ${theme.bgClass}`}>
      {/* Brand Header */}
      <div className={`${theme.headerBg} py-8 px-4 sm:px-6 lg:px-8 shadow-md`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
             <div className="bg-white p-2 rounded-full">
                {theme.icon}
             </div>
             <h1 className={`text-3xl font-extrabold tracking-tight ${theme.headerText}`}>
               {brand} GAS
             </h1>
          </div>
          <Link href="/" className="text-white hover:underline font-medium">
             &larr; Back to Home
          </Link>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className={`text-2xl font-bold mb-8 ${theme.textClass}`}>
          Available Shops Nearby
        </h2>

        {loading ? (
          <div className="animate-pulse flex space-x-4">
            <div className="flex-1 space-y-4 py-1">
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-300 rounded"></div>
                <div className="h-4 bg-gray-300 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        ) : shops.length === 0 ? (
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 text-center">
            <p className="text-gray-500 text-lg">No approved shops available for this brand currently.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {shops.map((shop) => {
               // Calculate average rating
               const avgRating = shop.reviews.length > 0 
                  ? shop.reviews.reduce((acc, rev) => acc + rev.rating, 0) / shop.reviews.length
                  : 0;
               
               return (
                <div key={shop.id} className={`bg-white rounded-xl shadow-md border-t-4 ${theme.borderClass} overflow-hidden hover:shadow-lg transition-shadow`}>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{shop.name}</h3>
                        <div className="flex items-center mt-1 text-sm text-gray-500">
                          <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                          <span>{avgRating ? avgRating.toFixed(1) : "New"}</span>
                          <span className="mx-1">•</span>
                          <span>{shop.reviews.length} reviews</span>
                        </div>
                      </div>
                      <div>
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                          shop.isOpen ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {shop.isOpen ? 'OPEN NOW' : 'CLOSED'}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3 mb-6">
                      <div className="flex items-start text-sm text-gray-600">
                        <MapPin className="h-5 w-5 mr-2 text-gray-400 shrink-0" />
                        <span>{shop.address}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="h-5 w-5 mr-2 text-gray-400 shrink-0" />
                        <span>{shop.phone}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="h-5 w-5 mr-2 text-gray-400 shrink-0" />
                        <span>
                           {shop.openTime && shop.closeTime 
                              ? `${shop.openTime} - ${shop.closeTime}`
                              : "Hours not set"}
                        </span>
                      </div>
                    </div>

                    {/* Stock Display */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-100">
                      <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">Available Cylinders & Prices</h4>
                      <div className="grid grid-cols-1 gap-2">
                        {shop.stocks.map((stock) => (
                           <div key={stock.id} className="flex justify-between items-center text-sm">
                             <span className="font-medium text-gray-900">{stock.gasItem.weight}</span>
                             <div className="flex items-center">
                                <span className="text-gray-600 mr-3">Rs. {stock.gasItem.price.toFixed(2)}</span>
                                <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                                  stock.quantity > 0 ? 'bg-green-100 text-green-700' : 'bg-red-50 text-red-500'
                                }`}>
                                   {stock.quantity > 0 ? `${stock.quantity} In Stock` : 'Out of Stock'}
                                </span>
                             </div>
                           </div>
                        ))}
                        {shop.stocks.length === 0 && (
                          <span className="text-sm text-gray-500">No stock data available</span>
                        )}
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex justify-between items-center">
                       {shop.whatsapp && (
                          <a 
                            href={`https://wa.me/${shop.whatsapp}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center text-sm font-medium text-[#25D366] hover:text-[#128C7E]"
                          >
                             <MessageCircle className="h-5 w-5 mr-1" />
                             Chat on WhatsApp
                          </a>
                       )}
                       <Link 
                          href={`/shops/${shop.id}?brand=${brand}`}
                          className={`px-4 py-2 rounded-md font-bold transition-colors ${theme.buttonClass}`}
                       >
                          View & Buy
                       </Link>
                    </div>
                  </div>
                </div>
               )
            })}
          </div>
        )}
      </main>
    </div>
  );
}
