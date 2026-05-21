import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Premium Executive Fleet",
    description: "Book luxury vehicles, SUVs, and executive sedans with professional chauffeurs or self-drive options across Nigeria.",
};

export default function CarsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}