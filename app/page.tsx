"use client";

import dynamic from "next/dynamic";

const DynamicEarthMap = dynamic(() => import("@/components/earth-map"), {
  ssr: false,
});

export default function IndexPage() {
  return <DynamicEarthMap />;
}
