import PatientTitleBar from "./PatientTitleBar";
import PatientSearchBar from "./PatientSearchBar";

interface PatientHeaderProps {
  search: string;
  onSearchChange: (val: string) => void;
}

export default function PatientHeader({ search, onSearchChange }: PatientHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <PatientTitleBar />
      <PatientSearchBar value={search} onChange={onSearchChange} />
    </div>
  );
}

