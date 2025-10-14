// Utility functions for authentication and role checking

export const ROLES = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Admin',
  STAFF: 'Staff',
  SUPPORT: 'Support',
  CUSTOMER: 'Customer',
  USER: 'User',
};

export const ROLE_HIERARCHY = {
  [ROLES.SUPER_ADMIN]: 5,
  [ROLES.ADMIN]: 4,
  [ROLES.STAFF]: 3,
  [ROLES.SUPPORT]: 2,
  [ROLES.CUSTOMER]: 1,
  [ROLES.USER]: 1,
};

export function hasRole(userRole, requiredRole) {
  if (!userRole || !requiredRole) return false;
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

export function isAdmin(userRole) {
  return [ROLES.SUPER_ADMIN, ROLES.ADMIN].includes(userRole);
}

export function isStaff(userRole) {
  return [ROLES.STAFF, ROLES.SUPPORT].includes(userRole);
}

export function isCustomer(userRole) {
  return [ROLES.CUSTOMER, ROLES.USER].includes(userRole);
}

export function canAccess(userRole, requiredRole) {
  return hasRole(userRole, requiredRole);
}

// Role-based access control for different sections
export const ACCESS_CONTROL = {
  // Admin only sections
  ADMIN_PANEL: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
  USER_MANAGEMENT: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
  
  // Staff sections
  ORDER_MANAGEMENT: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.STAFF],
  PRODUCT_MANAGEMENT: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.STAFF],
  
  // Support sections
  CUSTOMER_SUPPORT: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.STAFF, ROLES.SUPPORT],
  
  // Customer sections
  PROFILE: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.STAFF, ROLES.SUPPORT, ROLES.CUSTOMER, ROLES.USER],
  ORDERS: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.STAFF, ROLES.SUPPORT, ROLES.CUSTOMER, ROLES.USER],
  CART: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.STAFF, ROLES.SUPPORT, ROLES.CUSTOMER, ROLES.USER],
};

export function canAccessSection(userRole, section) {
  if (!userRole || !section) return false;
  return ACCESS_CONTROL[section]?.includes(userRole) || false;
}
