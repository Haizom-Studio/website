
import React from "react";
import HeroSub from "@/components/SharedComponent/HeroSub";
import { Metadata } from "next";
import Counter from "@/components/Home/Counter";
import Progresswork from "@/components/Home/WorkProgress";
import Services from "@/components/Home/Services";
export const metadata: Metadata = {
    title: "Services",
    description: "From schematic capture and PCB layout to firmware, web and mobile apps: what we offer and what you receive at the end of each project.",
};

const page = () => {
  const breadcrumbLinks = [
    { href: "/", text: "Home" },
    { href: "/services", text: "Services" },
  ];
  return (
    <>
      <HeroSub
        title="Services"
        description="From schematic capture and PCB layout to firmware, web and mobile apps: what we offer and what you receive at the end of each project."
        breadcrumbLinks={breadcrumbLinks}
      />
      <Services/>
    </>
  );
};

export default page;
