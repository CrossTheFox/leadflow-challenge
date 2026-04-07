// src/hooks/useDashboard.ts
import { useLeads } from "./useLeads";
import { useLeadMetrics } from "./useLeadMetrics"; 

export function useDashboard() {
    const { stats, isLoading, fetchData } = useLeads(); 
    const metrics = useLeadMetrics();

    const pipeline = stats?.pipeline || [];
    const recentWebhooks = stats?.recent_webhooks || [];
    const recentActivities = stats?.recent_activities || [];
    const sources = stats?.sources || [];

    return { 
        metrics,
        pipeline,
        recentWebhooks, 
        recentActivities,
        sources,
        isLoading,
        fetchData,
    };
}