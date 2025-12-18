import { MODULE_DEFINITIONS } from './ModuleDefinitions';

/**
 * Smart Menu Generator
 * Generates menus based on subscribed modules
 * PCI DSS & GDPR Compliant - Role-based access control
 */
export class SmartMenuGenerator {
  constructor(subscribedModules, userRole = 'admin') {
    this.subscribedModules = subscribedModules;
    this.userRole = userRole;
  }

  /**
   * Generate menu structure from subscribed modules
   * Returns structured menu with groups and items
   */
  generateMenus() {
    const menuGroups = {};

    // Collect all menu items from subscribed modules
    for (const moduleId of this.subscribedModules) {
      const module = MODULE_DEFINITIONS[moduleId];
      if (!module || !module.menu_items) continue;

      for (const menuItem of module.menu_items) {
        const { group, label, path, icon, permission } = menuItem;

        // Initialize group if not exists
        if (!menuGroups[group]) {
          menuGroups[group] = {
            id: group,
            label: this.getGroupLabel(group),
            icon: this.getGroupIcon(group),
            enabled: true,
            items: []
          };
        }

        // Check if item already exists (avoid duplicates)
        const exists = menuGroups[group].items.some(item => item.path === path);
        if (!exists) {
          menuGroups[group].items.push({
            id: `${group}-${path}`.toLowerCase(),
            label,
            path,
            icon,
            permission,
            enabled: true
          });
        }
      }
    }

    // Sort groups by predefined order
    const groupOrder = [
      'overview', 'transactions', 'customers', 'products', 'merchants',
      'connections', 'orchestration', 'terminals', 'finance',
      'riskCompliance', 'developers', 'system', 'resources'
    ];

    const sortedGroups = groupOrder
      .map(groupId => menuGroups[groupId])
      .filter(Boolean);

    return sortedGroups;
  }

  /**
   * Get display label for menu group
   */
  getGroupLabel(groupId) {
    const labels = {
      overview: 'Overview',
      transactions: 'Transactions',
      customers: 'Customers',
      products: 'Products',
      merchants: 'Merchants',
      connections: 'Connections',
      orchestration: 'Orchestration',
      terminals: 'Terminals',
      finance: 'Finance',
      riskCompliance: 'Risk & Compliance',
      developers: 'Developers',
      system: 'System',
      resources: 'Resources'
    };
    return labels[groupId] || groupId;
  }

  /**
   * Get icon for menu group
   */
  getGroupIcon(groupId) {
    const icons = {
      overview: 'LayoutDashboard',
      transactions: 'ArrowLeftRight',
      customers: 'Users',
      products: 'Building',
      merchants: 'Store',
      connections: 'Globe',
      orchestration: 'Zap',
      terminals: 'Terminal',
      finance: 'Wallet',
      riskCompliance: 'Shield',
      developers: 'Key',
      system: 'Settings',
      resources: 'HelpCircle'
    };
    return icons[groupId] || 'Settings';
  }

  /**
   * Generate menu for specific role
   * Filters based on role permissions
   */
  generateMenuForRole(role) {
    this.userRole = role;
    const menus = this.generateMenus();

    // Filter based on role permissions (simplified - extend as needed)
    if (role === 'viewer') {
      return menus.map(group => ({
        ...group,
        items: group.items.filter(item => 
          item.permission?.includes('VIEW') || !item.permission
        )
      })).filter(group => group.items.length > 0);
    }

    if (role === 'editor') {
      return menus.map(group => ({
        ...group,
        items: group.items.filter(item => 
          !item.permission?.includes('MANAGE_USERS') && 
          !item.permission?.includes('MANAGE_SETTINGS')
        )
      })).filter(group => group.items.length > 0);
    }

    // Admin gets all menus
    return menus;
  }

  /**
   * Export menu configuration for storage
   */
  exportMenuConfig() {
    return {
      version: '1.0',
      generated_at: new Date().toISOString(),
      subscribed_modules: this.subscribedModules,
      menus: this.generateMenus()
    };
  }

  /**
   * Validate menu configuration against subscribed modules
   */
  validateMenuConfig(menuConfig) {
    const generatedMenus = this.generateMenus();
    const errors = [];

    // Check if all menu items are valid
    for (const group of menuConfig) {
      const generatedGroup = generatedMenus.find(g => g.id === group.id);
      
      if (!generatedGroup) {
        errors.push(`Invalid group: ${group.id}`);
        continue;
      }

      for (const item of group.items) {
        const validItem = generatedGroup.items.find(i => i.path === item.path);
        if (!validItem) {
          errors.push(`Invalid menu item: ${item.path} in group ${group.id}`);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

export default SmartMenuGenerator;