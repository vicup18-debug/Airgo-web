import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Corporate Travel Solutions",
    description: "Airgo.ng Corporate Travel Solutions — negotiated rates, dedicated account management, and escrow-secured bookings for Nigerian businesses.",
};

export default function CorporateLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
