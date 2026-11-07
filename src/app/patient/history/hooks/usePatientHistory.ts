import { useState, useEffect } from "react";
import { PatientUser } from "../../types";
import { getPatientTreatmentRecords } from "@/app/shared/supabaseApi";

export const thDate = (dateStr: string) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export function usePatientHistory(user: PatientUser) {
  const [selected, setSelected] = useState<any | null>(null);
  const [activeModalTab, setActiveModalTab] = useState<"advice" | "receipt">("advice");
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user.patientId) return;

    const loadHistory = () => {
      if (!user.patientId) return;
      getPatientTreatmentRecords(user.patientId)
        .then((data) => setHistory(data))
        .catch(console.error)
        .finally(() => setLoading(false));
    };

    loadHistory();

    const handleUpdate = () => loadHistory();
    window.addEventListener('appointments-updated', handleUpdate);

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'icemu-sync-update') loadHistory();
    };
    window.addEventListener('storage', handleStorage);

    let bc: BroadcastChannel | null = null;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        bc = new BroadcastChannel('icemu-updates');
        bc.onmessage = () => loadHistory();
      } catch (e) {}
    }

    return () => {
      window.removeEventListener('appointments-updated', handleUpdate);
      window.removeEventListener('storage', handleStorage);
      if (bc) {
        try { bc.close(); } catch (e) {}
      }
    };
  }, [user]);

  const getItemTotal = (h: any) => {
    if (h.cost !== null && h.cost !== undefined) {
      return parseInt(String(h.cost).replace(/,/g, "") || "0", 10);
    }
    const sCost =
      h.detailedServices?.reduce(
        (s: number, svc: any) => s + svc.price * (svc.qty || 1),
        0
      ) || 0;
    const pCost =
      h.extraProducts?.reduce(
        (s: number, prod: any) => s + prod.price * (prod.qty || 1),
        0
      ) || 0;
    return sCost + pCost;
  };

  const total = history.reduce((sum, h) => sum + getItemTotal(h), 0);

  return {
    history,
    loading,
    total,
    getItemTotal,
    selected,
    setSelected,
    activeModalTab,
    setActiveModalTab,
  };
}

