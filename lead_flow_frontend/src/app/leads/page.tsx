// src/app/leads/page.tsx
"use client"

import { useLeads } from "@/hooks/useLeads"
import { DataTable } from "@/components/leads/data-table"
import { columns } from "@/components/leads/columns"
import { CreateLeadForm } from "@/components/leads/CreateLeadForm" 

export default function LeadsPage() {
    const { leads, isLoading, users } = useLeads()

    return (
        <div className="p-8 max-w-7xl mx-auto flex flex-col h-[calc(100vh-80px)] overflow-hidden animate-in fade-in duration-500">

            <div className="mb-6 flex items-center justify-between shrink-0"> 
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Gestión de Contactos</h1>
                    <p className="text-slate-500">Administra, filtra y asigna leads a tu equipo comercial.</p>
                </div>
                
                <CreateLeadForm />
            </div>
            
            {isLoading ? (
                <div className="text-slate-500 flex-1 flex items-center justify-center">Cargando base de datos...</div>
            ) : (
                <div className="flex-1 min-h-0">
                    <DataTable columns={columns} data={leads} users={users} />
                </div>
            )}
        </div>
    )
}