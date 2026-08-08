  import { createRoot } from "react-dom/client";
  import App from "./app/patient/PatientPortal";
  import { Toaster } from "./app/shared/components/ui/sonner";
  import "./styles/index.css";

  createRoot(document.getElementById("root")!).render(
    <>
      <Toaster position="top-center" richColors />
      <App />
    </>
  );