import { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, addDoc, serverTimestamp, onSnapshot, query, where } from 'firebase/firestore';
import { useAuthStore } from '../../stores/useAuthStore';
import { useCartStore } from '../../stores/useCartStore';
import { useThemeStore } from '../../stores/useThemeStore';
import { Calendar, ShoppingBag, ShoppingCart, ArrowRight, User, Package, CheckCircle, Clock, Search, Plus, Minus, Trash2, X } from 'lucide-react';
import { useToast } from '../../components/toast/useToast';
import { ORDER_STAGES } from '../../constants';
import { SkeletonCard, SkeletonOrderCard } from '../../components/Skeleton';
import ThemeToggle from '../../components/ThemeToggle';

import imgOversizedHoodie from '../../assets/OVERSIZED HOODIE X.png';
import imgCargoPants from '../../assets/CARGO PANTS V2.png';
import imgLimitedTrench from '../../assets/LIMITED TRENCH.png';
import imgTechFleece from '../../assets/TECH FLEECE ZIP.png';
import imgWashedDenim from '../../assets/WASHED DENIM JACKET.png';
import imgUtilityVest from '../../assets/UTILITY VEST PRO.png';

const PRODUCTS = [
  { id: '1', name: 'OVERSIZED HOODIE X', price: 15000, type: 'IN_STOCK', category: 'ВЕРХ', image: imgOversizedHoodie },
  { id: '2', name: 'CARGO PANTS V2', price: 12000, type: 'IN_STOCK', category: 'НИЗ', image: imgCargoPants },
  { id: '3', name: 'LIMITED TRENCH', price: 35000, type: 'PREORDER', category: 'ВЕРХНЯЯ ОДЕЖДА', image: imgLimitedTrench },
  { id: '4', name: 'TECH FLEECE ZIP', price: 18000, type: 'IN_STOCK', category: 'ВЕРХ', image: imgTechFleece },
  { id: '5', name: 'WASHED DENIM JACKET', price: 22000, type: 'PREORDER', category: 'ВЕРХНЯЯ ОДЕЖДА', image: imgWashedDenim },
  { id: '6', name: 'UTILITY VEST PRO', price: 9500, type: 'IN_STOCK', category: 'ВЕРХ', image: imgUtilityVest },
];

