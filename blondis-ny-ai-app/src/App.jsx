import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";

/* ---------- Tiny UI helpers (Tailwind-based) ---------- */
const Label = ({ children }) => (
  <label className="text-sm font-medium text-gray-700 mb-1 block">{children}</label>
);

const Select = ({ value, onChange, children }) => (
  <select
    value={value}
    onChange={onChange}
    className="w-full rounded-2xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black/30"
  >
    {children}
  </select>
);

const Input = (props) => (
  <input
    {...props}
    className="w-full rounded-2xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black/30"
  />
);

const Toggle = ({ checked, onChange, label }) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    className={`flex items-center justify-between w-full rounded-2xl border px-3 py-2 transition ${
      checked ? "border-black bg-black text-white" : "border-gray-300 bg-white"
    }`}
  >
    <span className="text-sm">{label}</span>
    <span className="text-xs opacity-80">{checked ? "Yes" : "No"}</span>
  </button>
);

const Card = ({ children }) => (
  <div className="rounded-3xl border border-gray-200 bg-white shadow-sm p-5">{children}</div>
);

const Pill = ({ children }) => (
  <span className="inline-flex items-center rounded-full border border-gray-300 px-3 py-1 text-xs mr-2 mb-2">
    {children}
  </span>
);

/* ---------- Options ---------- */
const HAIR_TYPES = ["Straight", "Wavy", "Curly", "Coily/Kinky"];
const DENSITY = ["Fine", "Medium", "Thick"];
const POROSITY = ["Low", "Medium", "High", "Not sure"];
const SCALP = ["Balanced/Normal", "Dry/Flaky", "Oily", "Sensitive", "Dandruff/Seb Derm"];
const CHEM = ["None", "Color-treated (dark)", "Blonde/Lightened", "Bleached", "Keratin/Smoothing", "Permed/Relaxed"];
const CONCERNS = [
  "Dryness",
  "Frizz",
  "Breakage/Damage",
  "Hair loss/Shedding",
  "Lack of volume",
  "Itchy/Flaky scalp",
  "Oiliness",
  "Heat styling often",
  "Swimmer (chlorine)",
];
const CLIMATE = ["Dry", "Humid", "Cold", "Hot", "Coastal/Salt air"];

