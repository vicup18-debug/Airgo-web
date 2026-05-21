import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Escrow Protection Agreement",
    description: "Read the full Airgo Escrow Protection Agreement — how your booking payments are held, released, and protected on the Airgo.ng platform.",
};

export default function EscrowLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
