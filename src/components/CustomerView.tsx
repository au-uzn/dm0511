import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot } from 'firebase/firestore';
import { PRODUCTS, MENU_CATEGORIES, TOPPINGS, SWEETNESS_LEVELS, ICE_LEVELS } from '../data/products';
import { Product, CartItem } from '../types';
import { ShoppingCart, Plus, Minus, X, Check, Coffee } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function CustomerView() {
  const [activeCategory, setActiveCategory] = useState(MENU_CATEGORIES[0]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Selection state for modal
  const [selectedSize, setSelectedSize] = useState<'M' | 'L'>('L');
  const [selectedSweetness, setSelectedSweetness] = useState(SWEETNESS_LEVELS[0]);
  const [selectedIce, setSelectedIce] = useState(ICE_LEVELS[0]);
  const [selectedToppings, setSelectedToppings] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);

  const addToCart = () => {
    if (!selectedProduct) return;
    
    const toppingPrice = selectedToppings.reduce((acc, t) => {
      const topping = TOPPINGS.find(top => top.name === t);
      return acc + (topping?.price || 0);
    }, 0);

    const newItem: CartItem = {
      productId: selectedProduct.id || selectedProduct.name,
      name: selectedProduct.name,
      price: selectedProduct.price + toppingPrice,
      quantity,
      size: selectedSize,
      sweetness: selectedSweetness,
      ice: selectedIce,
      toppings: [...selectedToppings],
    };

    setCart([...cart, newItem]);
    setSelectedProduct(null);
    setQuantity(1);
    setSelectedToppings([]);
  };

  const removeFromCart = (index: number) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
  };

  const cartTotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const submitOrder = async () => {
    if (cart.length === 0) return;
    try {
      await addDoc(collection(db, 'orders'), {
        items: cart,
        total: cartTotal,
        status: 'pending',
        createdAt: serverTimestamp(),
        customerName: 'Guest',
      });
      alert('訂單已送出！');
      setCart([]);
      setIsCartOpen(false);
    } catch (error) {
      console.error('Error submitting order:', error);
      alert('送出失敗，請再試一次');
    }
  };

  return (
    <div className="h-screen bg-bg-base flex flex-col font-sans text-gray-800 overflow-hidden">
      {/* Header */}
      <header className="h-16 flex items-center justify-between px-8 bg-white border-b border-gray-100 shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center text-white font-bold italic">茶</div>
          <h1 className="text-xl font-bold tracking-tight text-brand-dark serif italic">大茗萃 Daming Tea</h1>
        </div>
        <div className="flex items-center gap-6">
          <nav className="hidden md:flex gap-4 text-sm font-medium">
            <span className="text-brand-primary border-b-2 border-brand-primary pb-1 cursor-pointer">前台點單</span>
            <span className="text-gray-400 hover:text-gray-600 cursor-pointer">聯繫我們</span>
          </nav>
          <button 
            onClick={() => setIsCartOpen(!isCartOpen)}
            className="flex items-center gap-2 bg-gray-900 text-white px-5 py-2 rounded-xl text-sm font-medium transition-all hover:bg-gray-800 shadow-lg shadow-black/10 active:scale-95"
          >
            <ShoppingCart size={18} />
            購物車 ({cart.reduce((a, b) => a + b.quantity, 0)})
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Categories */}
        <aside className="w-64 bg-gray-50/50 border-r border-gray-100 p-6 flex flex-col gap-3 shrink-0 overflow-y-auto">
          <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 font-sans">飲品類別 Category</h2>
          {MENU_CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "w-full text-left p-3 rounded-xl transition-all font-medium text-sm",
                activeCategory === cat 
                  ? "bg-white border border-emerald-100 text-brand-primary shadow-sm ring-1 ring-emerald-500/5 transition-all" 
                  : "text-gray-500 hover:bg-white hover:text-gray-700"
              )}
            >
              {cat}
            </button>
          ))}
          
          <div className="mt-auto p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
            <p className="text-[10px] text-emerald-800 font-bold mb-1 uppercase tracking-tight">Firebase Status</p>
            <div className="flex items-center gap-2 text-[10px] text-emerald-600 font-mono italic">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              CONNECTED
            </div>
          </div>
        </aside>

        {/* Center: Product Grid */}
        <section className="flex-1 p-8 overflow-y-auto bg-white/30">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 serif italic tracking-tight">{activeCategory}</h2>
              <p className="text-sm text-gray-500 font-sans mt-1">選用高品質茶葉，現點現做</p>
            </div>
            <div className="text-xs text-gray-400 font-sans bg-gray-100 px-3 py-1 rounded-full uppercase tracking-tighter">
              {PRODUCTS.filter(p => p.category === activeCategory).length} Items
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {PRODUCTS.filter(p => p.category === activeCategory).map((product) => (
              <motion.div
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={product.name}
                onClick={() => setSelectedProduct(product)}
                className="group bg-white border border-gray-100 p-5 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer ring-1 ring-black/0 hover:ring-black/[0.02]"
              >
                <div className="h-40 bg-gray-50/50 rounded-2xl mb-5 flex flex-col items-center justify-center text-emerald-100/30 overflow-hidden relative group-hover:bg-brand-primary/5 transition-colors">
                  <Coffee size={64} strokeWidth={1} />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-brand-dark/5">
                    <span className="text-[10px] font-bold text-brand-primary bg-white px-3 py-1 rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform">SELECT OPTION</span>
                  </div>
                </div>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-900 group-hover:text-brand-primary transition-colors">{product.name}</h3>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-sans">{product.englishName}</p>
                  </div>
                  <span className="text-xl font-bold text-brand-primary tabular-nums">NT${product.price}</span>
                </div>
                {product.tags && (
                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {product.tags.map(tag => (
                      <span key={tag} className="text-[9px] px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full font-bold uppercase tracking-tighter">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </section>

        {/* Right Sidebar: Cart (Optional/Persistent if screen is large) */}
        <AnimatePresence>
          {isCartOpen && (
            <motion.aside 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              className="w-full sm:w-80 bg-white border-l border-gray-100 flex flex-col shrink-0 fixed inset-y-0 right-0 z-40 sm:relative sm:inset-auto shadow-2xl sm:shadow-none"
            >
              <div className="p-6 flex justify-between items-center bg-gray-50/50 sm:bg-white border-b border-gray-100 shrink-0">
                <h2 className="text-lg font-bold flex items-center gap-2 serif italic">
                  點單明細 <span className="font-sans text-gray-400 text-sm font-normal">({cart.length})</span>
                </h2>
                <button onClick={() => setIsCartOpen(false)} className="p-2 text-gray-400 hover:text-black">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-300 italic text-sm text-center py-20">
                    <ShoppingBag size={48} className="mb-4 opacity-10" />
                    尚未選購飲品
                  </div>
                ) : (
                  cart.map((item, idx) => (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      key={idx} 
                      className="group bg-gray-50/50 p-4 rounded-2xl border border-gray-100 hover:bg-white hover:shadow-md transition-all relative"
                    >
                      <button 
                         onClick={() => removeFromCart(idx)} 
                         className="absolute -top-1 -right-1 w-6 h-6 bg-white shadow-sm border border-gray-100 rounded-full flex items-center justify-center text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={12} />
                      </button>
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-bold text-sm text-gray-900">{item.name}</h4>
                        <span className="font-bold text-sm text-brand-primary">NT${item.price * item.quantity}</span>
                      </div>
                      <p className="text-[10px] text-gray-400 font-sans tracking-wide">
                        {item.size} / {item.sweetness} / {item.ice} x {item.quantity}
                      </p>
                      {item.toppings.length > 0 && (
                        <p className="text-[9px] text-emerald-600 font-bold mt-1 uppercase tracking-tighter">
                           + {item.toppings.join(', ')}
                        </p>
                      )}
                    </motion.div>
                  ))
                )}
              </div>

              <div className="p-8 border-t border-gray-100 bg-gray-50/30 shrink-0">
                <div className="flex justify-between mb-2 text-xs text-gray-400 font-bold uppercase tracking-widest font-sans">
                  <span>Subtotal 小計</span>
                  <span>NT$ {cartTotal}</span>
                </div>
                <div className="flex justify-between mb-8 text-2xl font-bold text-brand-dark serif italic">
                  <span>Grand Total 總計</span>
                  <span>NT$ {cartTotal}</span>
                </div>
                <button 
                  disabled={cart.length === 0}
                  onClick={submitOrder}
                  className={cn(
                    "w-full py-4 rounded-2xl font-bold shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2",
                    cart.length === 0 
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed grayscale" 
                      : "bg-brand-primary text-white shadow-emerald-700/20 hover:bg-brand-dark"
                  )}
                >
                  <Check size={18} /> 確認下單
                </button>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Status Bar */}
      <footer className="h-8 bg-white border-t border-gray-100 flex items-center justify-between px-8 text-[11px] text-gray-400 italic shrink-0">
        <div className="flex gap-6 uppercase tracking-tighter font-sans font-bold">
          <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> SYSTEM_STABLE</span>
          <span>BUILD: V2.0.4</span>
        </div>
        <div>© 2024 DAMING TEA SELECTION MODULE</div>
      </footer>

      {/* Product Selection Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProduct(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="relative w-full max-w-lg bg-white rounded-t-[32px] sm:rounded-[32px] p-8 overflow-y-auto max-h-[90vh]"
            >
              <button 
                onClick={() => setSelectedProduct(null)}
                className="absolute top-6 right-6 p-2 text-gray-400 hover:text-black transition-colors"
                id="close-modal"
              >
                <X size={24} />
              </button>

              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800">{selectedProduct.name}</h2>
                <p className="text-sm text-gray-400 italic mb-2">{selectedProduct.englishName}</p>
                {selectedProduct.description && (
                   <p className="text-sm text-gray-500 font-sans">{selectedProduct.description}</p>
                )}
              </div>

              <div className="space-y-6">
                {/* Size */}
                <div>
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 font-sans">容量 Size</h4>
                  <div className="flex gap-2">
                    {['M', 'L'].map(size => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size as 'M' | 'L')}
                        className={cn(
                          "flex-1 py-3 rounded-2xl border transition-all text-sm font-bold",
                          selectedSize === size ? "bg-brand-primary border-brand-primary text-white shadow-lg shadow-emerald-700/10" : "border-gray-200 text-gray-600 hover:bg-gray-50"
                        )}
                      >
                        {size === 'M' ? '中杯 Medium' : '大杯 Large'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sweetness */}
                <div>
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 font-sans">甜度 Sweetness</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {SWEETNESS_LEVELS.map(level => (
                      <button
                        key={level}
                        onClick={() => setSelectedSweetness(level)}
                        className={cn(
                          "py-3 rounded-xl border transition-all text-xs font-medium",
                          selectedSweetness === level ? "bg-brand-primary border-brand-primary text-white" : "border-gray-100 text-gray-600 hover:bg-gray-50"
                        )}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Ice */}
                <div>
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 font-sans">冰量 Ice</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {ICE_LEVELS.map(level => (
                      <button
                        key={level}
                        onClick={() => setSelectedIce(level)}
                        className={cn(
                          "py-3 rounded-xl border transition-all text-sm font-medium",
                          selectedIce === level ? "bg-brand-primary border-brand-primary text-white" : "border-gray-100 text-gray-600 hover:bg-gray-50"
                        )}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Toppings */}
                <div>
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 font-sans">加料 Toppings</h4>
                  <div className="space-y-2">
                    {TOPPINGS.map(topping => (
                      <label 
                        key={topping.name}
                        className={cn(
                          "flex justify-between items-center p-3 rounded-xl border cursor-pointer transition-all",
                          selectedToppings.includes(topping.name) ? "border-brand-primary bg-emerald-50/50" : "border-gray-100 hover:bg-gray-50"
                        )}
                      >
                        <span className="text-sm text-gray-700 font-medium">{topping.name}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-brand-primary font-bold">NT${topping.price}</span>
                          <input 
                            type="checkbox"
                            className="hidden"
                            checked={selectedToppings.includes(topping.name)}
                            onChange={(e) => {
                              if (e.target.checked) setSelectedToppings([...selectedToppings, topping.name]);
                              else setSelectedToppings(selectedToppings.filter(t => t !== topping.name));
                            }}
                          />
                          <div className={cn(
                            "w-5 h-5 rounded-md border flex items-center justify-center transition-all",
                            selectedToppings.includes(topping.name) ? "bg-brand-primary border-brand-primary" : "border-gray-200"
                          )}>
                            {selectedToppings.includes(topping.name) && <Check size={12} className="text-white" />}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Quantity & Add */}
                <div className="pt-6 border-t border-gray-100 flex items-center gap-6">
                  <div className="flex items-center gap-4 bg-gray-100 p-2 rounded-2xl">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-9 h-9 flex items-center justify-center bg-white rounded-xl shadow-sm hover:bg-gray-50"><Minus size={16} /></button>
                    <span className="text-lg font-bold font-mono w-6 text-center">{quantity}</span>
                    <button onClick={() => setQuantity(quantity + 1)} className="w-9 h-9 flex items-center justify-center bg-white rounded-xl shadow-sm hover:bg-gray-50"><Plus size={16} /></button>
                  </div>
                  <button 
                    onClick={addToCart}
                    className="flex-1 py-4 bg-brand-primary text-white rounded-2xl font-bold shadow-xl shadow-emerald-700/10 active:scale-95 transition-all hover:bg-brand-dark"
                    id="add-to-cart-confirm"
                  >
                    加入購物車 NT$ {(selectedProduct.price + selectedToppings.reduce((acc, t) => acc + (TOPPINGS.find(top => top.name === t)?.price || 0), 0)) * quantity}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              className="relative w-full max-w-sm bg-white h-full shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b flex justify-between items-center">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <ShoppingBag size={20} /> 購物車
                </h2>
                <button onClick={() => setIsCartOpen(false)} className="p-2"><X size={24} /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {cart.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-4">
                    <Coffee size={48} className="opacity-20" />
                    <p>購物車是空的</p>
                  </div>
                ) : (
                  cart.map((item, idx) => (
                    <div key={idx} className="flex gap-4 border-b border-gray-50 pb-6 group">
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-bold text-gray-800">{item.name}</h4>
                          <button onClick={() => removeFromCart(idx)} className="text-gray-300 hover:text-red-500"><X size={16} /></button>
                        </div>
                        <p className="text-xs text-gray-500 font-sans mb-2">
                          {item.size} / {item.sweetness} / {item.ice}
                          {item.toppings.length > 0 && ` / ${item.toppings.join(', ')}`}
                        </p>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-400">NT$ {item.price} x {item.quantity}</span>
                          <span className="font-bold text-gray-700">NT$ {item.price * item.quantity}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-8 bg-gray-50 border-t space-y-4">
                  <div className="flex justify-between items-center text-lg">
                    <span className="text-gray-500 font-sans">總計</span>
                    <span className="text-2xl font-bold text-[#5A5A40]">NT$ {cartTotal}</span>
                  </div>
                  <button 
                    onClick={submitOrder}
                    className="w-full py-4 bg-[#5A5A40] text-white rounded-2xl font-bold shadow-lg shadow-[#5A5A40]/20 active:scale-95 transition-transform"
                    id="submit-order"
                  >
                    確認送出訂單
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ShoppingBag(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}