/* ---------- Rules Engine ---------- */
function scoreRules(form) {
  const rec = { steps: [], products: new Set(), notes: [], cautions: [] };

  // Cleansing
  if (form.scalp === "Oily") {
    rec.steps.push("Wash 3–5×/week with a balancing shampoo.");
    rec.products.add("Balancing shampoo (sulfate-free)");
  } else if (form.scalp === "Dandruff/Seb Derm") {
    rec.steps.push("Wash 3–4×/week; use anti-dandruff actives 2–3×/week.");
    rec.products.add("Anti-dandruff shampoo (zinc pyrithione, ketoconazole, selenium)");
    rec.notes.push("Leave active shampoo on scalp 3–5 min before rinsing.");
  } else if (form.scalp === "Dry/Flaky" || form.type !== "Straight") {
    rec.steps.push("Wash 2–3×/week with a gentle hydrating shampoo.");
    rec.products.add("Hydrating shampoo (sulfate-free)");
  } else {
    rec.steps.push("Wash 2–4×/week with a gentle daily shampoo.");
    rec.products.add("Gentle daily shampoo (sulfate-free)");
  }

  // Clarifying
  if (form.stylingFreq === "Daily" || form.scalp === "Oily") {
    rec.steps.push("Clarify weekly to remove buildup.");
    rec.products.add("Clarifying shampoo (1×/week)");
  } else {
    rec.steps.push("Clarify every 2–4 weeks.");
    rec.products.add("Clarifying shampoo (every 2–4 weeks)");
  }

  // Porosity & conditioning
  const needsRichCond =
    form.porosity === "High" || form.chem !== "None" || form.concerns.includes("Breakage/Damage");
  if (needsRichCond) {
    rec.steps.push("Use rich conditioner after every wash; detangle gently.");
    rec.products.add("Repair/strength conditioner (with proteins + lipids)");
    rec.products.add("Bond-building mask (1×/week)");
  } else {
    rec.steps.push("Use lightweight conditioner focused on mid-lengths to ends.");
    rec.products.add("Lightweight conditioner");
  }

  // Leave-ins by density
  if (form.density === "Fine") {
    rec.products.add("Volumizing leave-in spray/mousse");
    rec.notes.push("Focus products from mid-lengths down to avoid scalp weight.");
  } else if (form.density === "Thick") {
    rec.products.add("Cream leave-in + sealing oil/serum");
  } else {
    rec.products.add("Light cream or milk leave-in");
  }

  // Type-specific stylers
  if (form.type === "Wavy") rec.products.add("Light curl cream or sea-salt-friendly gel");
  if (form.type === "Curly" || form.type === "Coily/Kinky") {
    rec.products.add("Curl cream + gel (cast, then scrunch out)");
    rec.notes.push("Style on soaking-wet or very damp hair for better definition.");
  }

  // Heat styling
  if (form.concerns.includes("Heat styling often")) {
    rec.steps.push("Always apply heat protectant before blow-dry/irons.");
    rec.products.add("Heat protectant (up to 450°F)");
  }

  // Color-specific
  if (form.chem === "Blonde/Lightened") {
    rec.products.add("Purple toning shampoo (1×/week)");
    rec.cautions.push("Avoid over-toning; follow with deep conditioner.");
  }
  if (form.chem === "Keratin/Smoothing") {
    rec.cautions.push("Use sulfate- and sodium-chloride–free cleansers.");
  }

  // Scalp treatments
  if (form.scalp === "Dry/Flaky" || form.concerns.includes("Itchy/Flaky scalp")) {
    rec.products.add("Soothing scalp serum (pH-balanced, with zinc/tea tree)");
  }
  if (form.scalp === "Oily") {
    rec.products.add("Pre-shampoo scalp exfoliant (1×/week)");
  }

  // Damage/shedding
  if (form.concerns.includes("Breakage/Damage")) {
    rec.steps.push("Use bond-builder weekly; limit high heat; protect from UV/chlorine.");
  }
  if (form.concerns.includes("Hair loss/Shedding")) {
    rec.products.add("Caffeine/peptide scalp tonic (daily)");
    rec.notes.push("Consider medical consult for persistent shedding.");
  }

  // Climate
  if (form.climate === "Humid") {
    rec.products.add("Anti-humidity finishing spray/serum");
    rec.steps.push("Seal with serum after styling to reduce frizz.");
  }
  if (form.climate === "Dry" || form.concerns.includes("Dryness")) {
    rec.steps.push("Add overnight oiling 1–2×/week; use humidifier if possible.");
  }

  return rec;
}

function planFrom(rec, form) {
  const daily = [];
  const wash = [];
  const weekly = [];
  const monthly = [];

  daily.push("AM/PM: Apply leave-in on ends as needed.");
  if ([...rec.products].includes("Caffeine/peptide scalp tonic (daily)"))
    daily.push("Daily: Scalp tonic to clean, dry scalp.");
  if (form.concerns.includes("Heat styling often"))
    daily.push("When styling: Use heat protectant before tools.");

  wash.push("Shampoo as recommended; condition mid-lengths to ends.");
  if ([...rec.products].some((p) => p.includes("Curl cream")))
    wash.push("Style on damp hair with curl cream + gel.");

  if ([...rec.products].some((p) => p.includes("Bond-building mask")))
    weekly.push("1×: Bond-building/deep conditioning mask.");
  if ([...rec.products].some((p) => p.includes("Purple toning shampoo")))
    weekly.push("1×: Purple toning shampoo.");
  if ([...rec.products].some((p) => p.includes("Pre-shampoo scalp exfoliant")))
    weekly.push("1×: Scalp exfoliant before wash.");

  if ([...rec.products].some((p) => p.includes("Clarifying shampoo")))
    monthly.push("Every 2–4 weeks: Clarify to reset.");

  return { daily, wash, weekly, monthly };
}

