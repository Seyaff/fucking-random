import ConnectorSidebar from "@/components/connectors/sidebar/connector-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import React from "react";



export default function ConnectorLayout({ children }: { children: React.ReactNode }) {
    <SidebarProvider>
        <ConnectorSidebar />

        <SidebarInset />

        <main>{children}</main>

    </SidebarProvider>
}