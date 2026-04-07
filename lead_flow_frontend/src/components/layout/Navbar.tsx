"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Leads", href: "/leads" },
];

export function Navbar() {
    const pathname = usePathname();

    return (
        <nav className="border-b bg-white px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-6">
                <span className="font-bold text-lg">LeadFlow</span>

                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "text-sm font-medium transition-colors",
                            pathname.startsWith(item.href)
                                ? "text-slate-900"
                                : "text-slate-500 hover:text-slate-900"
                        )}
                    >
                        {item.name}
                    </Link>
                ))}
            </div>
        </nav>
    );
}