/* ---------- App ---------- */
export default function HairRoutineRecommender() {
  const [form, setForm] = useState({
    type: "Wavy",
    density: "Medium",
    porosity: "Not sure",
    scalp: "Balanced/Normal",
    chem: "None",
    concerns: [],
    climate: "Dry",
    washFreq: 3,
    stylingFreq: "Few times/week",
    age: "Adult",
  });

  const [lang, setLang] = useState("en");
  const t = (en, ar) => (lang === "ar" ? ar : en);

  const rec = useMemo(() => scoreRules(form), [form]);
  const plan = useMemo(() => planFrom(rec, form), [rec, form]);

  // Catalog mapping (generic category -> brand product name)
  const genericList = useMemo(() => Array.from(new Set([...rec.products])), [rec.products]);
  const [catalogMap, setCatalogMap] = useState({
    "Bond-building mask (1×/week)": "Blondis NY Reparative Hair Mask",
  });
  const mappedProducts = useMemo(
    () => genericList.map((g) => ({ generic: g, mapped: catalogMap[g] || "" })),
    [genericList, catalogMap]
  );

  const handleMulti = (name, value) => {
    const has = form.concerns.includes(value);
    setForm({ ...form, [name]: has ? form.concerns.filter((c) => c !== value) : [...form.concerns, value] });
  };

  const printPlan = () => window.print();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Inputs */}
        <div className="lg:col-span-1 space-y-4">
          <motion.h1
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-semibold tracking-tight"
          >
            {t("Blondis NY Hair Routine Advisor", "موصى به لروتين العناية بالشعر")}
          </motion.h1>
          <p className="text-sm text-gray-600">
            {t(
              "Fill in your hair/scalp details and get a personalized routine with products and timing.",
              "أدخل خصائص شعرك وفروة الرأس للحصول على روتين مخصص مع المنتجات وتوقيت الاستخدام."
            )}
          </p>

          <Card>
            <div className="flex items-center justify-between mb-3">
              <Label>{t("Language", "اللغة")}</Label>
              <Select value={lang} onChange={(e) => setLang(e.target.value)}>
                <option value="en">English</option>
                <option value="ar">العربية</option>
              </Select>
            </div>

            <div className="space-y-4">
              <div>
                <Label>{t("Hair type", "نوع الشعر")}</Label>
                <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  {HAIR_TYPES.map((ti) => (
                    <option key={ti}>{ti}</option>
                  ))}
                </Select>
              </div>

              <div>
                <Label>{t("Strand density", "كثافة الشعرة")}</Label>
                <Select value={form.density} onChange={(e) => setForm({ ...form, density: e.target.value })}>
                  {DENSITY.map((ti) => (
                    <option key={ti}>{ti}</option>
                  ))}
                </Select>
              </div>

              <div>
                <Label>{t("Porosity", "المسامية")}</Label>
                <Select value={form.porosity} onChange={(e) => setForm({ ...form, porosity: e.target.value })}>
                  {POROSITY.map((ti) => (
                    <option key={ti}>{ti}</option>
                  ))}
                </Select>
              </div>

              <div>
                <Label>{t("Scalp condition", "حالة فروة الرأس")}</Label>
                <Select value={form.scalp} onChange={(e) => setForm({ ...form, scalp: e.target.value })}>
                  {SCALP.map((ti) => (
                    <option key={ti}>{ti}</option>
                  ))}
                </Select>
              </div>

              <div>
                <Label>{t("Chemical history", "معالجات كيميائية")}</Label>
                <Select value={form.chem} onChange={(e) => setForm({ ...form, chem: e.target.value })}>
                  {CHEM.map((ti) => (
                    <option key={ti}>{ti}</option>
                  ))}
                </Select>
              </div>

              <div>
                <Label>{t("Top concerns", "أهم المشاكل")}</Label>
                <div className="grid grid-cols-2 gap-2">
                  {CONCERNS.map((c) => (
                    <Toggle
                      key={c}
                      checked={form.concerns.includes(c)}
                      onChange={() => handleMulti("concerns", c)}
                      label={c}
                    />
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>{t("Climate", "المناخ")}</Label>
                  <Select value={form.climate} onChange={(e) => setForm({ ...form, climate: e.target.value })}>
                    {CLIMATE.map((ti) => (
                      <option key={ti}>{ti}</option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label>{t("Wash frequency (per week)", "عدد مرات الغسل أسبوعيًا")}</Label>
                  <Input
                    type="number"
                    min={1}
                    max={7}
                    value={form.washFreq}
                    onChange={(e) => setForm({ ...form, washFreq: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div>
                <Label>{t("Heat styling frequency", "تكرار استخدام الحرارة")}</Label>
                <Select
                  value={form.stylingFreq}
                  onChange={(e) => setForm({ ...form, stylingFreq: e.target.value })}
                >
                  {["Rarely", "Few times/week", "Daily"].map((ti) => (
                    <option key={ti}>{ti}</option>
                  ))}
                </Select>
              </div>
            </div>
          </Card>

          <Card>
            <Label>{t("Export", "تصدير")}</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
              <button
                className="w-full rounded-2xl bg-black text-white px-4 py-3 text-sm"
                onClick={() => {
                  const blob = new Blob(
                    [JSON.stringify({ form, recommendations: [...rec.products], plan, mapping: catalogMap }, null, 2)],
                    { type: "application/json" }
                  );
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = "hair-routine.json";
                  a.click();
                  URL.revokeObjectURL(url);
                }}
              >
                {t("Download JSON Plan", "تنزيل الخطة (JSON)")}
              </button>
              <button className="w-full rounded-2xl border border-black text-black px-4 py-3 text-sm" onClick={printPlan}>
                {t("Print / Save as PDF", "طباعة / حفظ PDF")}
              </button>
            </div>
          </Card>
        </div>

        {/* Right: Recommendations & Schedule */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <h2 className="text-xl font-semibold mb-3">{t("Recommended Products", "المنتجات الموصى بها")}</h2>
            <div className="flex flex-wrap print:hidden">
              {[...rec.products].map((p) => (
                <Pill key={p}>{p}</Pill>
              ))}
            </div>

            <div className="mt-4">
              <h3 className="text-sm font-semibold mb-1">
                {t("Catalog Mapper (map to your brand items)", "ربط الفئات بمنتجات علامتك")}
              </h3>
              <div className="space-y-2">
                {mappedProducts.map(({ generic, mapped }) => (
                  <div key={generic} className="grid grid-cols-1 md:grid-cols-3 gap-2 items-center">
                    <div className="text-xs text-gray-600">{generic}</div>
                    <Input
                      placeholder={t(
                        "Type product name (e.g., Blondis NY Reparative Hair Mask)",
                        "اكتب اسم المنتج"
                      )}
                      value={mapped}
                      onChange={(e) => setCatalogMap({ ...catalogMap, [generic]: e.target.value })}
                    />
                    <button
                      className="rounded-xl border px-3 py-2 text-xs"
                      onClick={() => {
                        const copy = `${generic} → ${catalogMap[generic] || "(not set)"}`;
                        navigator.clipboard.writeText(copy);
                      }}
                    >
                      {t("Copy mapping", "نسخ الربط")}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {rec.notes.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-semibold mb-1">{t("Notes", "ملاحظات")}</h3>
                <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                  {rec.notes.map((n, idx) => (
                    <li key={idx}>{n}</li>
                  ))}
                </ul>
              </div>
            )}
            {rec.cautions.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-semibold mb-1">{t("Cautions", "تحذيرات")}</h3>
                <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                  {rec.cautions.map((n, idx) => (
                    <li key={idx}>{n}</li>
                  ))}
                </ul>
              </div>
            )}
          </Card>

          <Card>
            <h2 className="text-xl font-semibold mb-3">{t("When to Use (Schedule)", "متى تستخدم (الجدول)")}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium mb-2">{t("Daily", "يوميًا")}</h3>
                <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1 print:text-black">
                  {plan.daily.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-medium mb-2">{t("Wash Day", "يوم الغسل")}</h3>
                <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1 print:text-black">
                  {plan.wash.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <h3 className="font-medium mb-2">{t("Weekly", "أسبوعيًا")}</h3>
                <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1 print:text-black">
                  {plan.weekly.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-medium mb-2">{t("Every 2–4 Weeks", "كل 2–4 أسابيع")}</h3>
                <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1 print:text-black">
                  {plan.monthly.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="text-xl font-semibold mb-3">{t("Why these picks?", "لماذا هذه الاختيارات؟")}</h2>
            <p className="text-sm text-gray-700">
              {t(
                "The recommendations are rule-based using hair type, density, porosity, scalp state, chemical history, climate, and styling frequency. You can adapt the rules to your brand catalog (e.g., map ‘Bond-building mask’ to a specific product).",
                "التوصيات مبنية على قواعد تأخذ بعين الاعتبار نوع الشعر وكثافته ومسامية الشعر وحالة فروة الرأس والمعالجات الكيميائية والمناخ وتكرار التصفيف بالحرارة. يمكنك ربط الفئات بمنتجات علامتك."
              )}
            </p>
          </Card>
        </div>
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          body { background: white; }
          .print\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  );
}
