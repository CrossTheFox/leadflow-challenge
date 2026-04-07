// src/app/page.tsx
import { redirect } from "next/navigation";

export default function Home() {
    // Redirigimos automáticamente al usuario al Dashboard
    redirect("/dashboard");
}