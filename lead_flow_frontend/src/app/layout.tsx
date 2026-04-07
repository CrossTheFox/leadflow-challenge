import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { LeadProvider } from "@/context/LeadContext";

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="es">
            <body className="h-screen flex flex-col overflow-hidden bg-slate-50 text-slate-900">
                <LeadProvider>
                    <Navbar />
                
                    <main className="flex-1 overflow-y-auto bg-slate-50">
                        {children}
                    </main>
                </LeadProvider>
            </body>
        </html>
    );
}