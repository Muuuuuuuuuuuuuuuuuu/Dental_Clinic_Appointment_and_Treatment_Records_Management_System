
interface TitleBarProps {
  firstName: string;
}

/**
 * 🏷️ [HEADER COMPONENT] คำทักทายคนไข้
 */
export default function TitleBar({ firstName }: TitleBarProps) {
  return (
    <div className="mb-8">
      <h1
        className="text-2xl font-bold mb-1"
        style={{ fontFamily: "Sarabun, sans-serif", color: "#1A365D" }}
      >
        สวัสดี, คุณ{firstName}
      </h1>
      <p className="text-sm" style={{ color: "#4A6080" }}>
        ยินดีต้อนรับเข้าสู่ระบบจัดการนัดหมายของคุณ
      </p>
    </div>
  );
}
