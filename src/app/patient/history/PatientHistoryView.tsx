import React from "react";
import { PatientUser } from "../types";
import { usePatientHistory } from "./hooks/usePatientHistory";
import {
  HistoryTitleBar,
  HistoryCard,
  EmptyHistoryState,
  TreatmentDetailModal,
} from "./components";

interface HistoryProps {
  user: PatientUser;
}

/**
 * 📜 Patient Treatment History Module - Flat & Clean Architecture
 */
export default function PatientHistoryView({ user }: HistoryProps) {
  const {
    history,
    total,
    getItemTotal,
    selected,
    setSelected,
    activeModalTab,
    setActiveModalTab,
  } = usePatientHistory(user);

  return (
    <div>
      <HistoryTitleBar total={total} />
      
      <main className="space-y-4">
        {history.length === 0 ? (
          <EmptyHistoryState />
        ) : (
          history.map((h: any) => (
            <HistoryCard
              key={h.id}
              record={h}
              itemTotal={getItemTotal(h)}
              onSelect={() => {
                setSelected(h);
                setActiveModalTab("advice");
              }}
            />
          ))
        )}
      </main>

      <TreatmentDetailModal
        selected={selected}
        onClose={() => setSelected(null)}
        activeModalTab={activeModalTab}
        setActiveModalTab={setActiveModalTab}
        netTotal={selected ? getItemTotal(selected) : 0}
      />
    </div>
  );
}
