import BookingTitleBar from "./BookingTitleBar";
import BookingStepIndicator from "./BookingStepIndicator";

interface BookingHeaderProps {
  step: number;
}

export default function BookingHeader({ step }: BookingHeaderProps) {
  return (
    <div className="space-y-4 mb-6">
      <BookingTitleBar />
      <BookingStepIndicator step={step} />
    </div>
  );
}
