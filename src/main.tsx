  import { createRoot } from "react-dom/client";
  import App from "./app/patient/PatientPortal";
  import { Toaster } from "./app/shared/components/ui/sonner";
  import TimeTravelWidget from "./app/shared/components/TimeTravelWidget";
  import "./styles/index.css";

  // --- TIME TRAVEL OVERRIDE ---
  const mockDateStr = localStorage.getItem("supat_mock_date");
  if (mockDateStr) {
    const OriginalDate = Date;
    // Set target time to 08:00:00 of the selected date
    const targetDate = new OriginalDate(mockDateStr + "T08:00:00");
    const offset = targetDate.getTime() - OriginalDate.now();

    class MockDate extends OriginalDate {
      constructor(...args: any[]) {
        if (args.length === 0) {
          super(OriginalDate.now() + offset);
        } else {
          super(...(args as [any]));
        }
      }
      static now() {
        return OriginalDate.now() + offset;
      }
    }
    globalThis.Date = MockDate as any;
    console.log(`[Time Travel] System time mocked to: ${mockDateStr}`);
  }
  // ----------------------------

  createRoot(document.getElementById("root")!).render(
    <>
      <Toaster position="top-center" richColors />
      <App />
      <TimeTravelWidget />
    </>
  );