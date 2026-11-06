
import React from "react";
import HeroSub from "@/components/SharedComponent/HeroSub";
import { Metadata } from "next";
import Counter from "@/components/Home/Counter";
import Progresswork from "@/components/Home/WorkProgress";
export const metadata: Metadata = {
    title: "About",
    description: "An engineering studio for electronics and software: PCB design, prototyping, firmware, and web and mobile apps.",
};

const page = () => {
  const breadcrumbLinks = [
    { href: "/", text: "Home" },
    { href: "/about", text: "About" },
  ];
  return (
    <>
      <HeroSub
        title="About Us"
        description="An engineering studio for electronics and software: PCB design, prototyping, firmware, and web and mobile apps."
        breadcrumbLinks={breadcrumbLinks}
      />
       <Counter isColorMode={true} />
       <Progresswork isColorMode={true} />
    </>
  );
};

export default page;
