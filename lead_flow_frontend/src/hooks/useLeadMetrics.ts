// src/hooks/useLeadMetrics.ts
import { useLeads } from './useLeads';
import { LEAD_STATUSES } from '@/constants';

export const useLeadMetrics = () => {
    const { leads, stats } = useLeads();

    // Métricas de Leads
    const totalLeads = leads.length;
    const wonLeads = leads.filter(l => l.status === LEAD_STATUSES.WON).length;
    const conversionRate = totalLeads === 0 ? 0 : Math.round((wonLeads / totalLeads) * 100);

    // Métricas de Webhooks
    const webhooksTotal = stats?.webhooks?.total || 0;
    const webhooksSuccess = stats?.webhooks?.success || 0;
    const webhooksFailed = stats?.webhooks?.failed || 0;
    
    const successRate = webhooksTotal > 0 
        ? Math.round((webhooksSuccess / webhooksTotal) * 100) 
        : 0;

    return {
        totalLeads,
        conversionRate,
        successRate,
        webhooks: {
            total: webhooksTotal,
            success: webhooksSuccess,
            failed: webhooksFailed
        }
    };
};