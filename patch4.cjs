const fs = require('fs');
let file = fs.readFileSync('src/app/admin/hubs/ClinicHub.tsx', 'utf8');

// 1. imports
if (!file.includes('PackageManagement')) {
  file = file.replace(
    /import ProductManagement from "\.\.\/settings\/ProductManagement";/,
    `import ProductManagement from "../settings/ProductManagement";\nimport PackageManagement from "../users/PackageManagement";`
  );
}

// 2. types
if (!file.includes('"packages"')) {
  file = file.replace(
    /type ClinicSubView = null \| "services" \| "settings" \| "products";/,
    `type ClinicSubView = null | "services" | "settings" | "products" | "packages";`
  );
}

// 3. CARD_DEFS
if (!file.includes('key: "packages"')) {
  const newCard = `  {
    key: "packages" as const,
    icon: Package,
    title: "แพ็กเกจจัดฟัน",
    desc: "จัดการโปรโมชั่น ค่างวดแรกเข้า และรายเดือน",
    gradient: "linear-gradient(135deg, #EC4899 0%, #BE185D 100%)",
    bgLight: "#FCE7F3",
    countLabel: "แพ็กเกจ",
  },
];`;
  file = file.replace(/\];/, newCard);
}

// 4. SubView
if (!file.includes('subView === "packages"')) {
  file = file.replace(
    /if \(subView === "products"\) return <SubViewWrapper onBack=\{\(\) => setSubView\(null\)\}\><ProductManagement \/><\/SubViewWrapper>;/,
    `if (subView === "products") return <SubViewWrapper onBack={() => setSubView(null)}><ProductManagement /></SubViewWrapper>;\n  if (subView === "packages") return <SubViewWrapper onBack={() => setSubView(null)}><PackageManagement /></SubViewWrapper>;`
  );
}

fs.writeFileSync('src/app/admin/hubs/ClinicHub.tsx', file);
