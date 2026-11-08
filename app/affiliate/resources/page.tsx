import { FileImage, Download, Copy, Sparkles } from "lucide-react";

export default function AffiliateResourcesPage() {
  const assets = [
    {
      title: "ফেসবুক ও ইনস্টাগ্রাম স্কয়ার ব্যানার (1080x1080)",
      category: "সোশ্যাল মিডিয়া ব্যানার",
      preview: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600",
      description: "ওয়েব ডেভেলপমেন্ট কোর্সের আকর্ষণীয় অফার ব্যানার।",
    },
    {
      title: "ইউটিউব থাম্বনেইল ও ফেসবুক কভার (1920x1080)",
      category: "ব্যানার ও থাম্বনেইল",
      preview: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600",
      description: "ডিজিটাল মার্কেটিং কোর্সের হাই-কনভার্সন প্রমোশনাল গ্রাফিক্স।",
    },
    {
      title: "ইউআই/ইউএক্স ফিগোমা কোর্স প্রমোশন ব্যানার",
      category: "ডিজাইন রিসোর্স",
      preview: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=600",
      description: "ফিগোমা কোর্সের স্টুডেন্ট ফিডব্যাক সহ ব্যানার।",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[#172033] tracking-tight">
          মার্কেটিং রিসোর্স ও প্রমোশনাল মেটেরিয়াল
        </h1>
        <p className="text-xs text-[#64748B] mt-1">
          আপনার ক্যাম্পেইনের জন্য রেডিমেড ব্যানার ও কনটেন্ট ডাউনলোড করে ব্যবহার করুন।
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {assets.map((item, idx) => (
          <div key={idx} className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="aspect-video w-full bg-slate-100 overflow-hidden">
                <img src={item.preview} alt={item.title} className="w-full h-full object-cover" />
              </div>
              <div className="p-4 space-y-1">
                <span className="text-[10px] font-bold text-[#2563EB] uppercase tracking-wider">{item.category}</span>
                <h3 className="font-bold text-xs text-[#172033]">{item.title}</h3>
                <p className="text-[11px] text-[#64748B]">{item.description}</p>
              </div>
            </div>

            <div className="p-4 pt-0">
              <a
                href={item.preview}
                target="_blank"
                download
                className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#172033] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>ব্যানার ডাউনলোড করুন</span>
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
