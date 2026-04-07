// src/hooks/useLeadDetail.ts
import { useState, useEffect, useCallback, useContext } from 'react';
import * as api from '@/lib/api';
import { LeadContext } from '@/context/LeadContext';

export function useLeadDetail(leadId: number) {
    const [lead, setLead] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    const { changeLeadStatus, changeLeadAssignment } = useContext(LeadContext)!;

    const fetchDetail = useCallback(async () => {
        setIsLoading(true);
        try {
            const leadData = await api.getLead(leadId);
            setLead(leadData);
        } catch (error) {
            console.error("Error cargando detalle", error);
        } finally {
            setIsLoading(false);
        }
    }, [leadId]);

    const updateLeadDetails = async (values: { status: string, assigned_to: string }) => {
        const newStatus = values.status;
        const newAssignee = values.assigned_to === "none" ? null : parseInt(values.assigned_to) || null;

        await Promise.all([
            changeLeadStatus(leadId, newStatus),
            changeLeadAssignment(leadId, newAssignee)
        ]);

        await fetchDetail();
    };

    useEffect(() => {
        if (leadId) fetchDetail();
    }, [leadId, fetchDetail]);

    return { lead, isLoading, updateLeadDetails };
}