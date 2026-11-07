import React from "react";
import { Clock, CheckCircle, Smile } from "lucide-react";
import { ServiceDetail, iconMap } from "../../data/serviceDetailsData";

interface ServiceDetailLeftCardProps {
  serviceTitle: string;
  estTime: number;
  price?: string;
  iconName?: string;
  detail: ServiceDetail;
}

const DetailCard = ({
  title,
  accent,
  children,
}: {
  title: string;
  accent: string;
  children: React.ReactNode;
}) => (
  <div
    style={{
      borderRadius: 14,
      backgroundColor: "white",
      padding: "14px 16px",
      boxShadow: "0 1px 8px rgba(26,54,93,0.07)",
    }}
  >
    <p
      style={{
        fontWeight: 700,
        fontSize: 12,
        color: accent,
        marginBottom: 8,
      }}
    >
      {title}
    </p>
    {children}
  </div>
);

/**
 * 📋 [STEP 1 LEFT COMPONENT] การ์ดแสดงประโยชน์ ขั้นตอนการรักษา และคำแนะนำก่อน/หลังทำ
 */
export default function ServiceDetailLeftCard({
  serviceTitle,
  estTime,
  price,
  iconName,
  detail,
}: ServiceDetailLeftCardProps) {
  const Icon = (iconName && iconMap[iconName]) || Smile;

  return (
    <div className="flex flex-col gap-3">
      {/* ป้ายชื่อบริการ */}
      <div
        style={{
          borderRadius: 16,
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          background: "linear-gradient(135deg,#FFF0F2,#FFF8F9)",
          border: "1px solid rgba(255,140,154,0.25)",
        }}
      >
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: 12,
            backgroundColor: "white",
            boxShadow: "0 2px 8px rgba(255,140,154,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Icon size={20} style={{ color: "#FF8C9A" }} />
        </div>
        <div>
          <p
            style={{
              fontWeight: 700,
              fontSize: 14,
              color: "#1A365D",
              marginBottom: 2,
            }}
          >
            {serviceTitle}
          </p>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 12,
              color: "#4A6080",
              marginBottom: 2,
            }}
          >
            <Clock size={12} style={{ color: "#FF8C9A" }} />
            <span>ใช้เวลาประมาณ {estTime} นาที</span>
          </div>
          <p style={{ fontSize: 12, color: "#FF8C9A", fontWeight: 600 }}>
            {price}
          </p>
        </div>
      </div>

      <DetailCard title={`ประโยชน์ของ${serviceTitle}`} accent="#22C55E">
        {detail.benefits.map((b, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              gap: 8,
              fontSize: 13,
              color: "#4A6080",
              marginBottom: 6,
              alignItems: "flex-start",
            }}
          >
            <CheckCircle
              size={13}
              style={{ color: "#22C55E", flexShrink: 0, marginTop: 2 }}
            />
            {b}
          </div>
        ))}
      </DetailCard>

      <DetailCard title="ขั้นตอนการรักษา" accent="#FF8C9A">
        {detail.procedures.map((p, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              gap: 8,
              fontSize: 13,
              color: "#4A6080",
              marginBottom: 6,
              alignItems: "flex-start",
            }}
          >
            <span
              style={{
                color: "white",
                backgroundColor: "#FF8C9A",
                borderRadius: "50%",
                width: 18,
                height: 18,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 10,
                fontWeight: "bold",
                flexShrink: 0,
                marginTop: 1,
              }}
            >
              {i + 1}
            </span>
            <span>{p}</span>
          </div>
        ))}
      </DetailCard>

      <DetailCard title="การดูแลก่อนและหลังการรักษา" accent="#3B82F6">
        {detail.care.map((c, i) => {
          const isPre = c.startsWith("ก่อนทำ:");
          const isPost = c.startsWith("หลังทำ:");
          const text = c.replace(/^(ก่อนทำ:|หลังทำ:)\s*/, "");
          return (
            <div
              key={i}
              style={{
                display: "flex",
                gap: 8,
                fontSize: 13,
                color: "#4A6080",
                marginBottom: 8,
                alignItems: "flex-start",
              }}
            >
              {isPre && (
                <div
                  style={{
                    backgroundColor: "#EFF6FF",
                    color: "#3B82F6",
                    fontSize: 10,
                    fontWeight: 700,
                    padding: "2px 6px",
                    borderRadius: 4,
                    flexShrink: 0,
                    marginTop: 1,
                  }}
                >
                  ก่อนทำ
                </div>
              )}
              {isPost && (
                <div
                  style={{
                    backgroundColor: "#F0FDF4",
                    color: "#22C55E",
                    fontSize: 10,
                    fontWeight: 700,
                    padding: "2px 6px",
                    borderRadius: 4,
                    flexShrink: 0,
                    marginTop: 1,
                  }}
                >
                  หลังทำ
                </div>
              )}
              {!isPre && !isPost && (
                <span
                  style={{
                    color: "#3B82F6",
                    flexShrink: 0,
                    fontWeight: "bold",
                    marginTop: -2,
                  }}
                >
                  •
                </span>
              )}
              <span style={{ lineHeight: 1.5 }}>{text}</span>
            </div>
          );
        })}
      </DetailCard>
    </div>
  );
}