export default function ClientHome() {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeTab, setActiveTab] = useState('КАТАЛОГ');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [cartOpen, setCartOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const cartItems = useCartStore(s => s.items);
  const itemCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  const { initTheme } = useThemeStore();

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  const filteredProducts = PRODUCTS.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'ALL' || p.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="min-h-screen bg-themed text-themed font-sans pb-24">
      <header className="p-4 md:p-6 flex justify-between items-center border-b border-themed sticky top-0 bg-themed z-40" style={{ transition: 'background-color 0.3s, border-color 0.3s' }}>
        <h1 className="text-2xl md:text-3xl font-black tracking-tighter">AVISHU</h1>
        <div className="flex gap-2 md:gap-4 items-center">
          {['КАТАЛОГ', 'ЗАКАЗЫ', 'ПРОФИЛЬ'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`font-bold text-xs md:text-sm transition-colors ${activeTab === tab ? 'border-b-2 border-themed' : 'text-themed-tertiary hover:text-themed'}`}>{tab}</button>
          ))}
          <ThemeToggle />
          <button
            onClick={() => setCartOpen(true)}
            className="relative w-10 h-10 flex items-center justify-center border border-themed font-bold transition-all hover:scale-110 active:scale-95"
          >
            <ShoppingCart size={18} strokeWidth={2.5} />
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-themed-inverse text-themed-inverse text-[10px] font-black flex items-center justify-center cart-badge-bounce">
                {itemCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {activeTab === 'КАТАЛОГ' ? (
        <main className="p-4 md:p-6 max-w-4xl mx-auto space-y-8 md:space-y-16 mt-4 md:mt-8 page-enter">
          <div className="w-full h-48 md:h-64 bg-themed-inverse flex items-center justify-center text-themed-inverse animate-fade-in">
            <h2 className="text-3xl md:text-5xl font-black tracking-widest text-center px-4">FW 26/27<br/><span className="text-themed-tertiary">КОЛЛЕКЦИЯ</span></h2>
          </div>

          <div className="space-y-4 animate-fade-up" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center border-2 border-themed p-3 md:p-4 gap-3">
              <Search size={20} className="text-themed-tertiary flex-shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ПОИСК ТОВАРОВ..."
                className="w-full bg-transparent outline-none font-bold text-sm md:text-lg uppercase border-none"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="text-themed-tertiary hover:text-themed font-bold text-sm border-none bg-transparent">✕</button>
              )}
            </div>
            <div className="flex gap-2 md:gap-3">
              {[['ALL', 'ВСЕ'], ['IN_STOCK', 'В НАЛИЧИИ'], ['PREORDER', 'ПРЕДЗАКАЗ']].map(([type, label]) => (
                <button
                  key={type}
                  onClick={() => setTypeFilter(type)}
                  className={`px-3 md:px-4 py-2 text-xs font-bold transition-all btn-brutal ${
                    typeFilter === type
                      ? 'bg-themed-inverse text-themed-inverse'
                      : 'border border-themed text-themed hover:bg-themed-inverse hover:text-themed-inverse'
                  }`}
                >
                  {type === 'ALL' ? `${label} (${PRODUCTS.length})` : `${label} (${PRODUCTS.filter(p => p.type === type).length})`}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 stagger-children">
            {filteredProducts.map(p => (
              <ProductCard key={p.id} product={p} onSelect={setSelectedProduct} />
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-16 border border-dashed border-themed-secondary animate-fade-in">
              <p className="text-themed-tertiary font-bold text-xl">НИЧЕГО НЕ НАЙДЕНО</p>
              <button onClick={() => { setSearchQuery(''); setTypeFilter('ALL'); }} className="mt-4 text-sm font-bold underline border-none bg-transparent">
                СБРОСИТЬ ФИЛЬТРЫ
              </button>
            </div>
          )}
        </main>
      ) : activeTab === 'ЗАКАЗЫ' ? (
        <OrdersView user={user} />
      ) : (
        <UserProfile user={user} onLogout={logout} />
      )}

      {selectedProduct && <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} user={user} />}

      {cartOpen && <CartDrawer onClose={() => setCartOpen(false)} user={user} />}
    </div>
  );
}

