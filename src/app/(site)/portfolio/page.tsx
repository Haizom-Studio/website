import React from "react";
import Portfolio from "@/components/portfolio/PortfolioList";
import HeroSub from "@/components/SharedComponent/HeroSub";
import { portfolioinfo } from "@/app/api/data";
import { Metadata } from "next";
export const metadata: Metadata = {
    title: "Portfolio",
};

const PortfolioList = () => {
    const breadcrumbLinks = [
        { href: "/", text: "Home" },
        { href: "/portfolio", text: "Portfolio" },
    ];
    return (
        <>
            <HeroSub
                title="Portfolio"
                description="A selection of the boards, firmware and websites we have designed and delivered across consumer, industrial, medical and IoT products."
                breadcrumbLinks={breadcrumbLinks}
            />
            <Portfolio items={portfolioinfo} />
        </>
    );
};

export default PortfolioList;