"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MockCourse,
  MockCourseCategory,
  MockInstructor,
  DEFAULT_INSTRUCTOR,
  DEFAULT_LEARNING_OUTCOMES,
} from "@/lib/db/mock-data";
import { formatBDT, formatBnNumber } from "@/lib/utilities/cn";
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  ExternalLink,
  BookOpen,
  Star,
  CheckCircle2,
  AlertCircle,
  X,
  Image as ImageIcon,
  Layers,
  Clock,
  Tag,
  Sparkles,
  Loader2,
  Eye,
  FolderPlus,
  Check,
  User,
  Users,
  Video,
  ListChecks,
  PlayCircle,
  FileText,
  Info
} from "lucide-react";

interface CourseManagementClientProps {
  initialCourses: MockCourse[];
  initialCategories: MockCourseCategory[];
}

const DEFAULT_FORM: Partial<MockCourse> = {
  title: "",
  titleBn: "",
  slug: "",
  summaryBn: "",
  descriptionBn: "",
  thumbnail: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80",
  previewVideoUrl: "",
  price: 2500,
  originalPrice: 4500,
  commissionRate: 25,
  isAffiliateEligible: true,
  status: "PUBLISHED",
  categorySlug: "web-development",
  categoryNameBn: "ওয়েব ডেভেলপমেন্ট",
  duration: "২৫+ ঘণ্টা",
  totalLessons: 30,
  difficulty: "সকল স্তরের জন্য",
  featured: false,
  learningOutcomes: [...DEFAULT_LEARNING_OUTCOMES],
  instructions: [
    "কোর্সটি শুরু করার আগে প্রাথমিক কম্পিউটার ও ইন্টারনেট ব্যবহারের ধারণা থাকা বাঞ্ছনীয়।",
    "প্রতিটি মডিউলের ভিডিও দেখে সাথে সাথে হ্যান্ডস-অন প্র্যাকটিস করুন।",
  ],
  instructor: { ...DEFAULT_INSTRUCTOR },
  instructors: [{ ...DEFAULT_INSTRUCTOR }],
  modules: [],
};

