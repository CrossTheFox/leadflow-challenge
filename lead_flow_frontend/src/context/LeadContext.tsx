'use client';

import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { DashboardStats, Lead, User } from '@/types';
import * as api from '@/lib/api'; 

interface LeadContextType {
    leads: Lead[];
    users: User[];
    stats: DashboardStats | null;
    isLoading: boolean;
    error: string | null;
    fetchData: () => Promise<void>;
    addLead: (leadData: Partial<Lead>) => Promise<void>;
    changeLeadStatus: (id: number, newStatus: string) => Promise<void>;
    changeLeadAssignment: (id: number, assignedTo: number | null) => Promise<void>;
}

export const LeadContext = createContext<LeadContextType | undefined>(undefined);

export function LeadProvider({ children }: { children: ReactNode }) {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [leadsData, statsData, usersData] = await Promise.all([
                api.getLeads(),
                api.getDashboardStats(),
                api.getUsers()
            ]);
            setLeads(leadsData);
            setStats(statsData);
            setUsers(usersData);
            setError(null);
        } catch (err) {
            setError('Error al cargar los datos del servidor');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const addLead = async (leadData: Partial<Lead>) => {
        try {
            const newLead = await api.createLead(leadData);
            setLeads(prev => [newLead, ...prev]); 
        } catch (err) {
            throw new Error("Error al crear el lead");
        }
    };

    const changeLeadStatus = async (id: number, newStatus: string) => {
        try {
            await api.updateLead(id, { status: newStatus });
            await fetchData(); 
        } catch (err) {
            console.error("Error cambiando estado", err);
        }
    };

    const changeLeadAssignment = async (id: number, assignedTo: number | null) => {
        try {
            await api.updateLead(id, { assigned_to: assignedTo });
            await fetchData();
        } catch (err) {
            console.error("Error cambiando asignación", err);
        }
    };

    // ----- Carga inicial de datos al montar el componente -----
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return (
        <LeadContext.Provider value={{ leads, stats, isLoading, error, fetchData, addLead, changeLeadStatus, changeLeadAssignment, users }}>
            {children}
        </LeadContext.Provider>
    );
}