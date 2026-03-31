
import { Documentation } from "@/components/Documentation/Documentation";
import { Metadata } from "next";
export const metadata: Metadata = {
    title: "Documentation | Haizom Studio",
    description: "Discover a wealth of insightful materials meticulously crafted to provide you with a comprehensive understanding of the latest trends.",
};

export default function Page() {
    return (
        <>
        <Documentation/>
        </>
    );
};
