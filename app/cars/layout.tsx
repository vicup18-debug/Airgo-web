import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Premium Executive Fleet",
    description: "Hire premium executive vehicles and luxury sedans in Nigeria. Chauffeur or self-drive options, secured by Airgo Escrow.",
};

export default function CarsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}