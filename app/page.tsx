"use client";

import dynamic from "next/dynamic";

const DynamicEarthMap = dynamic(() => import("@/components/map/index"), {
  ssr: false,
});

export default function IndexPage() {
  return <DynamicEarthMap />;
}
