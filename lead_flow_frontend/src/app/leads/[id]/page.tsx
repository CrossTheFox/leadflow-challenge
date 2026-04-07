// src/app/leads/[id]/page.tsx
"use client";

import { useLeadDetail } from "@/hooks/useLeadDetail";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Mail, Phone, Globe, Calendar, AlertCircle, Activity, Save, Users } from "lucide-react";
import Link from "next/link";
import { useContext, useState } from "react";
import { LEAD_STATUSES } from "@/constants";
import { LeadContext } from "@/context/LeadContext";
import { getStatusVariant, formatDate } from "@/lib/utils";

const updateSchema = Yup.object({
    status: Yup.string().required("El estado es requerido"),
    assigned_to: Yup.string().required("Debe asignar un responsable")
});

export default function LeadDetailPage({ params }: { params: { id: string } }) {
    const leadId = parseInt(params.id);

    const { users } = useContext(LeadContext)!;
    const { lead, isLoading, updateLeadDetails } = useLeadDetail(leadId);

    const [isSaving, setIsSaving] = useState(false);

    const currentAssignee = lead?.assigned_to?.id || lead?.assigned_to;

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            status: lead?.status || LEAD_STATUSES.NEW,
            assigned_to: currentAssignee ? currentAssignee.toString() : "none",
        },
        validationSchema: updateSchema,
        onSubmit: async (values) => {
            setIsSaving(true);
            await updateLeadDetails(values);
            setIsSaving(false);
        }
    });

    const selectedUser = users.find(u => u.id.toString() === formik.values.assigned_to);
    const displayAssigneeLabel = selectedUser 
        ? (selectedUser.first_name ? `${selectedUser.first_name} ${selectedUser.last_name} (${selectedUser.username})`.trim() : selectedUser.username)
        : (formik.values.assigned_to === "none" ? "Sin asignar" : "Cargando...");

    const headerAssigneeDisplay = lead?.assigned_to 
        ? (lead.assigned_to.first_name ? `${lead.assigned_to.first_name} ${lead.assigned_to.last_name}`.trim() : lead.assigned_to.username) 
        : "Sin asignar";

    if (isLoading || !lead) {
        return (
            <div className="p-8 text-slate-500 animate-pulse flex flex-col items-center justify-center h-[calc(100vh-80px)]">
                <Activity className="h-8 w-8 animate-spin text-slate-400 mb-4" />
                <p>Cargando perfil del contacto...</p>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-7xl mx-auto flex flex-col h-[calc(100vh-80px)] overflow-hidden animate-in fade-in duration-500">
            
            {/* HEADER */}
            <div className="flex items-center gap-4 mb-6 shrink-0">
                <Link href="/leads" className="p-2 bg-white rounded-full border shadow-sm text-slate-500 hover:text-slate-900 transition-colors">
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-3xl font-bold tracking-tight text-slate-900">{lead.name}</h1>
                            <Badge className={`${getStatusVariant(lead.status)} ml-2`}>
                                {lead.status}
                            </Badge>
                            <Badge variant="outline" className="bg-white text-slate-600 border-slate-200 shadow-sm flex items-center gap-1.5">
                                <Users className="h-3 w-3 text-slate-400" />
                                {headerAssigneeDisplay}
                            </Badge>
                        </div>
                        <p className="text-slate-500">Gestión comercial y registro de auditoría</p>
                    </div>
                </div>
            </div>

            {/* GRID PRINCIPAL */}
            <div className="grid gap-6 md:grid-cols-3 flex-1 min-h-0">
                <div className="md:col-span-1 flex flex-col gap-2">
                    
                    {/* INFO DEL CONTACTO */}
                    <Card className="shadow-sm">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg">Información</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center gap-3 text-sm text-slate-600">
                                <Mail className="h-4 w-4 text-slate-400 shrink-0" />
                                <span className="truncate">{lead.email}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-slate-600">
                                <Phone className="h-4 w-4 text-slate-400 shrink-0" />
                                <span>{lead.phone || "Sin teléfono"}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-slate-600">
                                <Globe className="h-4 w-4 text-slate-400 shrink-0" />
                                <span className="capitalize flex items-center gap-2">
                                    Fuente: <Badge variant="secondary">{lead.source}</Badge>
                                </span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-slate-600">
                                <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
                                <span>Registrado: {formatDate(lead.created_at)}</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* FORMULARIO FORMIK: GESTIÓN COMERCIAL */}
                    <Card className="shadow-sm border-blue-100 bg-white">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg">Gestión Comercial</CardTitle>
                            <CardDescription className="text-slate-500">Cambiar estado o asignación</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={formik.handleSubmit} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-slate-700">Estado</label>
                                    <Select 
                                        value={formik.values.status} 
                                        onValueChange={(val) => formik.setFieldValue("status", val)}
                                    >
                                        <SelectTrigger className="bg-white">
                                            <SelectValue placeholder="Estado" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white border border-slate-200 shadow-md z-50">
                                            {Object.keys(LEAD_STATUSES).map((statusKey) => (
                                                <SelectItem key={statusKey} value={statusKey}>
                                                    {statusKey.replace('_', ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-slate-700">Responsable</label>
                                    <Select 
                                        value={formik.values.assigned_to} 
                                        onValueChange={(val) => formik.setFieldValue("assigned_to", val)}
                                    >
                                        <SelectTrigger className="bg-white">
                                            <span className="truncate">{displayAssigneeLabel}</span>
                                        </SelectTrigger>
                                        <SelectContent className="bg-white border border-slate-200 shadow-md z-50">
                                            <SelectItem value="none" className="text-slate-500 italic">
                                                Sin asignar
                                            </SelectItem>
                                            {users.map((user) => {
                                                const hasFullName = user.first_name || user.last_name;
                                                const displayName = hasFullName 
                                                    ? `${user.first_name} ${user.last_name} (${user.username})`.trim()
                                                    : user.username;

                                                return (
                                                    <SelectItem key={user.id} value={user.id.toString()}>
                                                        {displayName}
                                                    </SelectItem>
                                                );
                                            })}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <Button 
                                    type="submit" 
                                    className="w-full bg-blue-600 text-white hover:bg-blue-700 mt-2" 
                                    disabled={isSaving || !formik.dirty}
                                >
                                    {isSaving ? <Activity className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                                    Guardar Cambios
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                {/* TIMELINE / AUDIT TRAIL*/}
                <div className="md:col-span-2 flex flex-col min-h-0">
                    <Card className="flex flex-col h-full shadow-sm bg-white border-slate-200 overflow-hidden">
                        <CardHeader className="shrink-0 border-b border-slate-100 pb-4 bg-slate-50/50">
                            <CardTitle className="text-base font-semibold text-slate-800">Registro de Actividad</CardTitle>
                            <CardDescription className="text-xs">Historial detallado de interacciones y datos recibidos.</CardDescription>
                        </CardHeader>
                        
                        <CardContent className="flex-1 p-0 min-h-0">
                            <ScrollArea className="h-full w-full">
                                <div className="divide-y divide-slate-100 pb-4">
                                    {(() => {
                                        const combinedTimeline = [
                                            ...(lead.logs || []).map((log: any) => ({ id: `log-${log.id}`, type: 'WEBHOOK', date: new Date(log.created_at), data: log })),
                                            ...(lead.activities || []).map((act: any) => ({ id: `act-${act.id}`, type: 'ACTIVITY', date: new Date(act.created_at), data: act }))
                                        ].sort((a, b) => b.date.getTime() - a.date.getTime());

                                        if (combinedTimeline.length === 0) {
                                            return (
                                                <div className="p-8 text-center text-slate-500 text-sm">
                                                    No hay registros en el historial.
                                                </div>
                                            );
                                        }

                                        return combinedTimeline.map((item) => {
                                            if (item.type === 'WEBHOOK') {
                                                const log = item.data as any;
                                                const isSuccess = log.status_code === 200;
                                                return (
                                                    <div key={item.id} className="p-4 hover:bg-slate-50 transition-colors">
                                                        <div className="flex items-start justify-between mb-2">
                                                            <div className="flex items-center gap-2">
                                                                {isSuccess ? <Globe className="h-4 w-4 text-emerald-600" /> : <AlertCircle className="h-4 w-4 text-red-500" />}
                                                                <span className="font-semibold text-sm text-slate-900">Webhook: {log.event_type}</span>
                                                                <Badge variant="outline" className={`ml-2 text-[10px] h-5 px-1.5 ${isSuccess ? "border-emerald-200 text-emerald-700 bg-emerald-50" : "border-red-200 text-red-700 bg-red-50"}`}>
                                                                    HTTP {log.status_code}
                                                                </Badge>
                                                            </div>
                                                            <span className="text-xs font-medium text-slate-400 whitespace-nowrap">
                                                                {/* <-- Aquí aplicamos formatDate al webhook */}
                                                                {formatDate(item.date.toISOString())}
                                                            </span>
                                                        </div>
                                                        {log.error_message && (
                                                            <p className="text-xs text-red-600 mb-2 font-medium">Error: {log.error_message}</p>
                                                        )}
                                                        <div className="bg-slate-800 rounded-md p-3 overflow-x-auto">
                                                            <pre className="text-[11px] leading-tight text-emerald-400 font-mono">
                                                                {JSON.stringify(log.payload, null, 2)}
                                                            </pre>
                                                        </div>
                                                    </div>
                                                );
                                            }

                                            if (item.type === 'ACTIVITY') {
                                                const act = item.data as any;
                                                const isStatus = act.description.toLowerCase().includes("estado");
                                                const isAssign = act.description.toLowerCase().includes("asignación");
                                                
                                                return (
                                                    <div key={item.id} className="p-4 hover:bg-slate-50 transition-colors flex items-start gap-3">
                                                        <div className="mt-0.5 bg-slate-100 p-1.5 rounded-md border border-slate-200 shrink-0">
                                                            {isStatus ? <Activity className="h-4 w-4 text-blue-600" /> : <Users className="h-4 w-4 text-orange-500" />}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center justify-between">
                                                                <span className="font-semibold text-sm text-slate-900">
                                                                    {isStatus ? "Actualización de Estado" : (isAssign ? "Cambio de Asignación" : "Actividad")}
                                                                </span>
                                                                <span className="text-xs font-medium text-slate-400 whitespace-nowrap">
                                                                    {formatDate(item.date.toISOString())}
                                                                </span>
                                                            </div>
                                                            <p className="text-sm text-slate-600 mt-0.5">{act.description}</p>
                                                        </div>
                                                    </div>
                                                );
                                            }
                                        });
                                    })()}
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}