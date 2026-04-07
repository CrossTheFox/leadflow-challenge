"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Lead, User } from "@/types";
import { Badge } from "@/components/ui/badge";
import { getStatusVariant, formatDate } from "@/lib/utils";

export const columns: ColumnDef<Lead>[] = [
    {
        accessorKey: "name",
        header: "Nombre",
        cell: ({ row }) => (
            <div className="font-medium">{row.getValue("name")}</div>
        ),
    },
    {
        accessorKey: "email",
        header: "Email",
    },
    {
        accessorKey: "status",
        header: "Estado",
        cell: ({ row }) => {
            const status = row.getValue("status") as string;
            return <Badge className={getStatusVariant(status)}>{status}</Badge>;
        },
    },
    {
        accessorKey: "source",
        header: "Fuente",
    },
    {
        accessorKey: "updated_at",
        header: "Última Actualización",
        cell: ({ row }) => {
            const date = row.getValue("updated_at") as string;
            return (
                <span className="text-sm text-slate-500">
                    {formatDate(date)}
                </span>
            );
        },
    },
    {
        accessorKey: "assigned_to",
        header: "Responsable",
        filterFn: "assignedFilter" as any,
        cell: ({ row }) => {
            const assignedUser = row.getValue("assigned_to") as User | null;
            
            if (!assignedUser) {
                return <span className="text-slate-400 italic text-xs">Sin asignar</span>;
            }

            const displayName = assignedUser.first_name 
                ? `${assignedUser.first_name} ${assignedUser.last_name}`.trim() 
                : assignedUser.username;

            return <span className="text-slate-700 font-medium text-sm">{displayName}</span>;
        },
    },
];