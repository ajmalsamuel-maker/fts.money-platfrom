import { MODULE_DEFINITIONS } from './ModuleDefinitions';

/**
 * Module Dependency Engine
 * PCI DSS & GDPR Compliant dependency resolution
 */
export class ModuleDependencyEngine {
  constructor(availableModules = MODULE_DEFINITIONS) {
    this.modules = availableModules;
  }

  /**
   * Resolve all dependencies for a module
   * Returns array of module IDs including dependencies
   */
  resolveDependencies(moduleId, resolved = new Set(), resolving = new Set()) {
    if (resolved.has(moduleId)) {
      return Array.from(resolved);
    }

    if (resolving.has(moduleId)) {
      throw new Error(`Circular dependency detected: ${moduleId}`);
    }

    const module = this.modules[moduleId];
    if (!module) {
      throw new Error(`Module not found: ${moduleId}`);
    }

    resolving.add(moduleId);

    // Resolve dependencies recursively
    if (module.dependencies && module.dependencies.length > 0) {
      for (const depId of module.dependencies) {
        this.resolveDependencies(depId, resolved, resolving);
      }
    }

    resolving.delete(moduleId);
    resolved.add(moduleId);

    return Array.from(resolved);
  }

  /**
   * Check if modules have conflicts
   */
  checkConflicts(moduleIds) {
    const conflicts = [];
    
    for (const moduleId of moduleIds) {
      const module = this.modules[moduleId];
      if (module?.conflicts_with) {
        for (const conflictId of module.conflicts_with) {
          if (moduleIds.includes(conflictId)) {
            conflicts.push({
              module: moduleId,
              conflictsWith: conflictId,
              reason: `${module.module_name} conflicts with ${this.modules[conflictId]?.module_name}`
            });
          }
        }
      }
    }

    return conflicts;
  }

  /**
   * Validate module selection
   * Returns { valid: boolean, missingDependencies: [], conflicts: [] }
   */
  validateModuleSelection(selectedModuleIds) {
    const allRequiredModules = new Set();
    const errors = [];

    // Resolve all dependencies
    try {
      for (const moduleId of selectedModuleIds) {
        const resolved = this.resolveDependencies(moduleId);
        resolved.forEach(id => allRequiredModules.add(id));
      }
    } catch (error) {
      errors.push(error.message);
    }

    // Find missing dependencies
    const missingDependencies = Array.from(allRequiredModules)
      .filter(id => !selectedModuleIds.includes(id));

    // Check conflicts
    const conflicts = this.checkConflicts(selectedModuleIds);

    return {
      valid: errors.length === 0 && missingDependencies.length === 0 && conflicts.length === 0,
      missingDependencies,
      conflicts,
      errors,
      allRequiredModules: Array.from(allRequiredModules)
    };
  }

  /**
   * Get modules by subscription tier
   */
  getModulesByTier(tier) {
    const tierHierarchy = ['free', 'starter', 'professional', 'enterprise'];
    const tierIndex = tierHierarchy.indexOf(tier);
    
    return Object.values(this.modules).filter(module => {
      const moduleTierIndex = tierHierarchy.indexOf(module.subscription_tier);
      return moduleTierIndex <= tierIndex;
    });
  }

  /**
   * Get modules by category
   */
  getModulesByCategory(category) {
    return Object.values(this.modules).filter(
      module => module.module_category === category
    );
  }

  /**
   * Calculate total pricing for selected modules
   */
  calculatePricing(selectedModuleIds) {
    let monthlyFixed = 0;
    let transactionFees = 0;
    let perMerchantFees = 0;

    for (const moduleId of selectedModuleIds) {
      const module = this.modules[moduleId];
      if (!module) continue;

      const pricing = module.pricing_model;
      if (pricing.type === 'fixed_monthly' && pricing.base_price) {
        monthlyFixed += pricing.base_price;
      }
      if (pricing.type === 'per_transaction' && pricing.transaction_fee) {
        transactionFees += pricing.transaction_fee;
      }
      if (pricing.type === 'per_merchant' && pricing.base_price) {
        perMerchantFees += pricing.base_price;
      }
    }

    return {
      monthlyFixed,
      transactionFees: transactionFees * 100, // as percentage
      perMerchantFees
    };
  }

  /**
   * Check compliance requirements for modules
   */
  getComplianceRequirements(selectedModuleIds) {
    const requirements = new Set();
    
    for (const moduleId of selectedModuleIds) {
      const module = this.modules[moduleId];
      if (module?.compliance_requirements) {
        module.compliance_requirements.forEach(req => requirements.add(req));
      }
    }

    return Array.from(requirements);
  }

  /**
   * Get all features enabled by selected modules
   */
  getEnabledFeatures(selectedModuleIds) {
    const features = new Set();
    
    for (const moduleId of selectedModuleIds) {
      const module = this.modules[moduleId];
      if (module?.features) {
        module.features.forEach(feature => features.add(feature));
      }
    }

    return Array.from(features);
  }
}

export default ModuleDependencyEngine;