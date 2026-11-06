import { redirect } from "next/navigation";
// Template documentation page hidden: it describes the website template, not
// Haizom Studios. Visitors are sent to the home page. The original page is kept
// below so it can be restored later.
//
// import { Documentation } from "@/components/Documentation/Documentation";
import { Metadata } from "next";
export const metadata: Metadata = {
    title: "Documentation | Haizom Studio",
    description: "An engineering studio for electronics and software: PCB design, prototyping, firmware, and web and mobile apps.",
};

export default function Page() {
    redirect("/");
    // return (
    //     <>
    //     <Documentation/>
    //     </>
    // );
};
