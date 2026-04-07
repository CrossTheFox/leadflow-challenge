"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Activity, TrendingUp, Globe, RefreshCcw, ListChecks, CheckCircle2, XCircle, Users } from "lucide-react";
import { useDashboard } from "@/hooks/useDashboard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate, getStatusVariant } from "@/lib/utils";

const scrollStyle = "pr-4 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:bg-slate-300 transition-colors";

export default function DashboardPage() {
    const { metrics, pipeline, recentWebhooks, recentActivities, isLoading, fetchData } = useDashboard(); // metrics: {..., totalLeads, conversionRate, successRate, webhooks }
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await fetchData();
        setIsRefreshing(false);
    };

    if (isLoading && !isRefreshing) {
        return (
            <div className="p-8 text-slate-500 animate-pulse flex flex-col items-center justify-center h-[calc(100vh-80px)] border border-slate-100 m-8 rounded-xl bg-slate-50/20">
                <Activity className="h-8 w-8 animate-spin text-slate-400 mb-4" />
                <p className="font-medium">Sincronizando pipeline...</p>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-7xl mx-auto flex flex-col h-[calc(100vh-80px)] overflow-hidden animate-in fade-in duration-500">
            
            {/* ENCABEZADO */}
            <div className="mb-6 flex items-center justify-between shrink-0"> 
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard Operacional</h1>
                    <p className="text-slate-500 mt-1">Visibilidad en tiempo real del pipeline comercial y estado de integraciones.</p>
                </div>
                
                <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleRefresh} 
                    disabled={isRefreshing}
                    className="bg-white text-slate-600 border-slate-200 shadow-sm hover:bg-slate-50"
                >
                    <RefreshCcw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    {isRefreshing ? 'Actualizando...' : 'Recargar Datos'}
                </Button>
            </div>

            {/* GRID PRINCIPAL 4-4-4 */}
            <div className="grid grid-cols-12 gap-6 flex-1 min-h-0">
                
                {/* METRICS PRINCIPALES */}
                <div className="col-span-4 flex flex-col gap-4 min-h-0">
                    <div className="grid grid-cols-2 gap-4 shrink-0">
                        <Card className="shadow-sm border-slate-200">
                            <CardHeader className="p-4 pb-2">
                                <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                                    <Users className="h-3.5 w-3.5" /> Total Leads
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 pt-0">
                                <div className="text-3xl font-bold text-slate-900">{metrics.totalLeads}</div>
                            </CardContent>
                        </Card>

                        <Card className="shadow-sm border-slate-200">
                            <CardHeader className="p-4 pb-2">
                                <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                                    <TrendingUp className="h-3.5 w-3.5" /> Conversión
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 pt-0">
                                <div className="text-2xl font-bold text-emerald-600 mb-1.5">{metrics.conversionRate}%</div>
                                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full transition-all duration-500 bg-emerald-500`}
                                        style={{ width: `${metrics.conversionRate}%` }}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* ESTADO DEL PIPELINE */}
                    <Card className="shadow-sm border-slate-200 bg-white flex-1 overflow-hidden flex flex-col">
                        <CardHeader className="pb-3 border-b border-slate-50 shrink-0">
                            <CardTitle className="text-lg font-bold text-slate-900">Estado del Pipeline</CardTitle>
                            <CardDescription className="text-xs">Distribución actual por etapa</CardDescription>
                        </CardHeader>
                        
                        <CardContent className="p-0 flex-1 min-h-0">
                            <div className={`h-full overflow-y-auto ${scrollStyle}`}>
                                <div className="divide-y divide-slate-100 pb-4">
                                    {pipeline.map((p: any) => {
                                        const percentage = metrics.totalLeads > 0 
                                            ? Math.round((p.count / metrics.totalLeads) * 100) 
                                            : 0;

                                        return (
                                            <div key={p.status} className="flex items-center justify-between p-4 transition-colors hover:bg-slate-50/50">
                                                <div className="flex flex-col gap-2 flex-1">
                                                    <div className="flex items-center justify-between">
                                                        <Badge className={`${getStatusVariant(p.status)} font-bold shadow-none border-none`}>
                                                            {p.status}
                                                        </Badge>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-bold text-slate-900">{p.count}</span>
                                                            <span className="text-[10px] font-medium text-slate-400">({percentage}%)</span>
                                                        </div>
                                                    </div>
                                                    {/* Barra de progreso manual - h-1.5 para que se vea */}
                                                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                                        <div 
                                                            className={`h-full transition-all duration-500 ${getStatusVariant(p.status)}`}
                                                            style={{ width: `${percentage}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* ACTIVIDADES RECIENTES */}
                <Card className="col-span-4 flex flex-col h-full shadow-sm bg-white border-slate-200 overflow-hidden">
                    <CardHeader className="shrink-0 border-b border-slate-100 pb-4 bg-slate-50/50">
                        <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <ListChecks className="h-5 w-5 text-blue-600" />
                            Actividad del Equipo
                        </CardTitle>
                        <CardDescription className="text-xs italic">Log de auditoría interna</CardDescription>
                    </CardHeader>
                    <CardContent className={`p-0 flex-1 min-h-0 overflow-y-auto ${scrollStyle}`}>
                        <div className="divide-y divide-slate-100">
                            {recentActivities.map((act: any) => (
                                <div key={act.id} className="p-4 hover:bg-slate-50/80 transition-colors">
                                    <div className="flex items-start justify-between mb-1.5">
                                        <span className="font-bold text-sm text-slate-900">{act.lead_name}</span>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                                            {formatDate(act.created_at)}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-600 leading-snug">{act.description}</p>
                                </div>
                            ))}
                        </div>

                    </CardContent>
                </Card>

                {/* REGISTRO DE WEBHOOKS*/}
                <Card className="col-span-4 flex flex-col h-full shadow-sm bg-white border-slate-200 overflow-hidden">
                    <CardHeader className="shrink-0 border-b border-slate-100 pb-4 bg-slate-50/50">
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col gap-0.5">
                                <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                    <Globe className="h-5 w-5 text-orange-500" />
                                    Monitor API
                                </CardTitle>
                                <CardDescription className="text-xs">Eventos entrantes</CardDescription>
                            </div>
                            <div className="flex items-center gap-3 bg-white border border-slate-200 px-3 py-1.5 rounded-full shadow-sm">
                                <div className="flex items-center gap-1.5">
                                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                                    <span className="text-xs font-bold text-slate-700">{metrics.webhooks.success}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <XCircle className="h-3.5 w-3.5 text-red-500" />
                                    <span className="text-xs font-bold text-slate-700">{metrics.webhooks.failed}</span>
                                </div>
                                <div className="h-3.5 w-[1px] bg-slate-200" />
                                <span className="text-[10px] font-black text-slate-900 tracking-tighter">{metrics.successRate}% Éxito</span>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className={`p-0 flex-1 min-h-0 overflow-y-auto ${scrollStyle}`}>
                        <div className="divide-y divide-slate-100">
                            {recentWebhooks.map((log: any) => {
                                const isSuccess = log.status_code === 200;
                                return (
                                    <div key={log.id} className="p-4 hover:bg-slate-50 transition-colors">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className={`text-[10px] h-5 px-1.5 font-bold ${isSuccess ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                                                    {log.status_code}
                                                </Badge>
                                                <span className="text-xs font-black text-slate-700 uppercase tracking-tight">
                                                    {log.event_type}
                                                </span>
                                            </div>
                                            <span className="text-[10px] text-slate-400 font-bold">{formatDate(log.created_at)}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-[11px] text-slate-500 italic">
                                            <span className="truncate max-w-[140px] font-medium">{log.payload?.lead_data?.email}</span>
                                            <span className="text-slate-300">•</span>
                                            <span className="capitalize">{log.payload?.lead_data?.source || 'directo'}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

            </div>
        </div>
    );
}