export function CourseManagementClient({
  initialCourses,
  initialCategories,
}: CourseManagementClientProps) {
  const router = useRouter();
  const [courses, setCourses] = useState<MockCourse[]>(initialCourses);
  const [categories, setCategories] = useState<MockCourseCategory[]>(initialCategories);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<"basic" | "instructor" | "curriculum">("basic");
  const [editingCourse, setEditingCourse] = useState<MockCourse | null>(null);
  const [formData, setFormData] = useState<Partial<MockCourse>>(DEFAULT_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Inline custom category state inside Course Modal
  const [showInlineCategoryForm, setShowInlineCategoryForm] = useState(false);
  const [inlineCategoryNameBn, setInlineCategoryNameBn] = useState("");
  const [inlineCategoryNameEn, setInlineCategoryNameEn] = useState("");
  const [isCreatingInlineCategory, setIsCreatingInlineCategory] = useState(false);

  // Category Management Modal state
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryNameBn, setNewCategoryNameBn] = useState("");
  const [newCategoryNameEn, setNewCategoryNameEn] = useState("");
  const [newCategorySlug, setNewCategorySlug] = useState("");
  const [isSavingCategory, setIsSavingCategory] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingCategoryNameBn, setEditingCategoryNameBn] = useState("");
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(null);

  // Delete confirmation modal
  const [courseToDelete, setCourseToDelete] = useState<MockCourse | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Feedback alert
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showToast = (type: "success" | "error", message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  // Filtered courses
  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      const matchesSearch =
        c.titleBn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.categoryNameBn.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === "ALL" || c.status === statusFilter;
      const matchesCategory = categoryFilter === "ALL" || c.categorySlug === categoryFilter;
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [courses, searchQuery, statusFilter, categoryFilter]);

  // Stats
  const stats = useMemo(() => {
    const published = courses.filter((c) => c.status === "PUBLISHED").length;
    const draft = courses.filter((c) => c.status === "DRAFT").length;
    const avgCommission =
      courses.length > 0
        ? Math.round(courses.reduce((acc, c) => acc + c.commissionRate, 0) / courses.length)
        : 0;
    return { total: courses.length, published, draft, avgCommission };
  }, [courses]);

  // Ensure any course category not yet in categories list is available in select dropdown
  const availableCategories = useMemo(() => {
    const list = [...categories];
    if (
      formData.categorySlug &&
      !list.some((cat) => cat.slug === formData.categorySlug)
    ) {
      list.push({
        id: `temp_${formData.categorySlug}`,
        name: formData.categorySlug,
        nameBn: formData.categoryNameBn || formData.categorySlug,
        slug: formData.categorySlug,
        createdAt: new Date().toISOString(),
      });
    }
    return list;
  }, [categories, formData.categorySlug, formData.categoryNameBn]);

  // Open Create Modal
  const handleOpenCreate = () => {
    const defaultCat = categories[0];
    setEditingCourse(null);
    setModalTab("basic");
    setShowInlineCategoryForm(false);
    setInlineCategoryNameBn("");
    setInlineCategoryNameEn("");
    setFormData({
      ...DEFAULT_FORM,
      categorySlug: defaultCat?.slug || DEFAULT_FORM.categorySlug,
      categoryNameBn: defaultCat?.nameBn || DEFAULT_FORM.categoryNameBn,
      learningOutcomes: [...DEFAULT_LEARNING_OUTCOMES],
      instructions: [
        "কোর্সটি শুরু করার আগে প্রাথমিক কম্পিউটার ও ইন্টারনেট ব্যবহারের ধারণা থাকা বাঞ্ছনীয়।",
        "প্রতিটি মডিউলের ভিডিও দেখে সাথে সাথে হ্যান্ডস-অন প্র্যাকটিস করুন।",
      ],
      instructor: { ...DEFAULT_INSTRUCTOR },
      instructors: [{ ...DEFAULT_INSTRUCTOR }],
      modules: [],
    });
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (course: MockCourse) => {
    setEditingCourse(course);
    setModalTab("basic");
    setShowInlineCategoryForm(false);
    setInlineCategoryNameBn("");
    setInlineCategoryNameEn("");

    const courseInstructors =
      course.instructors && course.instructors.length > 0
        ? course.instructors.map((ins) => ({ ...ins }))
        : course.instructor
          ? [{ ...course.instructor }]
          : [{ ...DEFAULT_INSTRUCTOR }];

    setFormData({
      ...course,
      learningOutcomes:
        course.learningOutcomes && course.learningOutcomes.length > 0
          ? [...course.learningOutcomes]
          : [...DEFAULT_LEARNING_OUTCOMES],
      instructions:
        course.instructions && course.instructions.length > 0
          ? [...course.instructions]
          : [],
      instructor: courseInstructors[0],
      instructors: courseInstructors,
      modules: course.modules
        ? course.modules.map((m) => ({
            ...m,
            lessons: m.lessons.map((l) => ({ ...l })),
          }))
        : [],
    });
    setIsModalOpen(true);
  };

  // Single Instructor helper for backward compatibility
  const updateInstructor = (patch: Partial<MockInstructor>) => {
    handleUpdateInstructor(0, patch);
  };

  // Multiple Instructors helpers
  const handleAddInstructor = () => {
    setFormData((prev) => {
      const currentInstructors =
        prev.instructors && prev.instructors.length > 0
          ? [...prev.instructors]
          : prev.instructor
            ? [{ ...prev.instructor }]
            : [{ ...DEFAULT_INSTRUCTOR }];

      const newInstructor: MockInstructor = {
        name: "",
        avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80",
        designation: "কো-ইন্সট্রাক্টর",
        instructorType: "CO",
        instructorTypeBn: "কো-ইন্সট্রাক্টর",
        description: "",
      };

      const nextList = [...currentInstructors, newInstructor];
      return {
        ...prev,
        instructors: nextList,
        instructor: nextList[0],
      };
    });
  };

  const handleUpdateInstructor = (index: number, patch: Partial<MockInstructor>) => {
    setFormData((prev) => {
      const currentInstructors =
        prev.instructors && prev.instructors.length > 0
          ? [...prev.instructors]
          : prev.instructor
            ? [{ ...prev.instructor }]
            : [{ ...DEFAULT_INSTRUCTOR }];

      const target = currentInstructors[index] || { ...DEFAULT_INSTRUCTOR };
      const next = { ...target, ...patch };
      if (patch.instructorType) {
        next.instructorTypeBn =
          patch.instructorType === "CO" ? "কো-ইন্সট্রাক্টর" : "লিড ইন্সট্রাক্টর";
      }
      currentInstructors[index] = next;

      return {
        ...prev,
        instructors: currentInstructors,
        instructor: currentInstructors[0],
      };
    });
  };

  const handleRemoveInstructor = (index: number) => {
    setFormData((prev) => {
      const currentInstructors = (
        prev.instructors && prev.instructors.length > 0
          ? prev.instructors
          : prev.instructor
            ? [prev.instructor]
            : [{ ...DEFAULT_INSTRUCTOR }]
      ).filter((_, i) => i !== index);

      const finalList = currentInstructors.length > 0 ? currentInstructors : [{ ...DEFAULT_INSTRUCTOR }];
      return {
        ...prev,
        instructors: finalList,
        instructor: finalList[0],
      };
    });
  };

  // Learning outcomes helpers
  const handleAddOutcome = () => {
    setFormData((prev) => ({
      ...prev,
      learningOutcomes: [...(prev.learningOutcomes || []), ""],
    }));
  };

  const handleUpdateOutcome = (index: number, value: string) => {
    setFormData((prev) => {
      const list = [...(prev.learningOutcomes || [])];
      list[index] = value;
      return { ...prev, learningOutcomes: list };
    });
  };

  const handleRemoveOutcome = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      learningOutcomes: (prev.learningOutcomes || []).filter((_, i) => i !== index),
    }));
  };

  // Multiple Instructions / Course Guidelines helpers
  const handleAddInstruction = () => {
    setFormData((prev) => ({
      ...prev,
      instructions: [...(prev.instructions || []), ""],
    }));
  };

  const handleUpdateInstruction = (index: number, value: string) => {
    setFormData((prev) => {
      const list = [...(prev.instructions || [])];
      list[index] = value;
      return { ...prev, instructions: list };
    });
  };

  const handleRemoveInstruction = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      instructions: (prev.instructions || []).filter((_, i) => i !== index),
    }));
  };

  // Modules & Lessons helpers
  const handleAddModule = () => {
    const nextIdx = (formData.modules?.length || 0) + 1;
    setFormData((prev) => ({
      ...prev,
      modules: [
        ...(prev.modules || []),
        {
          id: `mod_${Date.now()}_${nextIdx}`,
          titleBn: `মডিউল ${formatBnNumber(nextIdx)}: নতুন মডিউল`,
          lessons: [],
        },
      ],
    }));
  };

  const handleUpdateModuleTitle = (moduleId: string, titleBn: string) => {
    setFormData((prev) => ({
      ...prev,
      modules: (prev.modules || []).map((m) =>
        m.id === moduleId ? { ...m, titleBn } : m
      ),
    }));
  };

  const handleRemoveModule = (moduleId: string) => {
    setFormData((prev) => ({
      ...prev,
      modules: (prev.modules || []).filter((m) => m.id !== moduleId),
    }));
  };

  const handleAddLesson = (moduleId: string) => {
    setFormData((prev) => ({
      ...prev,
      modules: (prev.modules || []).map((m) =>
        m.id === moduleId
          ? {
              ...m,
              lessons: [
                ...m.lessons,
                {
                  id: `lsn_${Date.now()}_${m.lessons.length + 1}`,
                  titleBn: "",
                  duration: "১৫ মিনিট",
                  content: "",
                  videoUrl: "",
                  isFreePreview: false,
                },
              ],
            }
          : m
      ),
    }));
  };

  const handleUpdateLesson = (
    moduleId: string,
    lessonId: string,
    patch: Partial<MockCourse["modules"][number]["lessons"][number]>
  ) => {
    setFormData((prev) => ({
      ...prev,
      modules: (prev.modules || []).map((m) =>
        m.id === moduleId
          ? {
              ...m,
              lessons: m.lessons.map((l) =>
                l.id === lessonId ? { ...l, ...patch } : l
              ),
            }
          : m
      ),
    }));
  };

  const handleRemoveLesson = (moduleId: string, lessonId: string) => {
    setFormData((prev) => ({
      ...prev,
      modules: (prev.modules || []).map((m) =>
        m.id === moduleId
          ? { ...m, lessons: m.lessons.filter((l) => l.id !== lessonId) }
          : m
      ),
    }));
  };

  // Handle Category Select
  const handleCategoryChange = (slug: string) => {
    const matched = availableCategories.find((cat) => cat.slug === slug);
    setFormData((prev) => ({
      ...prev,
      categorySlug: slug,
      categoryNameBn: matched ? matched.nameBn : prev.categoryNameBn,
    }));
  };

  // Create custom category inline from Course Modal
  const handleCreateInlineCategory = async () => {
    if (!inlineCategoryNameBn.trim()) {
      showToast("error", "দয়া করে নতুন ক্যাটাগরির নাম লিখুন।");
      return;
    }

    setIsCreatingInlineCategory(true);
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nameBn: inlineCategoryNameBn.trim(),
          name: inlineCategoryNameEn.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "ক্যাটাগরি তৈরি করা যায়নি");
      }

      const createdCat: MockCourseCategory = data.data;
      setCategories((prev) => [...prev, createdCat]);
      setFormData((prev) => ({
        ...prev,
        categorySlug: createdCat.slug,
        categoryNameBn: createdCat.nameBn,
      }));
      setInlineCategoryNameBn("");
      setInlineCategoryNameEn("");
      setShowInlineCategoryForm(false);
      showToast("success", `"${createdCat.nameBn}" ক্যাটাগরি যুক্ত ও সিলেক্ট করা হয়েছে!`);
      router.refresh();
    } catch (err: any) {
      showToast("error", err.message || "ক্যাটাগরি তৈরি ব্যর্থ হয়েছে");
    } finally {
      setIsCreatingInlineCategory(false);
    }
  };

  // Create custom category from Category Manager Modal
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryNameBn.trim()) {
      showToast("error", "ক্যাটাগরির বাংলা নাম প্রদান করুন।");
      return;
    }

    setIsSavingCategory(true);
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nameBn: newCategoryNameBn.trim(),
          name: newCategoryNameEn.trim() || undefined,
          slug: newCategorySlug.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "ক্যাটাগরি যুক্ত করা যায়নি");
      }

      setCategories((prev) => [...prev, data.data]);
      setNewCategoryNameBn("");
      setNewCategoryNameEn("");
      setNewCategorySlug("");
      showToast("success", `"${data.data.nameBn}" ক্যাটাগরি সফলভাবে যুক্ত হয়েছে!`);
      router.refresh();
    } catch (err: any) {
      showToast("error", err.message || "ক্যাটাগরি যুক্ত ব্যর্থ হয়েছে");
    } finally {
      setIsSavingCategory(false);
    }
  };

  // Rename category from Category Manager Modal
  const handleUpdateCategory = async (cat: MockCourseCategory) => {
    if (!editingCategoryNameBn.trim()) {
      showToast("error", "ক্যাটাগরির নাম খালি রাখা যাবে না।");
      return;
    }

    setIsSavingCategory(true);
    try {
      const res = await fetch("/api/admin/categories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: cat.id,
          nameBn: editingCategoryNameBn.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "ক্যাটাগরি আপডেট ব্যর্থ হয়েছে");
      }

      const updatedCat: MockCourseCategory = data.data;
      setCategories((prev) => prev.map((c) => (c.id === cat.id ? updatedCat : c)));
      setCourses((prev) =>
        prev.map((course) =>
          course.categorySlug === cat.slug
            ? { ...course, categoryNameBn: updatedCat.nameBn }
            : course
        )
      );
      setEditingCategoryId(null);
      setEditingCategoryNameBn("");
      showToast("success", "ক্যাটাগরির নাম আপডেট করা হয়েছে!");
      router.refresh();
    } catch (err: any) {
      showToast("error", err.message || "ক্যাটাগরি আপডেট ব্যর্থ হয়েছে");
    } finally {
      setIsSavingCategory(false);
    }
  };

  // Delete category from Category Manager Modal
  const handleDeleteCategory = async (cat: MockCourseCategory) => {
    setDeletingCategoryId(cat.id);
    try {
      const res = await fetch(`/api/admin/categories?id=${cat.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "ক্যাটাগরি ডিলিট করা যায়নি");
      }

      setCategories((prev) => prev.filter((c) => c.id !== cat.id));
      if (categoryFilter === cat.slug) {
        setCategoryFilter("ALL");
      }
      showToast("success", `"${cat.nameBn}" ক্যাটাগরি ডিলিট করা হয়েছে।`);
      router.refresh();
    } catch (err: any) {
      showToast("error", err.message || "ক্যাটাগরি ডিলিট ব্যর্থ হয়েছে");
    } finally {
      setDeletingCategoryId(null);
    }
  };

  // Auto-generate slug from English title when creating
  const handleTitleChange = (val: string) => {
    setFormData((prev) => {
      const updated = { ...prev, title: val };
      if (!editingCourse) {
        updated.slug = val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");
      }
      return updated;
    });
  };

  // Submit Create or Update
  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.titleBn?.trim() || !formData.title?.trim()) {
      setModalTab("basic");
      showToast("error", "দয়া করে কোর্সের বাংলা ও ইংরেজি শিরোনাম (Title) লিখুন।");
      return;
    }

    const cleanedModules = (formData.modules || [])
      .map((mod) => ({
        ...mod,
        titleBn: mod.titleBn.trim() || "নতুন মডিউল",
        lessons: mod.lessons
          .filter((l) => l.titleBn.trim().length > 0)
          .map((l) => ({
            ...l,
            titleBn: l.titleBn.trim(),
            duration: l.duration.trim() || "১৫ মিনিট",
            content: l.content.trim(),
            videoUrl: l.videoUrl?.trim() || undefined,
          })),
      }));

    const cleanedOutcomes = (formData.learningOutcomes || [])
      .map((item) => item.trim())
      .filter(Boolean);

    const payloadBody = {
      ...formData,
      learningOutcomes: cleanedOutcomes,
      modules: cleanedModules,
    };

    setIsSubmitting(true);
    try {
      const method = editingCourse ? "PUT" : "POST";
      const payload = editingCourse ? { id: editingCourse.id, ...payloadBody } : payloadBody;

      const res = await fetch("/api/admin/courses", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "অপারেশন ব্যর্থ হয়েছে");
      }

      if (editingCourse) {
        setCourses((prev) =>
          prev.map((c) => (c.id === editingCourse.id ? data.data : c))
        );
        showToast("success", "কোর্সের তথ্য সফলভাবে আপডেট করা হয়েছে!");
      } else {
        setCourses((prev) => [data.data, ...prev]);
        showToast("success", "নতুন কোর্স সফলভাবে যুক্ত করা হয়েছে!");
      }

      setIsModalOpen(false);
      router.refresh();
    } catch (err: any) {
      showToast("error", err.message || "সার্ভার ত্রুটি ঘটেছে");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick Status Toggle
  const handleQuickStatusChange = async (course: MockCourse, newStatus: MockCourse["status"]) => {
    try {
      const res = await fetch("/api/admin/courses", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: course.id, status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message);

      setCourses((prev) => prev.map((c) => (c.id === course.id ? data.data : c)));
      showToast("success", `কোর্স স্ট্যাটাস "${newStatus}" করা হয়েছে।`);
      router.refresh();
    } catch (err: any) {
      showToast("error", err.message || "স্ট্যাটাস পরিবর্তন করা যায়নি");
    }
  };

  // Delete Course
  const handleConfirmDelete = async () => {
    if (!courseToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/courses?id=${courseToDelete.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message);

      setCourses((prev) => prev.filter((c) => c.id !== courseToDelete.id));
      showToast("success", `"${courseToDelete.titleBn}" সফলভাবে ডিলিট করা হয়েছে।`);
      setCourseToDelete(null);
      router.refresh();
    } catch (err: any) {
      showToast("error", err.message || "ডিলিট ব্যর্থ হয়েছে");
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusBadge = (status: MockCourse["status"]) => {
    switch (status) {
      case "PUBLISHED":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "DRAFT":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "UNPUBLISHED":
        return "bg-slate-100 text-slate-600 border-slate-200";
      case "ARCHIVED":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const getStatusLabelBn = (status: MockCourse["status"]) => {
    switch (status) {
      case "PUBLISHED":
        return "প্রকাশিত (Published)";
      case "DRAFT":
        return "ড্রাফট (Draft)";
      case "UNPUBLISHED":
        return "অপ্রকাশিত";
      case "ARCHIVED":
        return "আর্কাইভড";
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      
      {/* Feedback Toast */}
      {feedback && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl border text-xs font-bold animate-in slide-in-from-bottom-5 duration-200 ${
            feedback.type === "success"
              ? "bg-emerald-900 text-white border-emerald-700"
              : "bg-rose-900 text-white border-rose-700"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Header + Add New Course Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#172033] tracking-tight flex items-center gap-2.5">
            <span>কোর্স ম্যানেজমেন্ট</span>
            <span className="text-xs font-extrabold bg-slate-200/70 text-slate-700 px-2.5 py-0.5 rounded-full">
              {formatBnNumber(courses.length)} টি কোর্স
            </span>
          </h1>
          <p className="text-xs text-[#64748B] mt-1">
            নতুন কোর্স যুক্ত করুন, মূল্য ও অ্যাফিলিয়েট কমিশন নির্ধারণ এবং কোর্স এডিট বা ডিলিট করুন।
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setIsCategoryModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 text-slate-700 hover:text-blue-700 text-xs sm:text-sm font-bold shadow-2xs transition-all cursor-pointer"
          >
            <FolderPlus className="w-4 h-4 text-blue-600" />
            <span>ক্যাটাগরি ম্যানেজ ({formatBnNumber(categories.length)})</span>
          </button>

          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#E53945] to-rose-600 hover:from-red-600 hover:to-rose-700 text-white text-xs sm:text-sm font-black shadow-lg shadow-red-500/25 hover:scale-[1.02] transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>নতুন কোর্স যোগ করুন</span>
          </button>
        </div>
      </div>

      {/* Summary Mini KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500">মোট কোর্স</p>
            <p className="text-xl font-black text-slate-900 mt-0.5">{formatBnNumber(stats.total)} টি</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500">লাইভ / প্রকাশিত</p>
            <p className="text-xl font-black text-emerald-600 mt-0.5">{formatBnNumber(stats.published)} টি</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500">ড্রাফট / অপেক্ষমাণ</p>
            <p className="text-xl font-black text-amber-600 mt-0.5">{formatBnNumber(stats.draft)} টি</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500">গড় অ্যাফিলিয়েট কমিশন</p>
            <p className="text-xl font-black text-blue-600 mt-0.5">{formatBnNumber(stats.avgCommission)}%</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="কোর্সের নাম, ক্যাটাগরি বা স্লাগ দিয়ে সার্চ করুন..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-hidden focus:bg-white focus:border-blue-500 transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-hidden focus:border-blue-500 cursor-pointer"
          >
            <option value="ALL">সকল ক্যাটাগরি</option>
            {categories.map((cat) => (
              <option key={cat.slug} value={cat.slug}>
                {cat.nameBn}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-hidden focus:border-blue-500 cursor-pointer"
          >
            <option value="ALL">সকল স্ট্যাটাস</option>
            <option value="PUBLISHED">প্রকাশিত (Published)</option>
            <option value="DRAFT">ড্রাফট (Draft)</option>
            <option value="UNPUBLISHED">অপ্রকাশিত</option>
            <option value="ARCHIVED">আর্কাইভড</option>
          </select>
        </div>
      </div>

      {/* Courses Table */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="overflow-x-auto overscroll-x-contain">
          <table className="w-full text-left border-collapse text-xs min-w-[760px]">
            <thead>
              <tr className="bg-slate-50/90 border-b border-slate-200 text-[#64748B] font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">কোর্স ও বিবরণ</th>
                <th className="py-3.5 px-4">ক্যাটাগরি</th>
                <th className="py-3.5 px-4">মূল্য (Offer / Regular)</th>
                <th className="py-3.5 px-4">অ্যাফিলিয়েট কমিশন</th>
                <th className="py-3.5 px-4">লেসন ও সময়</th>
                <th className="py-3.5 px-4">স্ট্যাটাস</th>
                <th className="py-3.5 px-4 text-right">অ্যাকশন (CRUD)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[#172033]">
              {filteredCourses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-500">
                    <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="font-bold text-sm text-slate-700">কোনো কোর্স পাওয়া যায়নি</p>
                    <p className="text-xs text-slate-400 mt-1">অন্য কোনো কীওয়ার্ড দিয়ে সার্চ করুন অথবা নতুন কোর্স যোগ করুন।</p>
                  </td>
                </tr>
              ) : (
                filteredCourses.map((c) => {
                  const estimatedCommission = Math.round((c.price * c.commissionRate) / 100);
                  return (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="flex items-center gap-3">
                          <div className="relative w-14 h-10 rounded-lg overflow-hidden shrink-0 border border-slate-200 bg-slate-100">
                            <img
                              src={c.thumbnail}
                              alt={c.titleBn}
                              className="w-full h-full object-cover"
                            />
                            {c.featured && (
                              <span
                                title="Featured Course"
                                className="absolute top-0.5 left-0.5 bg-amber-400 text-slate-900 p-0.5 rounded shadow-xs"
                              >
                                <Star className="w-2.5 h-2.5 fill-current" />
                              </span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-extrabold text-slate-900 line-clamp-1">{c.titleBn}</p>
                            <p className="text-[11px] text-slate-400 font-mono truncate">{c.slug}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                          <Tag className="w-3 h-3 text-slate-400" />
                          {c.categoryNameBn}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-black text-[#E53945] text-sm">{formatBDT(c.price)}</div>
                        {c.originalPrice > c.price && (
                          <div className="text-[11px] text-slate-400 line-through">
                            {formatBDT(c.originalPrice)}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex flex-col">
                          <span className="font-black text-[#16A34A] text-sm">
                            {formatBnNumber(c.commissionRate)}%
                          </span>
                          <span className="text-[10px] font-semibold text-slate-500">
                            আয়: {formatBDT(estimatedCommission)}/সেল
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-700">{formatBnNumber(c.totalLessons)} টি লেসন</div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {c.duration}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <select
                          value={c.status}
                          onChange={(e) =>
                            handleQuickStatusChange(c, e.target.value as MockCourse["status"])
                          }
                          className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border cursor-pointer focus:outline-hidden ${getStatusBadge(
                            c.status
                          )}`}
                        >
                          <option value="PUBLISHED">প্রকাশিত</option>
                          <option value="DRAFT">ড্রাফট</option>
                          <option value="UNPUBLISHED">অপ্রকাশিত</option>
                          <option value="ARCHIVED">আর্কাইভড</option>
                        </select>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <Link
                            href={`/courses/${c.slug}`}
                            target="_blank"
                            title="পাবলিক প্রিভিউ দেখুন"
                            className="p-2 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>

                          <button
                            type="button"
                            onClick={() => handleOpenEdit(c)}
                            title="কোর্স এডিট করুন"
                            className="p-2 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setCourseToDelete(c)}
                            title="কোর্স ডিলিট করুন"
                            className="p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div
            className="fixed inset-0 bg-slate-950/65 backdrop-blur-xs"
            onClick={() => !isSubmitting && setIsModalOpen(false)}
          />

          <div className="relative z-10 bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-red-50 text-[#E53945] flex items-center justify-center">
                  {editingCourse ? <Edit3 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900">
                    {editingCourse ? "কোর্সের তথ্য আপডেট করুন" : "নতুন কোর্স যুক্ত করুন"}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    কোর্সের শিরোনাম, মূল্য, অ্যাফিলিয়েট কমিশন এবং সিলেবাস বিবরণ নির্ধারণ করুন।
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => !isSubmitting && setIsModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="px-4 sm:px-6 pt-2.5 sm:pt-3 border-b border-slate-100 bg-white flex items-center gap-2 overflow-x-auto shrink-0">
              <button
                type="button"
                onClick={() => setModalTab("basic")}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                  modalTab === "basic"
                    ? "border-[#E53945] text-[#E53945]"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>মৌলিক তথ্য ও মূল্য</span>
              </button>

              <button
                type="button"
                onClick={() => setModalTab("instructor")}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                  modalTab === "instructor"
                    ? "border-[#E53945] text-[#E53945]"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>ইন্সট্রাক্টর ও যা শিখবেন</span>
              </button>

              <button
                type="button"
                onClick={() => setModalTab("curriculum")}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                  modalTab === "curriculum"
                    ? "border-[#E53945] text-[#E53945]"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>কারিকুলাম ({formatBnNumber(formData.modules?.length || 0)} মডিউল)</span>
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSaveCourse} className="flex-1 flex flex-col overflow-hidden text-xs">
              <div className="flex-1 overflow-y-auto p-6 space-y-5">

              {modalTab === "basic" && (
                <>
              {/* Titles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 block">
                    কোর্সের নাম (বাংলা) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.titleBn || ""}
                    onChange={(e) => setFormData({ ...formData, titleBn: e.target.value })}
                    placeholder="যেমন: ফুলস্ট্যাক ওয়েব ডেভেলপমেন্ট মাস্টারি"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-hidden bg-slate-50/50 focus:bg-white font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 block">
                    কোর্সের নাম (English) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title || ""}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="e.g. Full Stack Web Development Mastery"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-hidden bg-slate-50/50 focus:bg-white font-medium"
                  />
                </div>
              </div>

              {/* Slug & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 block">URL স্লাগ (Slug)</label>
                  <input
                    type="text"
                    value={formData.slug || ""}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="full-stack-web-development"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-hidden bg-slate-50/50 focus:bg-white font-mono text-[11px]"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <label className="font-bold text-slate-700 block">ক্যাটাগরি</label>
                    <button
                      type="button"
                      onClick={() => setShowInlineCategoryForm((prev) => !prev)}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
                    >
                      {showInlineCategoryForm ? (
                        <>
                          <X className="w-3 h-3" />
                          <span>বাতিল</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3 h-3" />
                          <span>নতুন ক্যাটাগরি</span>
                        </>
                      )}
                    </button>
                  </div>
                  <select
                    value={formData.categorySlug || availableCategories[0]?.slug || "web-development"}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-hidden bg-slate-50/50 focus:bg-white font-semibold"
                  >
                    {availableCategories.map((cat) => (
                      <option key={cat.slug} value={cat.slug}>
                        {cat.nameBn}
                      </option>
                    ))}
                  </select>

                  {showInlineCategoryForm && (
                    <div className="mt-2 p-3 rounded-xl bg-blue-50/70 border border-blue-200 space-y-2.5">
                      <p className="text-[11px] font-extrabold text-blue-900">
                        কাস্টম ক্যাটাগরি যুক্ত করুন
                      </p>
                      <input
                        type="text"
                        value={inlineCategoryNameBn}
                        onChange={(e) => setInlineCategoryNameBn(e.target.value)}
                        placeholder="ক্যাটাগরির নাম (বাংলা) *"
                        className="w-full px-3 py-2 rounded-lg border border-blue-200 bg-white text-xs font-medium focus:border-blue-500 focus:outline-hidden"
                      />
                      <input
                        type="text"
                        value={inlineCategoryNameEn}
                        onChange={(e) => setInlineCategoryNameEn(e.target.value)}
                        placeholder="English Name (Slug তৈরির জন্য - ঐচ্ছিক)"
                        className="w-full px-3 py-2 rounded-lg border border-blue-200 bg-white text-xs font-medium focus:border-blue-500 focus:outline-hidden"
                      />
                      <div className="flex justify-end">
                        <button
                          type="button"
                          disabled={isCreatingInlineCategory}
                          onClick={handleCreateInlineCategory}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold transition-colors cursor-pointer disabled:opacity-60"
                        >
                          {isCreatingInlineCategory ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Plus className="w-3 h-3" />
                          )}
                          <span>যুক্ত ও সিলেক্ট করুন</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Pricing & Commission */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 block">
                    বিক্রয় মূল্য (৳ BDT) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formData.price ?? 0}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-hidden bg-white font-black text-rose-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 block">পূর্বের মূল্য (Regular ৳)</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.originalPrice ?? 0}
                    onChange={(e) =>
                      setFormData({ ...formData, originalPrice: Number(e.target.value) })
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-hidden bg-white font-bold text-slate-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 block">
                    অ্যাফিলিয়েট কমিশন (%)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={80}
                    value={formData.commissionRate ?? 20}
                    onChange={(e) =>
                      setFormData({ ...formData, commissionRate: Number(e.target.value) })
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-hidden bg-white font-black text-emerald-600"
                  />
                  <p className="text-[10px] text-emerald-700 font-semibold">
                    প্রতি সেলে কমিশন:{" "}
                    {formatBDT(
                      Math.round(((formData.price || 0) * (formData.commissionRate || 0)) / 100)
                    )}
                  </p>
                </div>
              </div>

              {/* Thumbnail URL & Live Preview */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                <div className="sm:col-span-2 space-y-3">
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700 flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-slate-400" />
                      <span>থাম্বনেইল ইমেজ URL</span>
                    </label>
                    <input
                      type="url"
                      value={formData.thumbnail || ""}
                      onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-hidden bg-slate-50/50 focus:bg-white text-[11px]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700 flex items-center gap-1.5">
                      <Video className="w-3.5 h-3.5 text-slate-400" />
                      <span>প্রিভিউ ভিডিও URL (ঐচ্ছিক)</span>
                    </label>
                    <input
                      type="url"
                      value={formData.previewVideoUrl || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, previewVideoUrl: e.target.value })
                      }
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-hidden bg-slate-50/50 focus:bg-white text-[11px]"
                    />
                  </div>
                </div>
                <div className="h-28 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center">
                  {formData.thumbnail ? (
                    <img
                      src={formData.thumbnail}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-[10px] text-slate-400">No Image</span>
                  )}
                </div>
              </div>

              {/* Lessons, Duration, Difficulty, Status */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 block">মোট লেসন</label>
                  <input
                    type="number"
                    min={1}
                    value={formData.totalLessons ?? 20}
                    onChange={(e) =>
                      setFormData({ ...formData, totalLessons: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-hidden bg-slate-50/50 focus:bg-white font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 block">সময়কাল</label>
                  <input
                    type="text"
                    value={formData.duration || ""}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="৩০+ ঘণ্টা"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-hidden bg-slate-50/50 focus:bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 block">লেভেল</label>
                  <input
                    type="text"
                    value={formData.difficulty || ""}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                    placeholder="সকল স্তরের জন্য"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-hidden bg-slate-50/50 focus:bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 block">স্ট্যাটাস</label>
                  <select
                    value={formData.status || "PUBLISHED"}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value as MockCourse["status"] })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-hidden bg-slate-50/50 focus:bg-white font-bold"
                  >
                    <option value="PUBLISHED">প্রকাশিত</option>
                    <option value="DRAFT">ড্রাফট</option>
                    <option value="UNPUBLISHED">অপ্রকাশিত</option>
                    <option value="ARCHIVED">আর্কাইভড</option>
                  </select>
                </div>
              </div>

              {/* Summary & Description */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">সংক্ষিপ্ত সারসংক্ষেপ (Summary)</label>
                <input
                  type="text"
                  value={formData.summaryBn || ""}
                  onChange={(e) => setFormData({ ...formData, summaryBn: e.target.value })}
                  placeholder="কোর্স সম্পর্কে এক লাইনের আকর্ষণীয় বিবরণ..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-hidden bg-slate-50/50 focus:bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">বিস্তারিত বিবরণ (Description)</label>
                <textarea
                  rows={3}
                  value={formData.descriptionBn || ""}
                  onChange={(e) => setFormData({ ...formData, descriptionBn: e.target.value })}
                  placeholder="কোর্সটি কেন করবেন এবং কী কী শিখবেন তার বিস্তারিত..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-hidden bg-slate-50/50 focus:bg-white resize-none"
                />
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap items-center gap-6 pt-2">
                <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.isAffiliateEligible ?? true}
                    onChange={(e) =>
                      setFormData({ ...formData, isAffiliateEligible: e.target.checked })
                    }
                    className="w-4 h-4 rounded text-blue-600 focus:ring-0"
                  />
                  <span className="font-bold text-slate-700">অ্যাফিলিয়েট প্রোগ্রামের জন্য প্রযোজ্য</span>
                </label>

                <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.featured ?? false}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-0"
                  />
                  <span className="font-bold text-slate-700 flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-current" />
                    হোমপেজে ফিচার্ড করুন
                  </span>
                </label>
              </div>
                </>
              )}

              {modalTab === "instructor" && (
                <div className="space-y-6">
                  {/* Multiple Course Instructors Section */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div>
                        <h4 className="font-extrabold text-slate-900 flex items-center gap-2 text-sm">
                          <Users className="w-4 h-4 text-blue-600" />
                          <span>কোর্স ইন্সট্রাক্টরবৃন্দ ({formatBnNumber((formData.instructors || []).length || 1)} জন)</span>
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          একাধিক ইন্সট্রাক্টর যোগ করতে পারেন (লিড ইন্সট্রাক্টর, কো-ইন্সট্রাক্টর বা মেন্টর)
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleAddInstructor}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer transition-colors shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>নতুন ইন্সট্রাক্টর যোগ করুন</span>
                      </button>
                    </div>

                    {/* Instructor Cards List */}
                    <div className="space-y-4">
                      {(formData.instructors && formData.instructors.length > 0
                        ? formData.instructors
                        : formData.instructor
                          ? [formData.instructor]
                          : [{ ...DEFAULT_INSTRUCTOR }]
                      ).map((ins, index) => (
                        <div
                          key={index}
                          className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs space-y-4 transition-all"
                        >
                          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold flex items-center justify-center">
                                {formatBnNumber(index + 1)}
                              </span>
                              <span className="font-extrabold text-slate-800 text-xs">
                                {ins.name ? ins.name : `ইন্সট্রাক্টর #${formatBnNumber(index + 1)}`}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                                  ins.instructorType === "CO"
                                    ? "bg-purple-50 text-purple-700 border-purple-200"
                                    : "bg-blue-50 text-blue-700 border-blue-200"
                                }`}
                              >
                                {ins.instructorType === "CO" ? "কো-ইন্সট্রাক্টর" : "লিড ইন্সট্রাক্টর"}
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleRemoveInstructor(index)}
                              disabled={(formData.instructors || []).length <= 1}
                              title={(formData.instructors || []).length <= 1 ? "ন্যূনতম একজন ইন্সট্রাক্টর আবশ্যক" : "মুছে ফেলুন"}
                              className={`p-1.5 rounded-lg transition-colors ${
                                (formData.instructors || []).length <= 1
                                  ? "text-slate-300 cursor-not-allowed"
                                  : "text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                              }`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="space-y-1">
                              <label className="text-xs font-bold text-slate-700 block">
                                ইন্সট্রাক্টরের নাম <span className="text-rose-500">*</span>
                              </label>
                              <input
                                type="text"
                                value={ins.name || ""}
                                onChange={(e) => handleUpdateInstructor(index, { name: e.target.value })}
                                placeholder="যেমন: মাহমুদুর রহমান"
                                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:border-blue-500 focus:outline-hidden font-medium"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-xs font-bold text-slate-700 block">
                                পদবি (Designation)
                              </label>
                              <input
                                type="text"
                                value={ins.designation || ""}
                                onChange={(e) => handleUpdateInstructor(index, { designation: e.target.value })}
                                placeholder="যেমন: লিড সফটওয়্যার ইঞ্জিনিয়ার"
                                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:border-blue-500 focus:outline-hidden font-medium"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-xs font-bold text-slate-700 block">
                                ইন্সট্রাক্টর ধরন (Role)
                              </label>
                              <select
                                value={ins.instructorType || "LEAD"}
                                onChange={(e) =>
                                  handleUpdateInstructor(index, {
                                    instructorType: e.target.value as "LEAD" | "CO",
                                  })
                                }
                                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:border-blue-500 focus:outline-hidden font-semibold"
                              >
                                <option value="LEAD">লিড ইন্সট্রাক্টর (Lead)</option>
                                <option value="CO">কো-ইন্সট্রাক্টর (Co)</option>
                              </select>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-center">
                            <div className="sm:col-span-3 space-y-1">
                              <label className="text-xs font-bold text-slate-700 block">
                                ছবি URL (Avatar)
                              </label>
                              <input
                                type="url"
                                value={ins.avatar || ""}
                                onChange={(e) => handleUpdateInstructor(index, { avatar: e.target.value })}
                                placeholder="https://images.unsplash.com/..."
                                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:border-blue-500 focus:outline-hidden text-[11px]"
                              />
                            </div>

                            <div className="flex items-center sm:justify-center">
                              <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center shrink-0">
                                {ins.avatar ? (
                                  <img
                                    src={ins.avatar}
                                    alt="Instructor"
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <User className="w-5 h-5 text-slate-300" />
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700 block">
                              ইন্সট্রাক্টর সম্পর্কে বিস্তারিত (Bio)
                            </label>
                            <textarea
                              rows={2}
                              value={ins.description || ""}
                              onChange={(e) => handleUpdateInstructor(index, { description: e.target.value })}
                              placeholder="ইন্সট্রাক্টরের অভিজ্ঞতা ও দক্ষতা সম্পর্কে লিখুন..."
                              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:border-blue-500 focus:outline-hidden resize-none"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* What You'll Learn Section */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <h4 className="font-extrabold text-slate-900 flex items-center gap-2 text-sm">
                          <ListChecks className="w-4 h-4 text-emerald-600" />
                          <span>এই কোর্সে যা যা শিখবেন (Learning Outcomes)</span>
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          কোর্স ডিটেইল পেজের "এই কোর্সে যা যা শিখবেন" সেকশনে দেখানো হবে।
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddOutcome}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold cursor-pointer shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>পয়েন্ট যোগ করুন</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      {(formData.learningOutcomes || []).map((outcome, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <input
                            type="text"
                            value={outcome}
                            onChange={(e) => handleUpdateOutcome(index, e.target.value)}
                            placeholder={`শিক্ষণীয় বিষয় ${formatBnNumber(index + 1)}...`}
                            className="flex-1 px-3 py-2 rounded-xl border border-slate-200 bg-white focus:border-blue-500 focus:outline-hidden font-medium"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveOutcome(index)}
                            title="মুছে ফেলুন"
                            className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}

                      {(formData.learningOutcomes || []).length === 0 && (
                        <p className="text-[11px] text-slate-400 text-center py-3">
                          কোনো পয়েন্ট যোগ করা হয়নি (ডিফল্ট পয়েন্ট ব্যবহৃত হবে)।
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Multiple Instructions / Course Guidelines Section */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <h4 className="font-extrabold text-slate-900 flex items-center gap-2 text-sm">
                          <FileText className="w-4 h-4 text-indigo-600" />
                          <span>কোর্স নির্দেশনা ও নিয়মাবলী (Course Instructions)</span>
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          কোর্স শুরু করার আগে শিক্ষার্থীদের করণীয় ও প্রয়োজনীয় নির্দেশিকা যোগ করুন।
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddInstruction}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold cursor-pointer shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>নির্দেশনা যোগ করুন</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      {(formData.instructions || []).map((instruction, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center shrink-0">
                            {formatBnNumber(index + 1)}
                          </div>
                          <input
                            type="text"
                            value={instruction}
                            onChange={(e) => handleUpdateInstruction(index, e.target.value)}
                            placeholder={`নির্দেশনা ${formatBnNumber(index + 1)}: যেমন- কম্পিউটার বা ইন্টারনেট সংযোগ থাকা আবশ্যক...`}
                            className="flex-1 px-3 py-2 rounded-xl border border-slate-200 bg-white focus:border-indigo-500 focus:outline-hidden font-medium text-xs"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveInstruction(index)}
                            title="মুছে ফেলুন"
                            className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}

                      {(formData.instructions || []).length === 0 && (
                        <p className="text-[11px] text-slate-400 text-center py-3">
                          কোনো বিশেষ নির্দেশনা যোগ করা হয়নি।
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {modalTab === "curriculum" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm">
                        কোর্স কারিকুলাম (মডিউল ও লেসন)
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        কোর্স পেজের সিলেবাস এবং স্টুডেন্ট প্লেয়ারে এই মডিউল ও লেসনগুলো প্রদর্শিত হবে।
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddModule}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>নতুন মডিউল</span>
                    </button>
                  </div>

                  {(formData.modules || []).length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 p-8 text-center space-y-2">
                      <Layers className="w-8 h-8 text-slate-300 mx-auto" />
                      <p className="font-bold text-slate-700">এখনো কোনো মডিউল যোগ করা হয়নি</p>
                      <p className="text-[11px] text-slate-500">
                        "নতুন মডিউল" বাটনে ক্লিক করে কোর্সের সিলেবাস এবং লেসন যোগ করুন।
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {(formData.modules || []).map((mod, mIdx) => (
                        <div
                          key={mod.id}
                          className="rounded-2xl border border-slate-200 bg-slate-50/60 overflow-hidden"
                        >
                          <div className="p-3.5 bg-slate-100/80 border-b border-slate-200 flex items-center gap-2.5">
                            <span className="text-[11px] font-black text-slate-500 shrink-0">
                              #{formatBnNumber(mIdx + 1)}
                            </span>
                            <input
                              type="text"
                              value={mod.titleBn}
                              onChange={(e) => handleUpdateModuleTitle(mod.id, e.target.value)}
                              placeholder="মডিউলের শিরোনাম লিখুন..."
                              className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-bold text-slate-900 focus:border-blue-500 focus:outline-hidden"
                            />
                            <button
                              type="button"
                              onClick={() => handleAddLesson(mod.id)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-blue-200 text-blue-600 hover:bg-blue-50 text-[11px] font-bold cursor-pointer shrink-0"
                            >
                              <Plus className="w-3 h-3" />
                              <span>লেসন</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveModule(mod.id)}
                              title="মডিউল ডিলিট করুন"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="p-3 space-y-2.5">
                            {mod.lessons.length === 0 ? (
                              <p className="text-[11px] text-slate-400 text-center py-2">
                                এই মডিউলে এখনো কোনো লেসন নেই। "+ লেসন" বাটনে ক্লিক করুন।
                              </p>
                            ) : (
                              mod.lessons.map((lesson, lIdx) => (
                                <div
                                  key={lesson.id}
                                  className="p-3 rounded-xl bg-white border border-slate-200 space-y-2.5"
                                >
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="text-[11px] font-bold text-blue-600 flex items-center gap-1">
                                      <PlayCircle className="w-3.5 h-3.5" />
                                      <span>লেসন {formatBnNumber(lIdx + 1)}</span>
                                    </span>

                                    <div className="flex items-center gap-3">
                                      <label className="inline-flex items-center gap-1.5 cursor-pointer select-none">
                                        <input
                                          type="checkbox"
                                          checked={lesson.isFreePreview}
                                          onChange={(e) =>
                                            handleUpdateLesson(mod.id, lesson.id, {
                                              isFreePreview: e.target.checked,
                                            })
                                          }
                                          className="w-3.5 h-3.5 rounded text-emerald-600 focus:ring-0"
                                        />
                                        <span className="text-[11px] font-bold text-emerald-700">
                                          ফ্রি প্রিভিউ
                                        </span>
                                      </label>

                                      <button
                                        type="button"
                                        onClick={() => handleRemoveLesson(mod.id, lesson.id)}
                                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                    <input
                                      type="text"
                                      value={lesson.titleBn}
                                      onChange={(e) =>
                                        handleUpdateLesson(mod.id, lesson.id, {
                                          titleBn: e.target.value,
                                        })
                                      }
                                      placeholder="লেসনের নাম *"
                                      className="sm:col-span-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-blue-500 focus:outline-hidden font-medium"
                                    />
                                    <input
                                      type="text"
                                      value={lesson.duration}
                                      onChange={(e) =>
                                        handleUpdateLesson(mod.id, lesson.id, {
                                          duration: e.target.value,
                                        })
                                      }
                                      placeholder="সময় (যেমন: ২০ মিনিট)"
                                      className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-blue-500 focus:outline-hidden"
                                    />
                                  </div>

                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    <input
                                      type="url"
                                      value={lesson.videoUrl || ""}
                                      onChange={(e) =>
                                        handleUpdateLesson(mod.id, lesson.id, {
                                          videoUrl: e.target.value,
                                        })
                                      }
                                      placeholder="ভিডিও URL (ঐচ্ছিক)"
                                      className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-blue-500 focus:outline-hidden text-[11px]"
                                    />
                                    <input
                                      type="text"
                                      value={lesson.content}
                                      onChange={(e) =>
                                        handleUpdateLesson(mod.id, lesson.id, {
                                          content: e.target.value,
                                        })
                                      }
                                      placeholder="লেসনের সংক্ষিপ্ত নোট/বিবরণ"
                                      className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-blue-500 focus:outline-hidden"
                                    />
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              </div>

              {/* Modal Footer Buttons */}
              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/60 flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 font-bold transition-colors cursor-pointer"
                >
                  বাতিল করুন
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#E53945] hover:bg-red-700 text-white font-black shadow-md shadow-red-500/20 transition-all cursor-pointer disabled:opacity-60"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>
                    {editingCourse ? "পরিবর্তন সেভ করুন" : "নতুন কোর্স তৈরি করুন"}
                  </span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {courseToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div
            className="fixed inset-0 bg-slate-950/65 backdrop-blur-xs"
            onClick={() => !isDeleting && setCourseToDelete(null)}
          />
          <div className="relative z-10 bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md max-h-[92vh] overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-base text-slate-900">কোর্সটি ডিলিট করতে চান?</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  আপনি কি নিশ্চিতভাবে{" "}
                  <strong className="text-slate-800">"{courseToDelete.titleBn}"</strong> কোর্সটি
                  মুছে ফেলতে চান? এটি পুনরুদ্ধার করা যাবে না।
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setCourseToDelete(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                ফিরে যান
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-md shadow-rose-500/20 cursor-pointer disabled:opacity-60"
              >
                {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>হ্যাঁ, ডিলিট করুন</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CATEGORY MANAGEMENT MODAL */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div
            className="fixed inset-0 bg-slate-950/65 backdrop-blur-xs"
            onClick={() => !isSavingCategory && setIsCategoryModalOpen(false)}
          />

          <div className="relative z-10 bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <FolderPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900">
                    কোর্স ক্যাটাগরি ম্যানেজমেন্ট
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    নতুন কাস্টম ক্যাটাগরি যোগ করুন, এডিট করুন বা অপ্রয়োজনীয় ক্যাটাগরি ডিলিট করুন।
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => !isSavingCategory && setIsCategoryModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
              {/* Add Custom Category Form */}
              <form
                onSubmit={handleAddCategory}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3"
              >
                <p className="font-extrabold text-slate-800 flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-blue-600" />
                  <span>নতুন কাস্টম ক্যাটাগরি যোগ করুন</span>
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-600 block">
                      ক্যাটাগরির নাম (বাংলা) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={newCategoryNameBn}
                      onChange={(e) => setNewCategoryNameBn(e.target.value)}
                      placeholder="যেমন: সাইবার সিকিউরিটি"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:border-blue-500 focus:outline-hidden font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-600 block">
                      English Name (ঐচ্ছিক)
                    </label>
                    <input
                      type="text"
                      value={newCategoryNameEn}
                      onChange={(e) => {
                        const val = e.target.value;
                        setNewCategoryNameEn(val);
                        setNewCategorySlug(
                          val
                            .toLowerCase()
                            .replace(/[^a-z0-9]+/g, "-")
                            .replace(/^-|-$/g, "")
                        );
                      }}
                      placeholder="e.g. Cyber Security"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:border-blue-500 focus:outline-hidden font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-600 block">
                      URL স্লাগ (Slug)
                    </label>
                    <input
                      type="text"
                      value={newCategorySlug}
                      onChange={(e) => setNewCategorySlug(e.target.value)}
                      placeholder="auto-generated"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:border-blue-500 focus:outline-hidden font-mono text-[11px]"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSavingCategory}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black shadow-xs transition-colors cursor-pointer disabled:opacity-60"
                  >
                    {isSavingCategory ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Plus className="w-3.5 h-3.5" />
                    )}
                    <span>ক্যাটাগরি যোগ করুন</span>
                  </button>
                </div>
              </form>

              {/* Existing Categories List */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-slate-800">
                    বর্তমান ক্যাটাগরিসমূহ ({formatBnNumber(categories.length)} টি)
                  </h4>
                  <span className="text-[11px] text-slate-400">
                    কোর্স যুক্ত থাকা ক্যাটাগরি ডিলিট করা যাবে না
                  </span>
                </div>

                <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white">
                  {categories.map((cat) => {
                    const courseCount = courses.filter(
                      (c) => c.categorySlug === cat.slug
                    ).length;
                    const isEditing = editingCategoryId === cat.id;

                    return (
                      <div
                        key={cat.id}
                        className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-slate-50/70 transition-colors"
                      >
                        <div className="min-w-0 flex-1">
                          {isEditing ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={editingCategoryNameBn}
                                onChange={(e) => setEditingCategoryNameBn(e.target.value)}
                                className="flex-1 px-3 py-1.5 rounded-lg border border-blue-300 focus:border-blue-500 focus:outline-hidden font-bold text-slate-900"
                              />
                              <button
                                type="button"
                                disabled={isSavingCategory}
                                onClick={() => handleUpdateCategory(cat)}
                                className="p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer disabled:opacity-60"
                                title="সেভ করুন"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingCategoryId(null);
                                  setEditingCategoryNameBn("");
                                }}
                                className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer"
                                title="বাতিল"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900">{cat.nameBn}</span>
                                <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                                  {formatBnNumber(courseCount)} টি কোর্স
                                </span>
                              </div>
                              <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                                {cat.slug}
                              </p>
                            </div>
                          )}
                        </div>

                        {!isEditing && (
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingCategoryId(cat.id);
                                setEditingCategoryNameBn(cat.nameBn);
                              }}
                              title="নাম এডিট করুন"
                              className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              disabled={courseCount > 0 || deletingCategoryId === cat.id}
                              onClick={() => handleDeleteCategory(cat)}
                              title={
                                courseCount > 0
                                  ? "এই ক্যাটাগরিতে কোর্স রয়েছে"
                                  : "ক্যাটাগরি ডিলিট করুন"
                              }
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed"
                            >
                              {deletingCategoryId === cat.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
