import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Login",
    description: "Sign in to your Airgo.ng account to manage bookings, view history, and access escrow-protected travel services.",
};

export default function LoginLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
