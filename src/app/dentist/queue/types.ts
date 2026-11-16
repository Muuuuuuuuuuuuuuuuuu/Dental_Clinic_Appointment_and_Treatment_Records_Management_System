export interface TreatmentServiceItem {
  id: number;
  name: string;
  qty: number;
  price: number;
  locationCode?: string;
}

export interface TreatmentMedicineItem {
  id: number;
  name: string;
  qty: number;
  price: number;
  unit?: string;
  note?: string;
  instruction?: string;
}

export interface TreatmentFormState {
  notes: string;
  recommendations: string;
  services: TreatmentServiceItem[];
  medicines: TreatmentMedicineItem[];
  actualCost: number | "";
}

export interface PrescribedMed {
  name: string;
  dose: string;
  freq: string;
  days: string;
}

export type TimeFilter = "today" | "week" | "month" | "all";

