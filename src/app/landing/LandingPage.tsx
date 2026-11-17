import Header from "./Header";
import Hero from "./Hero";
import Services from "./Services";
import WhyUs from "./WhyUs";
import Doctors from "./Doctors";
import Contact from "./Contact";
import Footer from "./Footer";

export interface LandingPageProps {
  onLoginClick: () => void;
  isLoggedIn: boolean;
  onPortal: () => void;
  onCTA: (service?: number) => void;
}

/**
 * 🏠 [LANDING PAGE ROOT]
 * หน้าแรกของเว็บไซต์คลินิกทันตกรรมสุภัทร (หน้าต้อนรับสำหรับบุคคลทั่วไป)
 * รวมทุก Section ของ Landing Page ไว้ในที่เดียวอย่างเป็นสัดส่วน
 */
export default function LandingPage({
  onLoginClick,
  isLoggedIn,
  onPortal,
  onCTA,
}: LandingPageProps) {
  return (
    <div
      className="min-h-screen"
      style={{ fontFamily: "Sarabun, sans-serif", scrollBehavior: "smooth" }}
    >
      <Header
        onLoginClick={onLoginClick}
        isLoggedIn={isLoggedIn}
        onPortal={onPortal}
      />

      <main>
        <Hero onCTA={onCTA} />
        <Services onCTA={onCTA} />
        <WhyUs />
        <Doctors onCTA={onCTA} />
        <Contact onCTA={onCTA} />
      </main>

      <Footer />
    </div>
  );
}
