/** Этапы заказа — общие для клиента, франчайзи и производства */
export const ORDER_STAGES = ['ОФОРМЛЕН', 'НА ПОШИВЕ', 'ГОТОВО'];

export const ORDER_TYPES = {
  IN_STOCK: 'IN_STOCK',
  PREORDER: 'PREORDER',
};

export const ROLES = {
  CLIENT: 'client',
  FRANCHISEE: 'franchisee',
  PRODUCTION: 'production',
};

export const KNOWN_ROLE_SLUGS = ['client', 'franchisee', 'production'];

/** Роль из Firestore: регистр, franchise → franchisee, factory → production */
export function normalizeUserRole(role) {
  if (role == null || typeof role !== 'string') return role;
  const r = role.trim().toLowerCase();
  if (r === 'franchise') return 'franchisee';
  if (r === 'factory') return 'production';
  if (KNOWN_ROLE_SLUGS.includes(r)) return r;
  return role.trim();
}

export const STATUS_TRANSITIONS = {
  'ОФОРМЛЕН': 'НА ПОШИВЕ',
  'НА ПОШИВЕ': 'ГОТОВО',
};
