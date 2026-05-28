import { usePriceStore } from '../store/usePriceStore';
import type { PricingRule, Supplier } from '../env.d.ts';

export const usePricingManager = () => {

    const {
        suppliers,
        global_ml_commission: globalCommission,
        tax_percent: taxPercent,
        setGlobalSettings,
        setSuppliers,
        importConfig,
    } = usePriceStore();

    // Helper para actualizar las configuraciones globales de forma transparente
    const setGlobalCommission = (commission: number) => setGlobalSettings(commission, taxPercent);
    const setTaxPercent = (tax: number) => setGlobalSettings(globalCommission, tax);

    const addRange = (supplierId: string) => {
        const updatedSuppliers = suppliers.map(s => {
            if (s.id === supplierId) {
                const lastRule = s.rules[s.rules.length - 1];
                const round2 = (num: number) => Math.round(num * 100) / 100;

                let newMin = 0.01;
                let newMax = 50.00;
                
                if (lastRule) {
                    // El nuevo mínimo es el MÁXIMO anterior (sell_cost) más un centavo
                    newMin = round2((lastRule.sell_cost || 0) + 0.01);
                    // El nuevo máximo le suma un bloque predictivo de 50 al nuevo mínimo
                    newMax = round2(newMin + 49.99); 
                }

                return {
                ...s,
                rules: [...s.rules, {
                    id: crypto.randomUUID(),
                    sup_cost: newMin,
                    sell_cost: newMax,
                    fixed_markup: 0,
                    percentage_markup: 0,
                    ml_commission_percent: globalCommission
                }]
                };
            }
            return s;
        });

        setSuppliers(updatedSuppliers);
    };

    const updateRule = (supplierId: string, ruleId: string, updates: Partial<PricingRule>) => {
        const updatedSuppliers = suppliers.map(s => {
            if (s.id === supplierId) {
                return {
                ...s,
                rules: s.rules.map(r => r.id === ruleId ? { ...r, ...updates } : r)
                };
            }
            return s;
        });
        setSuppliers(updatedSuppliers);
    };

    const removeRange = (supplierId: string, ruleId: string) => {
        const updatedSuppliers = suppliers.map(s => {
            if (s.id === supplierId) {
                return { ...s, rules: s.rules.filter(r => r.id !== ruleId) };
            }
            return s;
        });
        setSuppliers(updatedSuppliers);
    };

    const updateSupplierSettings = (supplierId: string, updates: Partial<Supplier>) => {
        usePriceStore.getState().updateSupplier(supplierId, updates)
    }

    return {
        suppliers,
        globalCommission,
        taxPercent,
        setGlobalCommission,
        setSuppliers,
        setTaxPercent,
        addRange,
        updateRule,
        updateSupplierSettings,
        removeRange,
        importConfig
    };
};