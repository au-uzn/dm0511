import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot, doc, getDoc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Order, OrderStatus, Config } from '../types';
import { Settings, LogOut, CheckCircle, Clock, Loader2, Trash2, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Simple SHA-256 hash function using Web Crypto API
async function sha256(message: string) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

export default function AdminView({ onBack }: { onBack: () => void }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [config, setConfig] = useState<Config | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if system is setup
    const checkSetup = async () => {
      try {
        const configDoc = await getDoc(doc(db, 'config', 'system'));
        if (configDoc.exists()) {
          setConfig(configDoc.data() as Config);
        } else {
          setConfig({ isSetup: false, adminPasswordHash: '' });
        }
      } catch (err) {
        console.error('Error checking setup:', err);
      } finally {
        setIsLoading(false);
      }
    };
    checkSetup();

    // Listen to orders
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Order[];
      setOrders(ordersData);
    }, (err) => {
      console.error('Error fetching orders:', err);
    });

    return () => unsubscribe();
  }, []);

  const handleSetup = async () => {
    if (newPassword.length < 4) {
      setError('密碼至少需要 4 位數');
      return;
    }
    try {
      const hash = await sha256(newPassword);
      await setDoc(doc(db, 'config', 'system'), {
        isSetup: true,
        adminPasswordHash: hash
      });
      setConfig({ isSetup: true, adminPasswordHash: hash });
      setIsAuthenticated(true);
    } catch (err) {
      setError('設定失敗');
    }
  };

  const handleLogin = async () => {
    if (!config) return;
    const hash = await sha256(passwordInput);
    if (hash === config.adminPasswordHash) {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('密碼錯誤');
    }
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { status });
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const deleteOrder = async (orderId: string) => {
    if (!confirm('確定要刪除這筆訂單嗎？')) return;
    try {
      await deleteDoc(doc(db, 'orders', orderId));
    } catch (err) {
      console.error('Error deleting order:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#141414] text-[#E4E3E0]">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-base text-gray-800 p-6 font-sans">
        <div className="w-full max-w-md bg-white border border-gray-100 rounded-[32px] p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-brand-primary"></div>
          <div className="flex justify-between items-center mb-8">
            <button onClick={onBack} className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-black hover:bg-gray-50 rounded-full transition-all">
              <ArrowLeft size={20} />
            </button>
            <div className="w-8 h-8 bg-brand-primary/10 rounded-lg flex items-center justify-center text-brand-primary">
               <Settings size={16} />
            </div>
          </div>

          <AnimatePresence mode="wait">
            {!config?.isSetup ? (
              <motion.div key="setup" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <h2 className="text-2xl font-bold mb-2 serif italic">管理員初始化</h2>
                <p className="text-xs text-gray-400 mb-8 font-medium uppercase tracking-widest">FIRST TIME SETUP</p>
                <p className="text-sm text-gray-500 mb-6 leading-relaxed">檢測到您是第一次進入後台，請設定管理密碼以保護系統安全。</p>
                <div className="space-y-4">
                  <input
                    type="password"
                    placeholder="輸入新密碼 (New Password)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-mono"
                  />
                  <button
                    onClick={handleSetup}
                    className="w-full bg-brand-primary text-white font-bold py-4 rounded-2xl hover:bg-brand-dark transition-all shadow-xl shadow-emerald-700/20 active:scale-95"
                  >
                    建立設定並進入
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div key="login" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <h2 className="text-2xl font-bold mb-2 serif italic">管理登入</h2>
                <p className="text-xs text-brand-primary mb-8 font-bold uppercase tracking-widest">ADMIN AUTHENTICATION</p>
                <div className="space-y-4">
                  <input
                    type="password"
                    placeholder="請輸入密碼"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-mono"
                  />
                  <button
                    onClick={handleLogin}
                    className="w-full bg-brand-primary text-white font-bold py-4 rounded-2xl hover:bg-brand-dark transition-all shadow-xl shadow-emerald-700/20 active:scale-95"
                  >
                    登入管理系統
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          {error && <p className="mt-6 text-red-500 text-xs text-center font-bold">{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-base text-gray-800 font-sans flex flex-col">
      {/* Admin Header */}
      <header className="h-20 border-b border-gray-100 px-8 flex justify-between items-center bg-white shadow-sm sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-brand-dark rounded-xl flex items-center justify-center text-white">
            <Settings size={20} />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight serif italic leading-none">Daming Management</h1>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Order Processing Board</p>
          </div>
        </div>
        <div className="flex items-center gap-8">
          <div className="hidden sm:block text-right">
            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">DB Status</p>
            <p className="text-xs text-emerald-600 font-bold font-mono">LIVE_SYNC</p>
          </div>
          <div className="text-right border-l border-gray-100 pl-8">
            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">Active</p>
            <p className="text-xl font-bold font-mono text-brand-primary">{orders.filter(o => o.status === 'pending' || o.status === 'preparing').length}</p>
          </div>
          <button 
            onClick={() => setIsAuthenticated(false)}
            className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* Orders Dashboard */}
      <main className="p-8 max-w-6xl mx-auto w-full flex-1">
        <div className="flex justify-between items-end mb-10">
           <div>
             <h2 className="text-3xl font-bold serif italic tracking-tight">訂單管理 Dashboard</h2>
             <p className="text-sm text-gray-400 mt-1 font-sans">實時監控與處理客戶點單</p>
           </div>
           <button onClick={onBack} className="text-[10px] font-bold text-gray-500 bg-white border border-gray-200 px-4 py-2 rounded-full hover:bg-gray-50 transition-all uppercase tracking-widest shadow-sm">
             Exit Management
           </button>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {orders.length === 0 ? (
            <div className="py-32 text-center border-2 border-dashed border-gray-100 rounded-[40px] text-gray-300 flex flex-col items-center justify-center">
              <Clock size={48} className="mb-4 opacity-50" />
              <p className="font-bold serif italic text-xl">目前尚無等待中的訂單</p>
              <p className="text-xs mt-2 uppercase tracking-widest font-sans">Awaiting customer orders...</p>
            </div>
          ) : (
            orders.map(order => (
              <motion.div 
                layout
                key={order.id}
                className="bg-white border border-gray-100 rounded-[32px] overflow-hidden shadow-sm hover:shadow-xl hover:border-emerald-100 transition-all group"
              >
                <div className="p-8 flex flex-col lg:flex-row justify-between gap-10">
                  <div className="flex-1 space-y-6">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-3 h-12 rounded-full",
                          order.status === 'pending' ? "bg-amber-400" : order.status === 'preparing' ? "bg-brand-primary" : "bg-gray-200"
                        )}></div>
                        <div>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1 font-sans">Order Ref: {order.id.slice(-6)}</p>
                          <h4 className="text-xl font-bold text-gray-900 serif italic">Customer: {order.customerName}</h4>
                        </div>
                      </div>
                      <div className="text-right">
                         <p className="text-[10px] text-gray-400 font-bold mb-1 font-sans">{order.createdAt?.toDate().toLocaleDateString()}</p>
                         <p className="text-lg font-bold font-mono text-gray-800">{order.createdAt?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                       {order.items.map((item, idx) => (
                         <div key={idx} className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl border border-gray-100/50">
                           <div className="flex-1">
                             <p className="font-bold text-sm text-gray-800 truncate">{item.name}</p>
                             <div className="flex items-center gap-2 mt-1">
                               <span className="text-[9px] bg-white border border-gray-100 px-1.5 py-0.5 rounded font-bold uppercase text-gray-400">{item.size}</span>
                               <p className="text-[10px] text-gray-500 font-medium truncate">{item.sweetness} / {item.ice}</p>
                             </div>
                             {item.toppings.length > 0 && (
                               <p className="text-[9px] text-emerald-600 font-bold mt-1 uppercase tracking-tighter">+{item.toppings.join(', ')}</p>
                             )}
                           </div>
                           <div className="text-right ml-4">
                             <span className="text-xs font-bold font-mono block">x{item.quantity}</span>
                             <span className="text-[10px] text-gray-400 font-mono">NT${item.price}</span>
                           </div>
                         </div>
                       ))}
                    </div>
                  </div>

                  <div className="lg:w-72 flex flex-col justify-between gap-8 pt-8 lg:pt-0 border-t lg:border-t-0 lg:border-l border-gray-50 lg:pl-10">
                    <div className="flex justify-between items-end lg:block">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1 font-sans">Payment Amount</p>
                      <p className="text-4xl font-bold tracking-tighter text-brand-dark tabular-nums font-mono">
                        <span className="text-sm font-sans mr-1">NT$</span>{order.total}
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex gap-2">
                        {order.status === 'pending' && (
                          <button 
                            onClick={() => updateOrderStatus(order.id, 'preparing')}
                            className="flex-1 bg-gray-900 text-white font-bold py-4 rounded-2xl text-xs hover:bg-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-black/10 active:scale-95"
                          >
                            <Clock size={16} /> 準備製作
                          </button>
                        )}
                        {order.status === 'preparing' && (
                          <button 
                            onClick={() => updateOrderStatus(order.id, 'completed')}
                            className="flex-1 bg-brand-primary text-white font-bold py-4 rounded-2xl text-xs hover:bg-brand-dark transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-700/20 active:scale-95"
                          >
                            <CheckCircle size={16} /> 完成訂餐
                          </button>
                        )}
                        {order.status === 'completed' && (
                          <div className="flex-1 bg-emerald-50 text-emerald-600 py-4 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 border border-emerald-100 italic">
                            <CheckCircle size={16} /> 訂單已完成
                          </div>
                        )}
                      </div>
                      <button 
                        onClick={() => deleteOrder(order.id)}
                        className="w-full h-8 text-[10px] text-gray-300 hover:text-red-500 font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 border border-transparent hover:border-gray-100 rounded-full"
                      >
                        <Trash2 size={12} /> Archive Order
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </main>

      <footer className="h-10 bg-white border-t border-gray-100 flex items-center justify-between px-8 text-[10px] text-gray-400 font-bold uppercase tracking-widest font-sans shrink-0">
        <div className="flex gap-8">
          <span>Module_Sec: AES-256-Sync</span>
          <span>Daming_Cloud_V2.1</span>
        </div>
        <div>© 2024 Administration Module</div>
      </footer>
    </div>
  );
}
