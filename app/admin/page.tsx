"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { CheckCircle, XCircle, Settings, Users, Store, Loader2, MessageSquare, Trash2, Star } from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState("requests"); // "requests", "users", "settings"
  
  const [requests, setRequests] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [adminWhatsapp, setAdminWhatsapp] = useState("");
  const [savingSettings, setSavingSettings] = useState(false);

  // Message Modal State
  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const [messageTarget, setMessageTarget] = useState<any>(null);
  const [messageContent, setMessageContent] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated" || (session?.user as any)?.role !== "ADMIN") {
      router.push("/");
      return;
    }

    if (status === "authenticated") {
      Promise.all([
         fetch("/api/admin/requests").then(res => res.json()),
         fetch("/api/admin/users").then(res => res.json()),
         fetch("/api/settings").then(res => res.json())
      ]).then(([requestsData, usersData, settingsData]) => {
         setRequests(Array.isArray(requestsData) ? requestsData : []);
         setAllUsers(Array.isArray(usersData) ? usersData : []);
         if (settingsData?.adminWhatsapp) setAdminWhatsapp(settingsData.adminWhatsapp);
         setLoading(false);
      });
    }
  }, [status, session, router]);

  const handleRequest = async (shopId: string, newStatus: "APPROVED" | "REJECTED") => {
    try {
      const res = await fetch("/api/admin/requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shopId, status: newStatus })
      });
      if (res.ok) {
        setRequests(requests.filter(req => req.id !== shopId));
        // Refresh users list if approved
        fetch("/api/admin/users").then(res => res.json()).then(data => setAllUsers(data));
      }
    } catch (error) {
      alert("Failed to update status");
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to completely delete this user and all their data? This action cannot be undone.")) return;
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
      if (res.ok) {
        setAllUsers(allUsers.filter(u => u.id !== userId));
      } else {
         const data = await res.json();
         alert(data.error || "Failed to delete user");
      }
    } catch (error) {
      alert("Failed to delete user");
    }
  };

  const sendMessage = async () => {
     if (!messageContent.trim()) return;
     setSendingMessage(true);
     try {
        const res = await fetch(`/api/admin/users/${messageTarget.id}`, {
           method: "POST",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify({ content: messageContent })
        });
        if (res.ok) {
           alert("Message sent successfully!");
           setMessageModalOpen(false);
           setMessageContent("");
        } else {
           alert("Failed to send message");
        }
     } catch (e) {
        alert("Failed to send message");
     } finally {
        setSendingMessage(false);
     }
  };

  const saveSettings = async () => {
     setSavingSettings(true);
     try {
        await fetch("/api/admin/settings", {
           method: "POST",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify({ adminWhatsapp })
        });
        alert("Settings saved successfully!");
     } catch (error) {
        alert("Failed to save settings");
     } finally {
        setSavingSettings(false);
     }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin h-12 w-12 text-blue-600" /></div>;

  return (
    <div className="min-h-screen bg-gray-100 font-sans pb-20">
      <nav className="bg-blue-900 shadow text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-3">
              <img src="/logoo.jpeg" alt="Gas Now Logo" className="h-10 w-auto rounded-md" />
              <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
            </div>
            <Link href="/" className="text-blue-200 hover:text-white font-medium">Back to Site</Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Navigation Tabs */}
        <div className="flex space-x-4 border-b border-gray-200 pb-4">
           <button 
              onClick={() => setActiveTab('requests')} 
              className={`px-4 py-2 font-bold rounded-lg transition-colors flex items-center ${activeTab === 'requests' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
           >
              <Store className="w-5 h-5 mr-2" /> Pending Requests
              {requests.length > 0 && <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{requests.length}</span>}
           </button>
           <button 
              onClick={() => setActiveTab('users')} 
              className={`px-4 py-2 font-bold rounded-lg transition-colors flex items-center ${activeTab === 'users' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
           >
              <Users className="w-5 h-5 mr-2" /> Users Database
           </button>
           <button 
              onClick={() => setActiveTab('settings')} 
              className={`px-4 py-2 font-bold rounded-lg transition-colors flex items-center ${activeTab === 'settings' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
           >
              <Settings className="w-5 h-5 mr-2" /> System Settings
           </button>
        </div>

        {/* Tab Contents */}
        <div className="grid grid-cols-1 gap-6">
           {activeTab === 'requests' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                 <div className="p-5 border-b border-gray-100 flex items-center bg-gray-50 text-gray-800">
                    <Store className="h-6 w-6 mr-3 text-blue-600" />
                    <h2 className="text-xl font-bold">Pending Seller Requests</h2>
                 </div>
                 <div className="divide-y divide-gray-100">
                    {requests.length === 0 ? (
                       <p className="p-6 text-gray-500 text-center">No pending requests.</p>
                    ) : (
                       requests.map(req => (
                          <div key={req.id} className="p-6 flex flex-col sm:flex-row justify-between items-center hover:bg-gray-50 transition-colors">
                             <div>
                                <h3 className="font-bold text-lg text-gray-900">{req.name}</h3>
                                <div className="text-sm text-gray-600 mt-1 space-y-1">
                                   <p><span className="font-semibold">User:</span> {req.user.username} ({req.user.name})</p>
                                   <p><span className="font-semibold">Phone:</span> {req.phone}</p>
                                   <p><span className="font-semibold">Address:</span> {req.address}</p>
                                   <p><span className="font-semibold">Brands:</span> {req.brands}</p>
                                </div>
                             </div>
                             <div className="mt-4 sm:mt-0 flex space-x-3">
                                <button onClick={() => handleRequest(req.id, "REJECTED")} className="flex items-center px-4 py-2 border border-red-200 text-red-700 bg-red-50 hover:bg-red-100 rounded-md font-medium">
                                  <XCircle className="w-5 h-5 mr-1" /> Reject
                                </button>
                                <button onClick={() => handleRequest(req.id, "APPROVED")} className="flex items-center px-4 py-2 border border-green-600 text-white bg-green-600 hover:bg-green-700 rounded-md font-medium shadow-sm">
                                  <CheckCircle className="w-5 h-5 mr-1" /> Accept
                                </button>
                             </div>
                          </div>
                       ))
                    )}
                 </div>
              </div>
           )}

           {activeTab === 'users' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                 <div className="p-5 border-b border-gray-100 flex items-center bg-gray-50 text-gray-800">
                    <Users className="h-6 w-6 mr-3 text-blue-600" />
                    <h2 className="text-xl font-bold">Registered Users ({allUsers.length})</h2>
                 </div>
                 <div className="divide-y divide-gray-100">
                    {allUsers.length === 0 ? (
                       <p className="p-6 text-gray-500 text-center">No users found.</p>
                    ) : (
                       allUsers.map(user => (
                          <div key={user.id} className="p-6">
                             <div className="flex flex-col sm:flex-row justify-between items-start">
                                <div>
                                   <div className="flex items-center gap-3">
                                      <h3 className="font-bold text-lg text-gray-900">{user.username}</h3>
                                      <span className={`text-xs px-2 py-1 rounded font-bold ${user.role === 'SELLER' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'}`}>
                                         {user.role}
                                      </span>
                                   </div>
                                   <div className="text-sm text-gray-600 mt-2 space-y-1">
                                      <p><span className="font-semibold">Name:</span> {user.name || 'N/A'}</p>
                                      <p><span className="font-semibold">Phone:</span> {user.phone || 'N/A'}</p>
                                      <p><span className="font-semibold">Registered:</span> {new Date(user.createdAt).toLocaleDateString()}</p>
                                      <p><span className="font-semibold">Orders:</span> {user.orders?.length || 0}</p>
                                   </div>
                                   
                                   {/* Specific Seller Details & Reviews */}
                                   {user.role === "SELLER" && user.shop && (
                                      <div className="mt-4 pl-4 border-l-2 border-orange-200">
                                         <h4 className="font-bold text-sm text-gray-800">{user.shop.name}</h4>
                                         <p className="text-xs text-gray-600">{user.shop.address}</p>
                                         {user.shop.reviews?.length > 0 && (
                                            <div className="mt-2 text-xs">
                                               <span className="font-bold text-gray-800">Reviews ({user.shop.reviews.length}):</span>
                                               <div className="mt-1 space-y-2 max-h-32 overflow-y-auto pr-2">
                                                  {user.shop.reviews.map((rev: any) => (
                                                     <div key={rev.id} className="bg-gray-50 p-2 rounded border border-gray-100">
                                                        <div className="flex items-center text-yellow-400 mb-1">
                                                           {Array(5).fill(0).map((_, i) => <Star key={i} className={`w-3 h-3 ${i < rev.rating ? 'fill-current' : 'text-gray-300'}`} />)}
                                                           <span className="ml-2 text-gray-500 font-medium">{rev.buyer?.username}</span>
                                                        </div>
                                                        <p className="text-gray-600">"{rev.comment}"</p>
                                                     </div>
                                                  ))}
                                               </div>
                                            </div>
                                         )}
                                      </div>
                                   )}
                                </div>
                                <div className="mt-4 sm:mt-0 flex flex-wrap gap-2">
                                   <button 
                                      onClick={() => { setMessageTarget(user); setMessageModalOpen(true); }}
                                      className="flex items-center px-3 py-1.5 border border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100 rounded text-sm font-medium transition-colors"
                                   >
                                      <MessageSquare className="w-4 h-4 mr-1.5" /> Message
                                   </button>
                                   <button 
                                      onClick={() => deleteUser(user.id)}
                                      className="flex items-center px-3 py-1.5 border border-red-200 text-red-700 bg-red-50 hover:bg-red-100 rounded text-sm font-medium transition-colors"
                                   >
                                      <Trash2 className="w-4 h-4 mr-1.5" /> Delete
                                   </button>
                                </div>
                             </div>
                          </div>
                       ))
                    )}
                 </div>
              </div>
           )}

           {activeTab === 'settings' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden max-w-2xl">
                 <div className="p-5 border-b border-gray-100 flex items-center bg-gray-50 text-gray-800">
                    <Settings className="h-6 w-6 mr-3 text-gray-600" />
                    <h2 className="text-xl font-bold">System Settings</h2>
                 </div>
                 <div className="p-6 space-y-4">
                    <div>
                       <label className="block text-sm font-bold text-gray-700 mb-2">
                          Admin WhatsApp Number
                       </label>
                       <p className="text-xs text-gray-500 mb-2">Used for seller registration payments.</p>
                       <input 
                          type="text" 
                          placeholder="e.g. 94700000000"
                          value={adminWhatsapp}
                          onChange={(e) => setAdminWhatsapp(e.target.value)}
                          className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 border"
                       />
                    </div>
                    <button 
                       onClick={saveSettings}
                       disabled={savingSettings}
                       className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 mt-4"
                    >
                       {savingSettings ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Settings"}
                    </button>
                 </div>
              </div>
           )}
        </div>
      </main>

      {/* Message Modal */}
      {messageModalOpen && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
               <h3 className="text-lg font-bold text-gray-900 mb-2">Message {messageTarget?.username}</h3>
               <p className="text-sm text-gray-500 mb-4">Send a direct message to this user's dashboard.</p>
               <textarea 
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  placeholder="Type your message here..."
                  className="w-full h-32 border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 p-3 border mb-4"
               />
               <div className="flex justify-end space-x-3">
                  <button 
                     onClick={() => setMessageModalOpen(false)}
                     className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                     disabled={sendingMessage}
                  >
                     Cancel
                  </button>
                  <button 
                     onClick={sendMessage}
                     disabled={sendingMessage || !messageContent.trim()}
                     className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded flex items-center"
                  >
                     {sendingMessage ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                     Send Message
                  </button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
}
