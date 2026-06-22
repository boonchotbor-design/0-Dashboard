"use client";

import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Dashboard } from "@/components/dashboard";
import defaultData from "@/data/dashboard-data.json";

export function EfferdDashboard2() {
  const [activeSlide, setActiveSlide] = useState(1);
  const [data, setData] = useState(defaultData);

  const handleImport = (newData: any) => {
    setData(newData);
  };

  return (
    <AppShell activeSlide={activeSlide} onSelectSlide={setActiveSlide}>
      <Dashboard activeSlide={activeSlide} data={data} onImport={handleImport} />
    </AppShell>
  );
}
export default EfferdDashboard2;
