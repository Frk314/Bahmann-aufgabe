import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

export default function Layout() {
    return (
        <div className="flex min-h-screen flex-col bg-background text-foreground">
        <Header />
        {/* Outlet = emplacement où s'affiche la page de la route active */}
        <main className="flex-1">
            <Outlet />
        </main>
        <Footer />
        </div>
    );
    }