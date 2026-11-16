import { UserPlus } from "lucide-react";

interface DoctorSelectorProps {
  wantSelectDoctor: boolean;
  setWantSelectDoctor: (want: boolean) => void;
  selDoctor: number | "any" | null;
  setSelDoctor: (doc: number | "any") => void;
  isBoundDoctor: boolean;
  loadingDoctors: boolean;
  landingDoctors: any[];
  filteredDoctors: any[];
}

/**
 * 👨‍⚕️ [STEP 1 RIGHT COMPONENT] แถบสลับและเลือกทันตแพทย์
 */
export default function DoctorSelector({
  wantSelectDoctor,
  setWantSelectDoctor,
  selDoctor,
  setSelDoctor,
  isBoundDoctor,
  loadingDoctors,
  landingDoctors,
  filteredDoctors,
}: DoctorSelectorProps) {
  return (
    <div
      style={{
        borderRadius: 16,
        backgroundColor: "white",
        overflow: "hidden",
        boxShadow: "0 1px 8px rgba(26,54,93,0.07)",
      }}
    >
      <div
        style={{
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          borderBottom: wantSelectDoctor
            ? "1px solid rgba(26,54,93,0.06)"
            : "none",
        }}
      >
        <div style={{ flex: 1 }}>
          <p style={{ fontWeight: 700, fontSize: 13, color: "#1A365D" }}>
            เลือกทันตแพทย์เอง
          </p>
          <p style={{ fontSize: 11, color: "#94A3B8", marginTop: 1 }}>
            ไม่เลือก = ระบบจัดให้อัตโนมัติ
          </p>
        </div>
        <button
          onClick={() => {
            if (isBoundDoctor) return;
            setWantSelectDoctor(!wantSelectDoctor);
            if (wantSelectDoctor) setSelDoctor("any");
          }}
          style={{
            position: "relative",
            width: 44,
            height: 24,
            borderRadius: 999,
            border: "none",
            cursor: isBoundDoctor ? "not-allowed" : "pointer",
            opacity: isBoundDoctor ? 0.6 : 1,
            backgroundColor: wantSelectDoctor ? "#FF8C9A" : "#E2E8F0",
            transition: "background 0.25s",
            flexShrink: 0,
          }}
        >
          <span
            style={{
              position: "absolute",
              top: 2,
              left: wantSelectDoctor ? 20 : 2,
              width: 20,
              height: 20,
              borderRadius: "50%",
              backgroundColor: "white",
              boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
              transition: "left 0.25s",
            }}
          />
        </button>
      </div>

      {wantSelectDoctor && (
        <div style={{ padding: "10px 14px" }}>
          {loadingDoctors ? (
            <p
              style={{
                textAlign: "center",
                fontSize: 13,
                color: "#4A6080",
                padding: "12px 0",
              }}
            >
              กำลังโหลด...
            </p>
          ) : (
            <div
              style={{
                display: "flex",
                gap: 8,
                overflowX: "auto",
                paddingBottom: 4,
              }}
            >
              <button
                onClick={() => !isBoundDoctor && setSelDoctor("any")}
                disabled={isBoundDoctor}
                style={{
                  flexShrink: 0,
                  width: 86,
                  borderRadius: 12,
                  overflow: "hidden",
                  textAlign: "left",
                  cursor: isBoundDoctor ? "not-allowed" : "pointer",
                  opacity: isBoundDoctor ? 0.4 : 1,
                  backgroundColor: "white",
                  border:
                    selDoctor === "any"
                      ? "2px solid #FF8C9A"
                      : "2px solid rgba(26,54,93,0.1)",
                  boxShadow:
                    selDoctor === "any"
                      ? "0 3px 12px rgba(255,140,154,0.3)"
                      : "none",
                }}
              >
                <div
                  style={{
                    height: 64,
                    backgroundColor: "#F8FAFC",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <UserPlus
                    size={24}
                    style={{ color: "#1A365D", opacity: 0.2 }}
                  />
                </div>
                <div style={{ padding: "5px 7px" }}>
                  <p style={{ fontSize: 10, fontWeight: 700, color: "#1A365D" }}>
                    ท่านใดก็ได้
                  </p>
                  <p style={{ fontSize: 9, color: "#FF8C9A", marginTop: 1 }}>
                    คิวเร็วสุด
                  </p>
                </div>
              </button>

              {landingDoctors.map((d) => {
                const avail = filteredDoctors.some((fd) => fd.id === d.id);
                return (
                  <button
                    key={d.id}
                    onClick={() =>
                      avail && !isBoundDoctor && setSelDoctor(d.id)
                    }
                    disabled={!avail || isBoundDoctor}
                    style={{
                      flexShrink: 0,
                      width: 86,
                      borderRadius: 12,
                      overflow: "hidden",
                      textAlign: "left",
                      cursor:
                        avail && !isBoundDoctor ? "pointer" : "not-allowed",
                      opacity: avail ? 1 : 0.4,
                      backgroundColor: "white",
                      border:
                        selDoctor === d.id
                          ? "2px solid #FF8C9A"
                          : "2px solid rgba(26,54,93,0.1)",
                      boxShadow:
                        selDoctor === d.id
                          ? "0 3px 12px rgba(255,140,154,0.3)"
                          : "none",
                    }}
                  >
                    <img
                      src={d.img}
                      alt={d.name}
                      style={{
                        width: "100%",
                        height: 64,
                        objectFit: "cover",
                        display: "block",
                      }}
                    />
                    <div style={{ padding: "5px 7px" }}>
                      <p
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          color: "#1A365D",
                          lineHeight: 1.3,
                        }}
                      >
                        {d.name}
                      </p>
                      <p
                        style={{
                          fontSize: 9,
                          color: "#FF8C9A",
                          marginTop: 1,
                        }}
                      >
                        {d.specialty}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