function ProductCard({ product, onSelect }) {
  const addItem = useCartStore(s => s.addItem);
  const toast = useToast();

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addItem(product);
    toast.success(`${product.name} — ДОБАВЛЕНО В КОРЗИНУ`);
  };

  return (
    <div
      className="border border-themed p-4 md:p-8 flex flex-col justify-between cursor-pointer product-card group"
      onClick={() => onSelect(product)}
    >
      <div className="h-40 md:h-64 bg-themed-secondary flex items-center justify-center mb-4 md:mb-6 border border-transparent group-hover:border-themed transition-colors overflow-hidden">
        {product.image ? (
          <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <ShoppingBag size={36} strokeWidth={1} className="text-themed-tertiary" />
        )}
      </div>
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-lg md:text-2xl font-bold">{product.name}</h3>
          <p className="text-xs font-bold text-themed-tertiary mt-1">{product.category}</p>
        </div>
      </div>
      <div className="flex justify-between items-center mt-3 md:mt-4">
        <span className="text-lg md:text-xl font-bold">{product.price.toLocaleString()} ₸</span>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold px-2 py-1 ${product.type === 'PREORDER' ? 'bg-themed-tertiary text-themed' : 'bg-themed-inverse text-themed-inverse'}`}>{product.type === 'PREORDER' ? 'ПРЕДЗАКАЗ' : 'В НАЛИЧИИ'}</span>
          <button
            onClick={handleAddToCart}
            className="w-9 h-9 bg-themed-inverse text-themed-inverse flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
            title="В корзину"
          >
            <Plus size={16} strokeWidth={3} />
          </button>
        </div>
      </div>
    </div>
  );
}

function CartDrawer({ onClose, user }) {
  const { items, removeItem, updateQuantity, clearCart } = useCartStore();
  const totalPrice = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleCheckout = async () => {
    if (items.length === 0) return;
    setLoading(true);
    try {
      const orderItems = items.map(i => ({
        productId: i.product.id,
        name: i.product.name,
        price: i.product.price,
        quantity: i.quantity,
      }));

      const hasPreorder = items.some(i => i.product.type === 'PREORDER');

      await addDoc(collection(db, 'orders'), {
        clientId: user.uid,
        clientName: user.name,
        items: orderItems,
        totalPrice,
        status: 'ОФОРМЛЕН',
        type: hasPreorder ? 'PREORDER' : 'IN_STOCK',
        createdAt: serverTimestamp(),
      });

      clearCart();
      toast.success(`ЗАКАЗ ОФОРМЛЕН — ${items.length} ПОЗ. НА ${totalPrice.toLocaleString()} ₸`);
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('ОШИБКА ОФОРМЛЕНИЯ ЗАКАЗА');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end modal-overlay" onClick={onClose}>
      <div className="absolute inset-0 overlay-themed backdrop-blur-sm"></div>
      <div
        className="relative w-full max-w-md bg-themed border-l-2 border-themed h-full flex flex-col animate-slide-right"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b-2 border-themed flex justify-between items-center">
          <h2 className="text-2xl font-black flex items-center gap-3">
            <ShoppingCart size={24} strokeWidth={2.5} /> КОРЗИНА
          </h2>
          <button onClick={onClose} className="text-3xl font-light hover:rotate-90 transition-transform border-none bg-transparent">&times;</button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-themed-tertiary gap-4">
              <ShoppingBag size={48} strokeWidth={1} />
              <p className="font-bold text-xl">ПУСТО</p>
              <p className="text-sm">ДОБАВЬТЕ ТОВАРЫ ИЗ КАТАЛОГА</p>
            </div>
          ) : (
            items.map(item => (
              <div key={item.product.id} className="border border-themed p-4 flex flex-col gap-3 animate-fade-up">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-lg">{item.product.name}</h4>
                    <p className="text-xs font-bold text-themed-tertiary">{item.product.category}</p>
                  </div>
                  <button
                    onClick={() => removeItem(item.product.id)}
                    className="p-2 hover:bg-themed-inverse hover:text-themed-inverse transition-colors border-none bg-transparent"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center border border-themed">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="w-9 h-9 flex items-center justify-center hover:bg-themed-inverse hover:text-themed-inverse transition-colors border-none bg-transparent"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-10 text-center font-black text-lg">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className="w-9 h-9 flex items-center justify-center hover:bg-themed-inverse hover:text-themed-inverse transition-colors border-none bg-transparent"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <span className="font-bold text-lg">{(item.product.price * item.quantity).toLocaleString()} ₸</span>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="p-6 border-t-2 border-themed space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-themed-tertiary">{items.reduce((s,i) => s+i.quantity, 0)} ПОЗИЦИЙ</span>
              <button onClick={clearCart} className="text-xs font-bold text-themed-tertiary underline hover:text-themed border-none bg-transparent">ОЧИСТИТЬ</button>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-bold text-xl">ИТОГО</span>
              <span className="font-black text-2xl">{totalPrice.toLocaleString()} ₸</span>
            </div>
            <button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full bg-themed-inverse text-themed-inverse p-5 text-xl font-black flex items-center justify-center gap-3 hover:opacity-90 transition-opacity disabled:opacity-50 btn-brutal"
            >
              {loading ? 'ОФОРМЛЯЕМ...' : 'ОФОРМИТЬ ЗАКАЗ'}
              <ArrowRight strokeWidth={3} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ProductModal({ product, onClose, user }) {
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(false);
  const addItem = useCartStore(s => s.addItem);
  const toast = useToast();

  const handleAddToCart = () => {
    addItem(product);
    toast.success(`${product.name} — ДОБАВЛЕНО В КОРЗИНУ`);
    onClose();
  };

  const handleBuyNow = async () => {
    setLoading(true);
    try {
      if (!user) return;

      const orderData = {
        clientId: user.uid,
        clientName: user.name,
        items: [{ productId: product.id, name: product.name, price: product.price, quantity: 1 }],
        totalPrice: product.price,
        status: 'ОФОРМЛЕН',
        type: product.type,
        createdAt: serverTimestamp(),
      };

      if (product.type === 'PREORDER') {
        orderData.preorderDate = date;
      }

      await addDoc(collection(db, 'orders'), orderData);
      toast.success(`ЗАКАЗ ОФОРМЛЕН — ${product.name}`);
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('ОШИБКА ОФОРМЛЕНИЯ ЗАКАЗА');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 overlay-themed backdrop-blur-sm z-50 flex items-center justify-center p-4 modal-overlay" onClick={onClose}>
      <div className="bg-themed border-2 border-themed w-full max-w-xl shadow-brutal-lg modal-content" onClick={e => e.stopPropagation()}>
        <div className="p-8 border-b-2 border-themed flex justify-between items-center">
          <h2 className="text-3xl font-black">{product.name}</h2>
          <button onClick={onClose} className="text-4xl font-light hover:rotate-90 transition-transform border-none bg-transparent">&times;</button>
        </div>

        {product.image && (
          <div className="w-full h-64 md:h-80 bg-themed-secondary overflow-hidden">
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
          </div>
        )}
        <div className="p-8 space-y-6">
          <div className="flex justify-between items-center">
            <p className="text-2xl font-bold">{product.price.toLocaleString()} ₸</p>
            <span className={`text-xs font-bold px-3 py-1 ${product.type === 'PREORDER' ? 'bg-themed-tertiary text-themed' : 'bg-themed-inverse text-themed-inverse'}`}>{product.type === 'PREORDER' ? 'ПРЕДЗАКАЗ' : 'В НАЛИЧИИ'}</span>
          </div>

          {product.type === 'PREORDER' && (
            <div className="space-y-4 pt-4 border-t border-themed-secondary">
              <label className="block text-sm font-bold text-themed-tertiary">ДАТА ПРОИЗВОДСТВА</label>
              <div className="flex items-center border border-themed p-4">
                <Calendar className="mr-4 text-themed-tertiary" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-transparent outline-none uppercase font-bold text-lg border-none"
                  required
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleAddToCart}
              className="bg-transparent border-2 border-themed p-5 text-lg font-black flex items-center justify-center gap-3 hover:bg-themed-inverse hover:text-themed-inverse transition-colors btn-brutal"
            >
              <ShoppingCart size={20} strokeWidth={2.5} />
              В КОРЗИНУ
            </button>
            <button
              onClick={handleBuyNow}
              disabled={loading || (product.type === 'PREORDER' && !date)}
              className="bg-themed-inverse text-themed-inverse p-5 text-lg font-black flex items-center justify-center gap-3 hover:opacity-90 transition-opacity disabled:opacity-50 btn-brutal"
            >
              {loading ? '...' : 'КУПИТЬ'}
              <ArrowRight strokeWidth={3} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function OrdersView({ user }) {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'orders'), where('clientId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOrders(ordersData.sort((a,b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0)));
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  const activeOrders = orders.filter(o => o.status !== 'ГОТОВО');
  const completedOrders = orders.filter(o => o.status === 'ГОТОВО');
  const displayOrders = filter === 'ACTIVE' ? activeOrders : filter === 'COMPLETED' ? completedOrders : orders;

  return (
    <div className="p-6 max-w-4xl mx-auto mt-8 space-y-8 page-enter">
      <div className="flex gap-4 border-b border-themed pb-4 animate-fade-up">
        {[
          ['ALL', 'ВСЕ'],
          ['ACTIVE', 'АКТИВНЫЕ'],
          ['COMPLETED', 'ЗАВЕРШЁННЫЕ'],
        ].map(([f, label]) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`font-bold text-sm px-4 py-2 transition-all btn-brutal ${
              filter === f ? 'bg-themed-inverse text-themed-inverse' : 'text-themed-tertiary hover:text-themed'
            }`}
          >
            {label} ({f === 'ALL' ? orders.length : f === 'ACTIVE' ? activeOrders.length : completedOrders.length})
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4 stagger-children">
        <div className="border border-themed p-4 text-center">
          <Package size={24} className="mx-auto mb-2" />
          <p className="text-2xl font-black animate-pop">{orders.length}</p>
          <p className="text-xs font-bold text-themed-tertiary">ВСЕГО</p>
        </div>
        <div className="border border-themed p-4 text-center">
          <Clock size={24} className="mx-auto mb-2" />
          <p className="text-2xl font-black animate-pop" style={{ animationDelay: '0.1s' }}>{activeOrders.length}</p>
          <p className="text-xs font-bold text-themed-tertiary">АКТИВНЫХ</p>
        </div>
        <div className="border border-themed p-4 text-center">
          <CheckCircle size={24} className="mx-auto mb-2" />
          <p className="text-2xl font-black animate-pop" style={{ animationDelay: '0.2s' }}>{completedOrders.length}</p>
          <p className="text-xs font-bold text-themed-tertiary">ЗАВЕРШЕНО</p>
        </div>
      </div>

      <div className="space-y-6 stagger-children">
        {isLoading ? (
          <>
            <SkeletonOrderCard />
            <SkeletonOrderCard />
            <SkeletonOrderCard />
          </>
        ) : displayOrders.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-themed-secondary animate-fade-in">
            <p className="text-themed-tertiary font-bold text-xl">НЕТ ЗАКАЗОВ</p>
          </div>
        ) : (
          displayOrders.map(order => (
            <OrderCard key={order.id} order={order} />
          ))
        )}
      </div>
    </div>
  );
}

function OrderCard({ order }) {
  const itemsNames = order.items.map(i => `${i.name}${i.quantity > 1 ? ` ×${i.quantity}` : ''}`).join(', ');
  const currentStageIdx = ORDER_STAGES.indexOf(order.status) >= 0 ? ORDER_STAGES.indexOf(order.status) : 0;
  const orderDate = order.createdAt ? new Date(order.createdAt.toMillis()).toLocaleDateString() : '—';
  const isCompleted = order.status === 'ГОТОВО';

  return (
    <div className={`border p-6 space-y-8 relative overflow-hidden transition-all ${isCompleted ? 'border-themed bg-themed-secondary' : 'border-themed'}`}
    >
      <div className="absolute top-0 right-0 p-4 bg-themed-inverse text-themed-inverse font-bold text-xs">{order.type}</div>
      <div>
        <h4 className="text-2xl font-bold mb-2">{itemsNames}</h4>
        <p className="text-sm font-bold text-themed-tertiary">№ {order.id.slice(0,8).toUpperCase()} · {orderDate}</p>
        <p className="text-lg font-bold mt-2">{order.totalPrice?.toLocaleString()} ₸</p>
      </div>

      <div className="relative">
        <div className="absolute top-1/2 -mt-px w-full h-0.5 bg-themed-secondary z-0"></div>
        <div
          className="absolute top-1/2 -mt-px h-0.5 z-0 transition-all duration-500"
          style={{
            width: `${(currentStageIdx / (ORDER_STAGES.length - 1)) * 100}%`,
            backgroundColor: 'var(--text-primary)'
          }}
        ></div>
        <div className="flex justify-between relative z-10">
          {ORDER_STAGES.map((stage, idx) => (
            <div key={stage} className="flex flex-col items-center gap-2">
              <div
                className="w-4 h-4 rounded-full border-2 transition-colors"
                style={{
                  borderColor: idx <= currentStageIdx ? 'var(--text-primary)' : 'var(--text-primary)',
                  backgroundColor: idx <= currentStageIdx ? 'var(--text-primary)' : 'var(--bg-primary)'
                }}
              ></div>
              <span className={`text-xs font-bold w-24 text-center ${
                idx <= currentStageIdx ? 'text-themed' : 'text-themed-tertiary'
              }`}>{stage}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function UserProfile({ user, onLogout }) {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'orders'), where('clientId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOrders(ordersData);
    });
    return () => unsubscribe();
  }, [user]);

  const totalSpent = orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
  const completedOrders = orders.filter(o => o.status === 'ГОТОВО').length;

  const LEVELS = [
    { min: 0, max: 50000, name: 'БРОНЗА' },
    { min: 50000, max: 150000, name: 'СЕРЕБРО' },
    { min: 150000, max: 300000, name: 'ЗОЛОТО' },
    { min: 300000, max: Infinity, name: 'ПЛАТИНА' },
  ];

  const currentLevel = LEVELS.findIndex(l => totalSpent >= l.min && totalSpent < l.max);
  const level = LEVELS[currentLevel >= 0 ? currentLevel : 0];
  const nextLevel = LEVELS[Math.min(currentLevel + 1, LEVELS.length - 1)];
  const progressInLevel = level.max === Infinity ? 100 : Math.min(((totalSpent - level.min) / (level.max - level.min)) * 100, 100);

  return (
    <div className="p-6 max-w-4xl mx-auto mt-8 space-y-12 page-enter">
      <div className="flex items-center gap-6 border border-themed p-8 animate-fade-up">
        <div className="p-4 bg-themed-inverse text-themed-inverse"><User size={48} /></div>
        <div>
          <h2 className="text-3xl font-bold">{user?.name}</h2>
          <p className="text-themed-tertiary font-bold tracking-widest">{user?.role?.toUpperCase()}</p>
        </div>
        <button onClick={onLogout} className="ml-auto underline font-bold px-4 hover:text-red-600 transition-colors border-none bg-transparent">ВЫЙТИ</button>
      </div>

      <div className="space-y-4 animate-fade-up" style={{ animationDelay: '0.15s' }}>
        <div className="flex justify-between items-end">
          <h3 className="text-2xl font-bold">ЛОЯЛЬНОСТЬ — {level.name}</h3>
          <span className="font-bold text-themed-tertiary">
            {level.max === Infinity
              ? 'МАКС. УРОВЕНЬ'
              : `${Math.round(progressInLevel)}% ДО ${nextLevel.name}`
            }
          </span>
        </div>
        <div className="w-full h-8 border border-themed p-1">
          <div className="h-full bg-themed-inverse transition-all duration-500" style={{ width: `${progressInLevel}%` }}></div>
        </div>
        <div className="grid grid-cols-3 gap-4 text-center stagger-children">
          <div className="border border-themed p-4">
            <p className="text-2xl font-black animate-pop">{orders.length}</p>
            <p className="text-xs font-bold text-themed-tertiary">ЗАКАЗОВ</p>
          </div>
          <div className="border border-themed p-4">
            <p className="text-2xl font-black animate-pop" style={{ animationDelay: '0.1s' }}>{completedOrders}</p>
            <p className="text-xs font-bold text-themed-tertiary">ВЫПОЛНЕНО</p>
          </div>
          <div className="border border-themed p-4">
            <p className="text-2xl font-black animate-pop" style={{ animationDelay: '0.2s' }}>{totalSpent.toLocaleString()} ₸</p>
            <p className="text-xs font-bold text-themed-tertiary">ПОТРАЧЕНО</p>
          </div>
        </div>
      </div>
    </div>
  );
}
