import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "CAMPEON CRM - Offer Management",
    description: "Collaborative platform for casino offers and translations",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}
