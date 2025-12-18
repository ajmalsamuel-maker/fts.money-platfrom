import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MODULE_DEFINITIONS, MODULE_CATEGORIES } from './ModuleDefinitions';
import ModuleDependencyEngine from './ModuleDependencyEngine';
import { 
  CheckCircle, 
  AlertTriangle, 
  Info,
  DollarSign,
  Shield,
  Zap,
  Lock
} from 'lucide-react';
import { cn } from "@/lib/utils";

export default function ModuleSelector({ selectedModules = [], onChange, subscriptionTier = 'professional' }) {
  const [selected, setSelected] = useState(new Set(selectedModules));
  const [validation, setValidation] = useState(null);
  const [pricing, setPricing] = useState(null);
  const engine = new ModuleDependencyEngine();

  useEffect(() => {
    validateSelection();
  }, [selected]);

  const validateSelection = () => {
    const selectedArray = Array.from(selected);
    const result = engine.validateModuleSelection(selectedArray);
    const pricingInfo = engine.calculatePricing(selectedArray);
    const compliance = engine.getComplianceRequirements(selectedArray);
    
    setValidation({ ...result, compliance });
    setPricing(pricingInfo);
  };

  const handleToggle = (moduleId) => {
    const newSelected = new Set(selected);
    
    if (newSelected.has(moduleId)) {
      newSelected.delete(moduleId);
    } else {
      newSelected.add(moduleId);
      
      // Auto-add dependencies
      const module = MODULE_DEFINITIONS[moduleId];
      if (module?.dependencies) {
        module.dependencies.forEach(dep => newSelected.add(dep));
      }
    }

    setSelected(newSelected);
    onChange(Array.from(newSelected));
  };

  const getCategoryColor = (category) => {
    const colors = {
      core: 'blue',
      payments: 'green',
      payouts: 'purple',
      merchants: 'orange',
      risk_compliance: 'red',
      analytics: 'cyan',
      integrations: 'indigo',
      advanced: 'pink'
    };
    return colors[category] || 'slate';
  };

  const isModuleLocked = (module) => {
    const tierHierarchy = ['free', 'starter', 'professional', 'enterprise'];
    const userTierIndex = tierHierarchy.indexOf(subscriptionTier);
    const moduleTierIndex = tierHierarchy.indexOf(module.subscription_tier);
    return moduleTierIndex > userTierIndex;
  };

  const modulesByCategory = {};
  Object.values(MODULE_DEFINITIONS).forEach(module => {
    if (!modulesByCategory[module.module_category]) {
      modulesByCategory[module.module_category] = [];
    }
    modulesByCategory[module.module_category].push(module);
  });

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Selected Modules</p>
                <p className="text-2xl font-bold">{selected.size}</p>
              </div>
              <Zap className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Monthly Cost</p>
                <p className="text-2xl font-bold">${pricing?.monthlyFixed || 0}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Compliance</p>
                <p className="text-xl font-bold">{validation?.compliance?.length || 0} Standards</p>
              </div>
              <Shield className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Validation Alerts */}
      {validation?.missingDependencies?.length > 0 && (
        <Alert className="bg-amber-50 border-amber-200">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            <strong>Missing Dependencies:</strong> {validation.missingDependencies.map(id => MODULE_DEFINITIONS[id]?.module_name).join(', ')} will be automatically added.
          </AlertDescription>
        </Alert>
      )}

      {validation?.conflicts?.length > 0 && (
        <Alert className="bg-red-50 border-red-200">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Conflicts Detected:</strong> {validation.conflicts.map(c => c.reason).join('; ')}
          </AlertDescription>
        </Alert>
      )}

      {validation?.compliance?.length > 0 && (
        <Alert className="bg-blue-50 border-blue-200">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Compliance Standards:</strong> {validation.compliance.join(', ')}
          </AlertDescription>
        </Alert>
      )}

      {/* Module Selection by Category */}
      <Tabs defaultValue="core" className="w-full">
        <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${Object.keys(MODULE_CATEGORIES).length}, 1fr)` }}>
          {Object.entries(MODULE_CATEGORIES).map(([key, cat]) => (
            <TabsTrigger key={key} value={key}>{cat.label}</TabsTrigger>
          ))}
        </TabsList>

        {Object.entries(modulesByCategory).map(([category, modules]) => (
          <TabsContent key={category} value={category} className="space-y-3 mt-4">
            {modules.map(module => {
              const isSelected = selected.has(module.module_id);
              const isLocked = isModuleLocked(module);
              const isDependency = validation?.missingDependencies?.includes(module.module_id);

              return (
                <Card 
                  key={module.module_id}
                  className={cn(
                    "transition-all cursor-pointer hover:shadow-md",
                    isSelected && "border-blue-500 bg-blue-50",
                    isLocked && "opacity-60 cursor-not-allowed"
                  )}
                  onClick={() => !isLocked && handleToggle(module.module_id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Checkbox 
                          checked={isSelected}
                          disabled={isLocked}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div>
                          <CardTitle className="text-base flex items-center gap-2">
                            {module.module_name}
                            {isLocked && <Lock className="h-4 w-4 text-slate-400" />}
                            {isDependency && (
                              <Badge variant="outline" className="text-xs">Required</Badge>
                            )}
                          </CardTitle>
                          <CardDescription className="text-sm mt-1">
                            {module.description}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge className={`bg-${getCategoryColor(category)}-100 text-${getCategoryColor(category)}-700`}>
                          {module.subscription_tier}
                        </Badge>
                        {module.pricing_model.type !== 'included' && (
                          <span className="text-sm font-semibold text-slate-700">
                            {module.pricing_model.type === 'fixed_monthly' && `$${module.pricing_model.base_price}/mo`}
                            {module.pricing_model.type === 'per_transaction' && `${(module.pricing_model.transaction_fee * 100).toFixed(2)}% per txn`}
                            {module.pricing_model.type === 'per_merchant' && `$${module.pricing_model.base_price}/merchant`}
                          </span>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex flex-wrap gap-2 text-xs">
                      {module.compliance_requirements?.map(comp => (
                        <Badge key={comp} variant="outline" className="text-xs">
                          <Shield className="h-3 w-3 mr-1" />
                          {comp}
                        </Badge>
                      ))}
                      {module.dependencies?.length > 0 && (
                        <Badge variant="outline" className="text-xs text-amber-600 border-amber-300">
                          Requires: {module.dependencies.length} module(s)
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>
        ))}
      </Tabs>

      {/* Summary */}
      {pricing && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-blue-600" />
              Pricing Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span>Monthly Fixed Cost:</span>
              <span className="font-semibold">${pricing.monthlyFixed}</span>
            </div>
            {pricing.transactionFees > 0 && (
              <div className="flex justify-between">
                <span>Transaction Fees:</span>
                <span className="font-semibold">{pricing.transactionFees.toFixed(3)}% per transaction</span>
              </div>
            )}
            {pricing.perMerchantFees > 0 && (
              <div className="flex justify-between">
                <span>Per Merchant:</span>
                <span className="font-semibold">${pricing.perMerchantFees}/merchant/month</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}