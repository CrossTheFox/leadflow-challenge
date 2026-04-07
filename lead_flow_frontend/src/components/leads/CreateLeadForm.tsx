"use client";

import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useLeads } from "@/hooks/useLeads";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Loader2 } from "lucide-react";

const schema = Yup.object({
    name: Yup.string().required("El nombre es obligatorio"),
    email: Yup.string().email("Email inválido").required("El email es obligatorio"),
    phone: Yup.string().required("El teléfono es obligatorio"),
});

export function CreateLeadForm() {
    const { addLead } = useLeads(); 
    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const formik = useFormik({
        initialValues: {
            name: "",
            email: "",
            phone: "",
        },
        validationSchema: schema,
        onSubmit: async (values, { resetForm }) => {
            setIsSubmitting(true);
            try {
                await addLead({ ...values, source: "Manual" });
                setOpen(false);
                resetForm();
            } catch (error) {
                console.error("Error al crear lead", error);
            } finally {
                setIsSubmitting(false);
            }
        },
    });

    return (
        <>
            {/* CORRECCIÓN: Agregado text-white para asegurar que el texto sea visible */}
            <Button onClick={() => setOpen(true)} className="bg-slate-900 text-white hover:bg-slate-800">
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Contacto
            </Button>

            <Dialog open={open} onOpenChange={setOpen}>
                {/* CORRECCIÓN: Agregado bg-white, shadow-lg y bordes para forzar la opacidad */}
                <DialogContent className="sm:max-w-[425px] bg-white border border-slate-200 shadow-xl">
                    <DialogHeader>
                        <DialogTitle>Crear Contacto Manual</DialogTitle>
                        <DialogDescription className="text-slate-500">
                            Ingresa los datos del nuevo lead. Se añadirá al pipeline en estado NEW.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={formik.handleSubmit} className="space-y-4 mt-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nombre completo</Label>
                            <Input 
                                id="name" 
                                name="name" 
                                placeholder="Ej. Juan Pérez"
                                value={formik.values.name}
                                onChange={formik.handleChange} 
                                onBlur={formik.handleBlur}
                                className={formik.touched.name && formik.errors.name ? "border-red-500" : "bg-white"}
                            />
                            {formik.touched.name && formik.errors.name && (
                                <p className="text-xs text-red-500">{formik.errors.name}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Correo electrónico</Label>
                            <Input 
                                id="email" 
                                name="email" 
                                type="email"
                                placeholder="juan@empresa.com"
                                value={formik.values.email}
                                onChange={formik.handleChange} 
                                onBlur={formik.handleBlur}
                                className={formik.touched.email && formik.errors.email ? "border-red-500" : "bg-white"}
                            />
                            {formik.touched.email && formik.errors.email && (
                                <p className="text-xs text-red-500">{formik.errors.email}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone">Teléfono</Label>
                            <Input 
                                id="phone" 
                                name="phone" 
                                placeholder="+56 9 1234 5678"
                                value={formik.values.phone}
                                onChange={formik.handleChange} 
                                onBlur={formik.handleBlur}
                                className={formik.touched.phone && formik.errors.phone ? "border-red-500" : "bg-white"}
                            />
                            {formik.touched.phone && formik.errors.phone && (
                                <p className="text-xs text-red-500">{formik.errors.phone}</p>
                            )}
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="mr-2 bg-white">
                                Cancelar
                            </Button>
                            {/* CORRECCIÓN: Agregado text-white */}
                            <Button type="submit" disabled={isSubmitting} className="bg-slate-900 text-white hover:bg-slate-800">
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Guardar Contacto
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}