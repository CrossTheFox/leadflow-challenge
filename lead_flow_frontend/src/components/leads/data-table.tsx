"use client";

import * as React from "react";
import {
    ColumnDef,
    ColumnFiltersState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    useReactTable,
} from "@tanstack/react-table";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
} from "@/components/ui/select";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

import { LEAD_STATUSES } from "@/constants";
import { User } from "@/types";

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    users?: User[];
}

export function DataTable<TData extends { id: number }, TValue>({
    columns,
    data,
    users
}: DataTableProps<TData, TValue>) {
    const router = useRouter();
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

    const table = useReactTable({
        data,
        columns,
        state: { columnFilters },
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        filterFns: {
            assignedFilter: (row, columnId, filterValue) => {
                const assigned = row.getValue(columnId) as User | null;
                if (!filterValue || filterValue === "all") return true;
                if (filterValue === "none") return assigned === null;
                return assigned?.id.toString() === filterValue;
            },
        },
    });

    // --- LÓGICA DE ETIQUETAS PARA LOS FILTROS ---
    const assignedFilterValue = (table.getColumn("assigned_to")?.getFilterValue() as string) || "all";
    const selectedUser = users?.find(u => u.id.toString() === assignedFilterValue);
    
    const displayAssigneeLabel = selectedUser 
        ? (selectedUser.first_name ? `${selectedUser.first_name} ${selectedUser.last_name}`.trim() : selectedUser.username)
        : (assignedFilterValue === "none" ? "Sin asignar" : "Todos los responsables");

    const statusFilterValue = (table.getColumn("status")?.getFilterValue() as string) || "all";
    const displayStatusLabel = statusFilterValue === "all" 
        ? "Todos los estados" 
        : statusFilterValue.replace('_', ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <Input
                    placeholder="Buscar por nombre..."
                    value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
                    onChange={(e) => table.getColumn("name")?.setFilterValue(e.target.value)}
                    className="max-w-sm bg-white shadow-sm"
                />

                {/* Filtro de Estado */}
                <Select
                    value={statusFilterValue}
                    onValueChange={(value) => 
                        table.getColumn("status")?.setFilterValue(value === "all" ? "" : value)
                    }
                >
                    <SelectTrigger className="w-[180px] bg-white shadow-sm">
                        <span className="truncate">{displayStatusLabel}</span>
                    </SelectTrigger>
                    <SelectContent className="bg-white border-slate-200">
                        <SelectItem value="all">Todos los estados</SelectItem>
                        {Object.keys(LEAD_STATUSES).map((statusKey) => (
                            <SelectItem key={statusKey} value={statusKey}>
                                {statusKey.replace('_', ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* Filtro de Responsable */}
                <Select
                    value={assignedFilterValue}
                    onValueChange={(value) => table.getColumn("assigned_to")?.setFilterValue(value)}
                >
                    <SelectTrigger className="w-[220px] bg-white shadow-sm">
                        <span className="truncate">{displayAssigneeLabel}</span>
                    </SelectTrigger>
                    <SelectContent className="bg-white border-slate-200">
                        <SelectItem value="all">Todos los responsables</SelectItem>
                        <SelectItem value="none">Sin asignar</SelectItem>
                        {users?.map((user) => {
                            const name = user.first_name 
                                ? `${user.first_name} ${user.last_name}`.trim() 
                                : user.username;
                            return (
                                <SelectItem key={user.id} value={user.id.toString()}>
                                    {name}
                                </SelectItem>
                            );
                        })}
                    </SelectContent>
                </Select>
            </div>

            {/* TABLA */}
            <div className="rounded-md border bg-white shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50/50">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id} className="font-bold text-slate-700">
                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    className="cursor-pointer hover:bg-slate-50/80 transition-colors"
                                    onClick={() => router.push(`/leads/${row.original.id}`)}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-32 text-center">
                                    <p className="text-slate-500">No se encontraron contactos.</p>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* PAGINACIÓN */}
            <div className="flex items-center justify-between px-2">
                <div className="text-xs text-slate-500 font-medium">
                    Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="bg-white"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        Anterior
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="bg-white"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        Siguiente
                    </Button>
                </div>
            </div>
        </div>
    );
}