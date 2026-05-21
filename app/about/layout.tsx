import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "About Us",
    description: "Learn about Airgo.ng — Nigeria's escrow-protected travel marketplace connecting guests and partners across Abuja, Kaduna, and beyond.",
};

export default function AboutLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
