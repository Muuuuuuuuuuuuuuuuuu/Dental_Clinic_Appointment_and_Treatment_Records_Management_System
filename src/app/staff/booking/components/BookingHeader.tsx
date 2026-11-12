import BookingTitleBar from "./BookingTitleBar";
import BookingStepIndicator from "./BookingStepIndicator";

interface BookingHeaderProps {
  step: number;
}

export default function BookingHeader({ step }: BookingHeaderProps) {
  return (
    <div className="space-y-2 mb-3">
      <BookingTitleBar />
      <BookingStepIndicator step={step} />
    </div>
  );
}
