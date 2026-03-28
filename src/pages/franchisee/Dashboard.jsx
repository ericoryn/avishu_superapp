import { useState, useEffect, useMemo } from 'react';
import { db } from '../../firebase';
import { collection, onSnapshot, query, updateDoc, doc } from 'firebase/firestore';
import { useAuthStore } from '../../stores/useAuthStore';
import { useThemeStore } from '../../stores/useThemeStore';
import { useToast } from '../../components/toast/useToast';
import { ORDER_STAGES, STATUS_TRANSITIONS } from '../../constants';
import ThemeToggle from '../../components/ThemeToggle';
import { FilterChip, MetricCard, OrderCard } from './DashboardCards';
import {
  LogOut, TrendingUp, Target, Package, Filter, Calendar,
  Users, BarChart3, ChevronDown, ChevronUp, Zap, Clock,
  DollarSign, ShoppingBag, Layers, X, Menu,
} from 'lucide-react';

const STAGE_ICONS = {
  'ОФОРМЛЕН': <ShoppingBag size={14} />,
  'НА ПОШИВЕ': <Zap size={14} />,
  'ГОТОВО': <Package size={14} />,
};

const STAGE_COLORS = {
  'ОФОРМЛЕН': { accent: '#6366f1', bg: 'rgba(99,102,241,0.08)' },
  'НА ПОШИВЕ': { accent: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
  'ГОТОВО': { accent: '#22c55e', bg: 'rgba(34,197,94,0.08)' },
};

function orderCreatedAtMs(o) {
  const c = o?.createdAt;
  if (!c) return null;
  if (typeof c.toMillis === 'function') return c.toMillis();
  if (typeof c.seconds === 'number') return c.seconds * 1000 + Math.floor((c.nanoseconds || 0) / 1e6);
  if (typeof c === 'number') return c;
  return null;
}

export default function FranchiseeDashboard() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState('ALL');
  const [filterDate, setFilterDate] = useState('ALL');
  const [filterClient, setFilterClient] = useState('ALL');
  const [showFilters, setShowFilters] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedCard, setExpandedCard] = useState(null);
  const [metricsExpanded, setMetricsExpanded] = useState(true);
  const { user, logout } = useAuthStore();
  const { theme, initTheme } = useThemeStore();
  const toast = useToast();

  useEffect(() => { initTheme(); }, [initTheme]);

  useEffect(() => {
    const q = query(collection(db, 'orders'));
    const unsubscribe = onSnapshot(q,
      (snapshot) => {
        const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        data.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
        setOrders(data);
        setIsLoading(false);
      },
      (error) => {
        console.error('Firestore error:', error);
        setIsLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const isDark = theme === 'dark';

  const t = useMemo(() => ({
    bg: isDark ? '#0a0a0a' : '#ffffff',
    bgCard: isDark ? '#111111' : '#f8f9fa',
    bgCardHover: isDark ? '#1a1a1a' : '#f0f1f3',
    bgSurface: isDark ? '#141414' : '#f3f4f6',
    bgInverse: isDark ? '#ffffff' : '#000000',
    text: isDark ? '#f0f0f0' : '#0a0a0a',
    textSecondary: isDark ? '#a0a0a0' : '#6b7280',
    textMuted: isDark ? '#505050' : '#9ca3af',
    textInverse: isDark ? '#000000' : '#ffffff',
    border: isDark ? '#1f1f1f' : '#e5e7eb',
    borderStrong: isDark ? '#3a3a3a' : '#d1d5db',
    borderAccent: isDark ? '#f0f0f0' : '#000000',
    shadow: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)',
    shadowBrutal: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.25)',
    green: '#22c55e',
    red: '#ef4444',
    yellow: '#eab308',
    indigo: '#6366f1',
  }), [isDark]);

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - 7);

  const todayOrders = orders.filter((o) => {
    const ms = orderCreatedAtMs(o);
    return ms != null && ms >= todayStart.getTime();
  });
  const weekOrders = orders.filter((o) => {
    const ms = orderCreatedAtMs(o);
    return ms != null && ms >= weekStart.getTime();
  });
  const revenueToday = todayOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
  const revenueWeek = weekOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
  const completedOrders = orders.filter(o => o.status === 'ГОТОВО');
  const fulfillmentRate = orders.length > 0 ? ((completedOrders.length / orders.length) * 100).toFixed(1) : 0;
  const activeOrders = orders.filter(o => o.status !== 'ГОТОВО');
  const avgOrderValue = orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0;

  const uniqueClients = [...new Set(orders.map(o => o.clientName).filter(Boolean))];

  const filteredOrders = orders.filter(o => {
    if (filterType !== 'ALL' && o.type !== filterType) return false;
    if (filterClient !== 'ALL' && o.clientName !== filterClient) return false;
    if (filterDate !== 'ALL') {
      const ts = orderCreatedAtMs(o);
      if (ts == null) return false;
      if (filterDate === 'TODAY' && ts < todayStart.getTime()) return false;
      if (filterDate === 'WEEK' && ts < weekStart.getTime()) return false;
    }
    return true;
  });

  const handleMoveOrder = async (order) => {
    const nextStatus = STATUS_TRANSITIONS[order.status];
    if (!nextStatus) return;
    try {
      await updateDoc(doc(db, 'orders', order.id), { status: nextStatus });
      toast.success(`${order.items?.[0]?.name} → ${nextStatus}`);
    } catch (err) {
      console.error(err);
      toast.error('ОШИБКА ОБНОВЛЕНИЯ СТАТУСА');
    }
  };

  const hasActiveFilters = filterType !== 'ALL' || filterDate !== 'ALL' || filterClient !== 'ALL';

  const resetFilters = () => {
    setFilterType('ALL');
    setFilterDate('ALL');
    setFilterClient('ALL');
  };

  const timeStr = now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div style={{
      minHeight: '100vh', backgroundColor: t.bgSurface, color: t.text,
      fontFamily: 'Inter, sans-serif', fontSize: '14px', display: 'flex',
    }}>
      <aside style={{
        width: '280px', backgroundColor: t.bg,
        borderRight: `1px solid ${t.border}`,
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        position: 'sticky', top: 0, height: '100vh', flexShrink: 0,
        transition: 'background-color 0.3s',
      }} className="hidden md:flex">
        <div>
          {/* Brand */}
          <div style={{ padding: '28px 24px', borderBottom: `1px solid ${t.border}` }}>
            <h1 style={{
              fontSize: '32px', fontWeight: 900, margin: 0,
              letterSpacing: '-0.03em',
            }}>AVISHU</h1>
            <p style={{
              fontSize: '10px', fontWeight: 800, letterSpacing: '3px',
              color: t.textMuted, marginTop: '6px', display: 'flex', alignItems: 'center', gap: '6px',
            }}>
              <Layers size={10} /> УПРАВЛЕНИЕ ФРАНШИЗОЙ
            </p>
          </div>

          {/* Nav */}
          <nav style={{ padding: '8px 0' }}>
            <div style={{
              padding: '14px 24px', fontWeight: 800, fontSize: '13px',
              display: 'flex', alignItems: 'center', gap: '12px',
              backgroundColor: t.bgInverse, color: t.textInverse,
              borderLeft: `4px solid ${t.indigo}`,
              cursor: 'pointer',
            }}>
              <BarChart3 size={16} /> КАНБАН-ДОСКА
            </div>
          </nav>

          {/* Quick Stats */}
          <div style={{ padding: '16px 24px', borderTop: `1px solid ${t.border}` }}>
            <p style={{
              fontSize: '10px', fontWeight: 800, letterSpacing: '2px',
              color: t.textMuted, marginBottom: '12px',
            }}>БЫСТРАЯ СВОДКА</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {ORDER_STAGES.map(stage => {
                const count = orders.filter(o => o.status === stage).length;
                const sc = STAGE_COLORS[stage] || {};
                return (
                  <div key={stage} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '8px 12px', backgroundColor: t.bgSurface,
                    borderLeft: `3px solid ${sc.accent || t.borderAccent}`,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {STAGE_ICONS[stage]}
                      <span style={{ fontSize: '12px', fontWeight: 700 }}>{stage}</span>
                    </div>
                    <span style={{
                      fontSize: '16px', fontWeight: 900, color: sc.accent,
                      fontVariantNumeric: 'tabular-nums',
                    }}>{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* User Panel */}
        <div style={{ borderTop: `1px solid ${t.border}`, padding: '20px 24px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px',
          }}>
            {/* Avatar */}
            <div style={{
              width: '36px', height: '36px',
              backgroundColor: t.bgInverse, color: t.textInverse,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 900, fontSize: '14px', flexShrink: 0,
            }}>
              {user?.name?.charAt(0)?.toUpperCase() || 'F'}
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontWeight: 800, fontSize: '13px', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.name?.toUpperCase() || 'ФРАНЧАЙЗИ'}
              </p>
              <p style={{ fontSize: '10px', fontWeight: 700, color: t.textMuted, margin: 0, letterSpacing: '1px' }}>
                {dateStr.toUpperCase()} • {timeStr}
              </p>
            </div>
          </div>
        </div>
      </aside>

      <div className="md:hidden" style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        backgroundColor: t.bg, borderBottom: `2px solid ${t.borderAccent}`,
        padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} style={{
            border: `2px solid ${t.borderAccent}`, background: 'none',
            color: t.text, padding: '6px', cursor: 'pointer',
            display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center',
          }}>
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          <h1 style={{ fontSize: '22px', fontWeight: 900, margin: 0, letterSpacing: '-0.02em' }}>AVISHU</h1>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <ThemeToggle />
          <button onClick={logout} style={{
            border: `2px solid ${t.borderAccent}`, background: 'none',
            color: t.text, fontWeight: 800, padding: '6px', cursor: 'pointer',
            width: '40px', height: '40px', boxSizing: 'border-box',
            display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center',
          }}>
            <LogOut size={18} style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }} />
          </button>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden animate-fade-up" style={{
          position: 'fixed', top: '54px', left: 0, right: 0, zIndex: 99,
          backgroundColor: t.bg, borderBottom: `2px solid ${t.borderAccent}`,
          padding: '16px',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {ORDER_STAGES.map(stage => {
              const count = orders.filter(o => o.status === stage).length;
              const sc = STAGE_COLORS[stage] || {};
              return (
                <div key={stage} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 12px', backgroundColor: t.bgSurface,
                  borderLeft: `3px solid ${sc.accent || t.borderAccent}`,
                }}>
                  <span style={{ fontSize: '13px', fontWeight: 700 }}>{stage}</span>
                  <span style={{ fontWeight: 900, color: sc.accent }}>{count}</span>
                </div>
              );
            })}
          </div>
          <p style={{ fontSize: '10px', fontWeight: 700, color: t.textMuted, marginTop: '12px', textAlign: 'center' }}>
            {user?.name?.toUpperCase()} • {dateStr.toUpperCase()}
          </p>
        </div>
      )}

      <main style={{
        flex: 1, overflow: 'auto',
        padding: '32px',
        paddingTop: '32px',
      }} className="md:p-8 lg:p-10">
        {/* Mobile spacer */}
        <div className="md:hidden" style={{ height: '54px' }} />

        <div className="animate-fade-in" style={{
          display: 'flex', flexDirection: 'column', flexWrap: 'nowrap',
          justifyContent: 'space-between', alignItems: 'flex-start',
          marginTop: '36px', marginBottom: '36px', gap: '16px',
        }}>
          <div>
            <h2 style={{
              fontSize: '28px', fontWeight: 900, margin: 0,
              letterSpacing: '-0.03em',
              display: 'flex', alignItems: 'center', gap: '12px',
            }}>
              <BarChart3 size={24} style={{ color: t.indigo }} />
              ДАШБОРД
            </h2>
            <p style={{
              fontSize: '12px', fontWeight: 700, color: t.textMuted,
              marginTop: '6px', letterSpacing: '0.5px',
            }}>
              {dateStr.toUpperCase()} • {timeStr} • {orders.length} ЗАКАЗОВ ВСЕГО
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="hidden md:flex items-center gap-2">
              <ThemeToggle />
              <button
                type="button"
                onClick={logout}
                aria-label="Выйти"
                style={{
                  border: `2px solid ${t.borderAccent}`, background: 'none',
                  color: t.text, fontWeight: 800, padding: '6px', cursor: 'pointer',
                  width: '40px', height: '40px', boxSizing: 'border-box',
                  display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <LogOut size={18} />
              </button>
            </div>
            <button
              onClick={() => setMetricsExpanded(!metricsExpanded)}
              style={{
                display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '6px',
                padding: '8px 14px', fontSize: '11px', fontWeight: 800,
                border: `2px solid ${t.borderStrong}`, backgroundColor: 'transparent',
                color: t.textSecondary, cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {metricsExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              МЕТРИКИ
            </button>
          </div>
        </div>

        {metricsExpanded && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px',
            marginBottom: '40px',
          }} className="stagger-children">
            <MetricCard
              t={t}
              isLoading={isLoading}
              icon={<TrendingUp size={14} />}
              label="ВЫРУЧКА СЕГОДНЯ"
              value={`${revenueToday.toLocaleString()} ₸`}
              sub={`${todayOrders.length} ЗАКАЗОВ`}
              color={t.green}
              delay={0}
            />
            <MetricCard
              t={t}
              isLoading={isLoading}
              icon={<Calendar size={14} />}
              label="ЗА НЕДЕЛЮ"
              value={`${revenueWeek.toLocaleString()} ₸`}
              sub={`${weekOrders.length} ЗАКАЗОВ`}
              color={t.indigo}
              delay={0.06}
            />
            <MetricCard
              t={t}
              isLoading={isLoading}
              icon={<DollarSign size={14} />}
              label="ВСЕГО"
              value={`${totalRevenue.toLocaleString()} ₸`}
              sub={`СРЕДНИЙ ЧЕК: ${avgOrderValue.toLocaleString()} ₸`}
              color={t.yellow}
              delay={0.12}
            />
            <MetricCard
              t={t}
              isLoading={isLoading}
              icon={<Target size={14} />}
              label="ВЫПОЛНЕНИЕ"
              value={`${fulfillmentRate}%`}
              sub={`${completedOrders.length} ИЗ ${orders.length}`}
              color={Number(fulfillmentRate) >= 70 ? t.green : Number(fulfillmentRate) >= 40 ? t.yellow : t.red}
              progress={Number(fulfillmentRate)}
              delay={0.18}
            />
            <MetricCard
              t={t}
              isLoading={isLoading}
              icon={<Clock size={14} />}
              label="В ОЧЕРЕДИ"
              value={activeOrders.length}
              sub={`${completedOrders.length} ЗАВЕРШЕНО`}
              delay={0.24}
            />
            <MetricCard
              t={t}
              isLoading={isLoading}
              icon={<Users size={14} />}
              label="КЛИЕНТЫ"
              value={uniqueClients.length}
              sub="УНИКАЛЬНЫХ"
              color="#8b5cf6"
              delay={0.30}
            />
          </div>
        )}

        <section className="animate-fade-up" style={{
          animationDelay: '0.2s',
          backgroundColor: t.bgInverse, color: t.textInverse,
          padding: '28px',
          boxShadow: `6px 6px 0 ${t.shadowBrutal}`,
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: 0, right: 0,
            width: '120px', height: '120px',
            background: `linear-gradient(135deg, transparent 50%, ${isDark ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.08)'} 50%)`,
          }} />

          {/* Board Header */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            borderBottom: `2px solid ${isDark ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.15)'}`,
            paddingBottom: '20px', marginBottom: '24px',
            flexWrap: 'wrap', gap: '12px',
            position: 'relative', zIndex: 1,
          }}>
            <div>
              <h2 style={{
                fontSize: '22px', fontWeight: 900, margin: 0,
                display: 'flex', alignItems: 'center', gap: '10px',
                letterSpacing: '-0.02em',
              }}>
                <Layers size={18} />
                ОТСЛЕЖИВАНИЕ ЗАКАЗОВ
              </h2>
              <p style={{ fontSize: '11px', fontWeight: 700, opacity: 0.5, marginTop: '4px' }}>
                ПЕРЕМЕЩАЙТЕ ЗАКАЗЫ ПО ЭТАПАМ
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  style={{
                    display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '4px',
                    padding: '8px 12px', fontSize: '11px', fontWeight: 800,
                    backgroundColor: t.red, color: '#fff',
                    border: 'none', cursor: 'pointer',
                  }}
                >
                  <X size={12} /> СБРОС
                </button>
              )}
              <button
                onClick={() => setShowFilters(!showFilters)}
                style={{
                  display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px', padding: '10px 18px',
                  fontSize: '12px', fontWeight: 800, border: '2px solid',
                  backgroundColor: showFilters ? (isDark ? '#000' : '#fff') : 'transparent',
                  color: showFilters ? (isDark ? '#fff' : '#000') : 'inherit',
                  borderColor: showFilters ? (isDark ? '#000' : '#fff') : 'currentColor',
                  cursor: 'pointer', transition: 'all 0.2s',
                  letterSpacing: '1px',
                }}
              >
                <Filter size={14} />
                ФИЛЬТРЫ
                {hasActiveFilters && (
                  <span style={{
                    backgroundColor: t.green, color: '#fff',
                    padding: '1px 6px', fontSize: '10px', fontWeight: 900,
                    marginLeft: '4px',
                  }}>{filteredOrders.length}</span>
                )}
              </button>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="animate-fade-up" style={{
              marginBottom: '24px', padding: '20px',
              border: `1px solid ${isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.15)'}`,
              backgroundColor: isDark ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.05)',
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                {/* Type filter */}
                <div>
                  <p style={{ fontSize: '10px', fontWeight: 800, opacity: 0.4, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px', letterSpacing: '2px' }}>
                    <Package size={11} /> ТИП
                  </p>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {[['ALL', 'ВСЕ'], ['IN_STOCK', 'В НАЛИЧИИ'], ['PREORDER', 'ПРЕДЗАКАЗ']].map(([val, label]) => (
                      <FilterChip key={val} t={t} active={filterType === val} onClick={() => setFilterType(val)}>
                        {label}
                      </FilterChip>
                    ))}
                  </div>
                </div>
                {/* Date filter */}
                <div>
                  <p style={{ fontSize: '10px', fontWeight: 800, opacity: 0.4, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px', letterSpacing: '2px' }}>
                    <Calendar size={11} /> ПЕРИОД
                  </p>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {[['ALL', 'ВСЕ'], ['TODAY', 'СЕГОДНЯ'], ['WEEK', 'НЕДЕЛЯ']].map(([val, label]) => (
                      <FilterChip key={val} t={t} active={filterDate === val} onClick={() => setFilterDate(val)}>
                        {label}
                      </FilterChip>
                    ))}
                  </div>
                </div>
                {/* Client filter */}
                <div>
                  <p style={{ fontSize: '10px', fontWeight: 800, opacity: 0.4, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px', letterSpacing: '2px' }}>
                    <Users size={11} /> КЛИЕНТ
                  </p>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    <FilterChip t={t} active={filterClient === 'ALL'} onClick={() => setFilterClient('ALL')}>ВСЕ</FilterChip>
                    {uniqueClients.map(c => (
                      <FilterChip key={c} t={t} active={filterClient === c} onClick={() => setFilterClient(c)}>{c}</FilterChip>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div style={{
            display: 'flex', gap: '20px', overflowX: 'auto',
            paddingBottom: '8px',
          }}>
            {ORDER_STAGES.map(stage => {
              const columnOrders = filteredOrders.filter(o => o.status === stage);
              const sc = STAGE_COLORS[stage] || {};
              const columnRevenue = columnOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);

              return (
                <div key={stage} style={{ flex: 1, minWidth: '280px' }}>
                  {/* Column Header */}
                  <div style={{
                    borderTop: `3px solid ${sc.accent || 'currentColor'}`,
                    paddingTop: '12px', marginBottom: '16px',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <h3 style={{
                        fontWeight: 900, fontSize: '16px', margin: 0,
                        display: 'flex', alignItems: 'center', gap: '8px',
                      }}>
                        {STAGE_ICONS[stage]}
                        {stage}
                      </h3>
                      <span style={{
                        backgroundColor: sc.accent || 'currentColor', color: '#fff',
                        width: '28px', height: '28px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 900, fontSize: '13px',
                      }}>{columnOrders.length}</span>
                    </div>
                    <p style={{ fontSize: '10px', fontWeight: 700, opacity: 0.4, margin: 0, fontVariantNumeric: 'tabular-nums' }}>
                      {columnRevenue.toLocaleString()} ₸
                    </p>
                  </div>

                  {/* Cards */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {isLoading ? (
                      Array.from({ length: 2 }).map((_, i) => (
                        <div key={i} style={{
                          padding: '16px', height: '120px',
                          backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.08)',
                        }}>
                          <div className="skeleton-box" style={{ height: '12px', width: '60%', marginBottom: '8px' }} />
                          <div className="skeleton-box" style={{ height: '16px', width: '90%', marginBottom: '12px' }} />
                          <div className="skeleton-box" style={{ height: '10px', width: '40%' }} />
                        </div>
                      ))
                    ) : columnOrders.length === 0 ? (
                      <div style={{
                        height: '120px',
                        border: `2px dashed ${isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.15)'}`,
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center', gap: '8px',
                        fontWeight: 800, fontSize: '12px', opacity: 0.3,
                        letterSpacing: '1px',
                      }}>
                        <Package size={20} />
                        ПУСТО
                      </div>
                    ) : columnOrders.map(order => (
                      <OrderCard
                        key={order.id}
                        t={t}
                        order={order}
                        expandedId={expandedCard}
                        onExpandChange={setExpandedCard}
                        onMoveOrder={handleMoveOrder}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Footer */}
        <div style={{
          marginTop: '40px', paddingTop: '20px',
          borderTop: `1px solid ${t.border}`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: '8px',
        }}>
          <p style={{ fontSize: '10px', fontWeight: 700, color: t.textMuted, letterSpacing: '2px', margin: 0 }}>
            AVISHU — панель франчайзи
          </p>
          <p style={{ fontSize: '10px', fontWeight: 700, color: t.textMuted, letterSpacing: '1px', margin: 0 }}>
            {orders.length} ЗАКАЗОВ • {uniqueClients.length} КЛИЕНТОВ • {totalRevenue.toLocaleString()} ₸
          </p>
        </div>
      </main>
    </div>
  );
}
