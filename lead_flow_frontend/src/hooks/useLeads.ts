import { useContext } from 'react';
import { LeadContext } from '@/context/LeadContext';

export function useLeads() {
    const context = useContext(LeadContext);
    
    if (!context) {
        throw new Error("useLeads debe usarse dentro de un LeadProvider");
    }

    return context;
}