import { ArrowRight, Hash, Users } from 'lucide-react';
import { STATUS_TRANSITIONS } from '../../constants';

const STAGE_COLORS = {
  'ОФОРМЛЕН': { accent: '#6366f1', bg: 'rgba(99,102,241,0.08)' },
  'НА ПОШИВЕ': { accent: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
  'ГОТОВО': { accent: '#22c55e', bg: 'rgba(34,197,94,0.08)' },
};

export function FilterChip({ t, active, onClick, children, color }) {
  return (
    <button type="button" onClick={onClick} style={{
      padding: '6px 14px',
      fontSize: '11px',
      fontWeight: 800,
      letterSpacing: '0.5px',
      border: `2px solid ${active ? (color || t.borderAccent) : t.borderStrong}`,
      backgroundColor: active ? (color || t.bgInverse) : 'transparent',
      color: active ? t.textInverse : t.textSecondary,
      cursor: 'pointer',
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      textTransform: 'uppercase',
      display: 'inline-flex',
      flexWrap: 'wrap',
    }}>{children}</button>
  );
}

export function MetricCard({ t, isLoading, icon, label, value, sub, color, progress, delay = 0 }) {
  return (
    <div
      className="animate-fade-up"
      style={{
        animationDelay: `${delay}s`,
        backgroundColor: t.bg,
        border: `2px solid ${t.borderAccent}`,
        padding: '20px 24px',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: `4px 4px 0 ${t.shadowBrutal}`,
        transition: 'transform 0.2s, box-shadow 0.2s',
      }}
      onMouseOver={e => {
        e.currentTarget.style.transform = 'translate(-2px, -2px)';
        e.currentTarget.style.boxShadow = `6px 6px 0 ${t.shadowBrutal}`;
      }}
      onMouseOut={e => {
        e.currentTarget.style.transform = 'translate(0, 0)';
        e.currentTarget.style.boxShadow = `4px 4px 0 ${t.shadowBrutal}`;
      }}
    >
      <div style={{
        position: 'absolute', top: 0, left: 0, width: '100%', height: '3px',
        background: color || t.borderAccent
      }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <span style={{ color: color || t.textMuted }}>{icon}</span>
        <span style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '2px', color: t.textMuted, textTransform: 'uppercase' }}>
          {label}
        </span>
      </div>
      <p className="animate-pop" style={{
        animationDelay: `${delay + 0.15}s`,
        fontSize: '32px', fontWeight: 900, margin: '0 0 6px',
        color: color || t.text,
        letterSpacing: '-0.02em',
        fontVariantNumeric: 'tabular-nums',
      }}>
        {isLoading ? '—' : value}
      </p>
      {sub && (
        <p style={{ fontSize: '11px', fontWeight: 700, color: t.textMuted, margin: 0, letterSpacing: '0.5px' }}>
          {sub}
        </p>
      )}
      {progress !== undefined && (
        <div style={{ width: '100%', height: '4px', backgroundColor: t.border, marginTop: '14px' }}>
          <div style={{
            height: '100%',
            width: `${Math.min(progress, 100)}%`,
            backgroundColor: color,
            transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
          }} />
        </div>
      )}
    </div>
  );
}

export function OrderCard({ t, order, expandedId, onExpandChange, onMoveOrder }) {
  const nextStatus = STATUS_TRANSITIONS[order.status];
  const stageColor = STAGE_COLORS[order.status] || {};
  const isExpanded = expandedId === order.id;

  return (
    <div
      style={{
        padding: '16px',
        backgroundColor: t.bg,
        color: t.text,
        borderLeft: `4px solid ${stageColor.accent || t.borderAccent}`,
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer',
        boxShadow: isExpanded ? `3px 3px 0 ${t.shadowBrutal}` : 'none',
      }}
      onClick={() => onExpandChange(isExpanded ? null : order.id)}
      onMouseOver={e => {
        e.currentTarget.style.backgroundColor = t.bgCardHover;
      }}
      onMouseOut={e => {
        e.currentTarget.style.backgroundColor = t.bg;
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <Hash size={10} style={{ color: t.textMuted }} />
            <span style={{ fontSize: '10px', fontWeight: 800, color: t.textMuted, letterSpacing: '1px' }}>
              {order.id?.slice(0, 8).toUpperCase()}
            </span>
          </div>
          <h4 style={{
            fontWeight: 900, fontSize: '15px', margin: 0,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: isExpanded ? 'normal' : 'nowrap',
          }}>
            {(order.items || []).map(i => i.name).join(', ')}
          </h4>
        </div>
        <span style={{
          fontSize: '10px', fontWeight: 800, letterSpacing: '1px',
          padding: '3px 8px', backgroundColor: stageColor.accent, color: '#fff',
          flexShrink: 0, marginLeft: '8px',
        }}>
          {order.type === 'PREORDER' ? 'ПРЕДЗАКАЗ' : 'В НАЛИЧИИ'}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
        <Users size={12} style={{ color: t.textMuted }} />
        <span style={{ fontSize: '12px', fontWeight: 700, color: t.textSecondary }}>
          {order.clientName || 'НЕИЗВЕСТНО'}
        </span>
      </div>

      {isExpanded && (
        <div className="animate-fade-up" style={{
          margin: '12px 0',
          padding: '12px',
          backgroundColor: t.bgSurface,
          border: `1px solid ${t.border}`,
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '11px', fontWeight: 700 }}>
            <div>
              <span style={{ color: t.textMuted, display: 'block', marginBottom: '2px' }}>СОЗДАН</span>
              <span>{order.createdAt?.toDate?.()?.toLocaleDateString('ru-RU') || '—'}</span>
            </div>
            <div>
              <span style={{ color: t.textMuted, display: 'block', marginBottom: '2px' }}>СТАТУС</span>
              <span style={{ color: stageColor.accent }}>{order.status}</span>
            </div>
            {order.type === 'PREORDER' && order.preorderDate && (
              <div style={{ gridColumn: '1 / -1' }}>
                <span style={{ color: t.textMuted, display: 'block', marginBottom: '2px' }}>ДАТА ПРЕДЗАКАЗА</span>
                <span>{order.preorderDate}</span>
              </div>
            )}
            {order.items && order.items.length > 0 && (
              <div style={{ gridColumn: '1 / -1' }}>
                <span style={{ color: t.textMuted, display: 'block', marginBottom: '2px' }}>ТОВАРЫ</span>
                {order.items.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '4px' }}>
                    <span>{item.name}</span>
                    <span style={{ color: t.textMuted }}>×{item.quantity || 1}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        borderTop: `1px solid ${t.border}`, paddingTop: '10px',
      }}>
        <span style={{ fontWeight: 900, fontSize: '14px', fontVariantNumeric: 'tabular-nums' }}>
          {order.totalPrice?.toLocaleString() || 0} ₸
        </span>
        {nextStatus && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onMoveOrder(order); }}
            style={{
              display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '6px',
              padding: '6px 14px', fontSize: '11px', fontWeight: 800,
              backgroundColor: stageColor.accent || t.bgInverse,
              color: '#fff', border: 'none', cursor: 'pointer',
              transition: 'all 0.2s',
              letterSpacing: '0.5px',
            }}
            onMouseOver={e => {
              e.currentTarget.style.transform = 'translate(-1px, -1px)';
              e.currentTarget.style.boxShadow = `2px 2px 0 ${t.shadowBrutal}`;
            }}
            onMouseOut={e => {
              e.currentTarget.style.transform = 'translate(0, 0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <ArrowRight size={12} /> {nextStatus}
          </button>
        )}
      </div>
    </div>
  );
}
