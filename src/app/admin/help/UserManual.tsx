import React from "react";
import { BookOpen, Calendar, Users, Bell, DollarSign } from "lucide-react";
import { toast } from "sonner";

export default function UserManual() {
  const topics = [
    {
      icon: Calendar,
      title: "การจัดการตารางเวรและการลา",
      description: "เรียนรู้วิธีการจัดตารางเวรให้พนักงาน การกำหนดวันหยุดคลินิก และการอนุมัติการลา",
    },
    {
      icon: Users,
      title: "การจัดการบุคลากร",
      description: "วิธีเพิ่มข้อมูลพนักงานใหม่ ทันตแพทย์ และการตั้งค่าสิทธิ์การใช้งานระบบ",
    },
    {
      icon: Bell,
      title: "ระบบประกาศและแจ้งเตือน",
      description: "การสร้างประกาศภายในคลินิก และการส่งข้อความแจ้งเตือนถึงทีมงาน",
    },
    {
      icon: DollarSign,
      title: "โปรโมชั่นและบริการ",
      description: "การตั้งค่าบริการทันตกรรมต่างๆ และการจัดการโปรโมชั่นสำหรับลูกค้า",
    },
  ];

  const handleComingSoon = () => {
    toast.info("อยู่ระหว่างการจัดทำเนื้อหา", { 
      description: "ฟีเจอร์คู่มือการใช้งานแบบเต็มจะเปิดให้ใช้งานเร็วๆ นี้" 
    });
  };

  const handleSupport = () => {
    toast.success("รับเรื่องเรียบร้อยแล้ว", {
      description: "ทีม Support จะติดต่อกลับทางอีเมลของคุณโดยเร็วที่สุด"
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 max-w-4xl">
      <div className="flex items-center gap-3 mb-6 border-b pb-6">
        <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
          <BookOpen size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-[#1A365D]">คู่มือการใช้งานระบบ</h2>
          <p className="text-sm text-gray-500 mt-1">
            รวมคำแนะนำและวิธีการใช้งานระบบจัดการคลินิกสำหรับผู้ดูแลระบบ (Admin)
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {topics.map((topic, index) => {
          const Icon = topic.icon;
          return (
            <div 
              key={index} 
              onClick={handleComingSoon}
              className="p-5 rounded-xl border border-gray-100 bg-gray-50 hover:bg-white hover:shadow-md hover:border-blue-100 transition-all cursor-pointer group"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-500 group-hover:text-blue-600 group-hover:border-blue-200 transition-colors">
                  <Icon size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 mb-1 group-hover:text-blue-600 transition-colors">{topic.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {topic.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 p-6 rounded-xl bg-blue-50/50 border border-blue-100 text-center">
        <h4 className="font-bold text-[#1A365D] mb-2">ต้องการความช่วยเหลือเพิ่มเติม?</h4>
        <p className="text-sm text-gray-600 mb-4">
          หากพบปัญหาการใช้งานหรือมีข้อสงสัย สามารถติดต่อทีม Support ของระบบได้ทันที
        </p>
        <button 
          onClick={handleSupport}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          ติดต่อทีม Support
        </button>
      </div>
    </div>
  );
}
