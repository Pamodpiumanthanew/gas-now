"use client";

import Link from "next/link";
import { Flame, Droplet } from "lucide-react";
import { useSession, signOut } from "next-auth/react";

export default function HomePage() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Navbar segment */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-3">
               <img src="/logoo.jpeg" alt="Gas Now Logo" className="h-10 w-auto rounded-md" />
               <h1 className="text-2xl font-bold tracking-tight">Gas Now</h1>
            </div>
            </div>
            <div className="flex items-center space-x-4">
              {session?.user ? (
                <>
                  <span className="text-gray-600 font-medium">Hi, {session.user.name || (session.user as any).username}</span>
                  {(session.user as any).role === "ADMIN" && (
                    <Link href="/admin" className="text-blue-600 hover:underline">Admin Dashboard</Link>
                  )}
                  {(session.user as any).role === "SELLER" && (
                     <Link href="/seller" className="text-orange-600 hover:underline">Seller Dashboard</Link>
                  )}
                  <Link href="/profile" className="text-gray-600 hover:text-gray-900 font-medium">
                    Profile
                  </Link>
                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="ml-4 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-gray-600 hover:text-gray-900 font-medium"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/register"
                    className="ml-4 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 shadow-sm"
                  >
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl mb-4">
            Find and Buy LP Gas <span className="text-orange-600">Instantly</span>
          </h1>
          <p className="max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Choose your preferred brand to find available cylinders and shops nearby.
          </p>
        </div>

        {/* Brand Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          
          {/* Laugfs Card */}
          <Link href={session ? "/brands/laugfs" : "/login?redirect=/brands/laugfs"} className="group">
            <div className="relative rounded-2xl border-4 border-transparent hover:border-yellow-400 bg-black overflow-hidden shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="absolute inset-0 opacity-20 bg-gradient-to-br from-yellow-400 to-transparent"></div>
              <div className="p-10 flex flex-col items-center justify-center min-h-[300px] relative z-10 text-center">
                 <div className="bg-yellow-400 p-4 rounded-full mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Flame className="h-16 w-16 text-black" />
                 </div>
                 <h2 className="text-4xl font-black text-yellow-400 tracking-wider">LAUGFS GAS</h2>
                 <p className="mt-4 text-gray-300 font-medium">Explore yellow cylinders and authorized dealers</p>
                 
                 <div className="mt-8 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-black bg-yellow-400 hover:bg-yellow-300">
                    View Laugfs Shops &rarr;
                 </div>
              </div>
            </div>
          </Link>

          {/* Litro Card */}
          <Link href={session ? "/brands/litro" : "/login?redirect=/brands/litro"} className="group">
            <div className="relative rounded-2xl border-4 border-transparent hover:border-blue-400 bg-white overflow-hidden shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-blue-600 to-transparent"></div>
              <div className="p-10 flex flex-col items-center justify-center min-h-[300px] relative z-10 text-center">
                 <div className="bg-blue-600 p-4 rounded-full mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Droplet className="h-16 w-16 text-white" />
                 </div>
                 <h2 className="text-4xl font-black text-blue-800 tracking-wider">LITRO GAS</h2>
                 <p className="mt-4 text-gray-600 font-medium">Explore blue cylinders and authorized dealers</p>
                 
                 <div className="mt-8 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                    View Litro Shops &rarr;
                 </div>
              </div>
            </div>
          </Link>

        </div>
      </main>
    </div>
  );
}
