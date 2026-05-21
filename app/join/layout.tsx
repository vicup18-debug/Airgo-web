import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Join as a Partner",
    description: "Become a verified Airgo.ng partner. List your hotel or car rental fleet and reach premium customers with escrow-secured transactions.",
};

export default function JoinLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
