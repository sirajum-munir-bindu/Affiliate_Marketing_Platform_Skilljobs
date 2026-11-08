"use client";

import { useState } from "react";
import { MockCourse } from "@/lib/db/mock-data";
import { Play, CheckCircle2, BookOpen, Clock, ChevronRight, FileText } from "lucide-react";

interface Props {
  course: MockCourse;
}

export function CoursePlayer({ course }: Props) {
  const firstLesson = course.modules[0]?.lessons[0] || null;
  const [activeLesson, setActiveLesson] = useState<any>(firstLesson);
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);

  const toggleComplete = (lessonId: string) => {
    setCompletedLessonIds((prev) =>
      prev.includes(lessonId) ? prev.filter((id) => id !== lessonId) : [...prev, lessonId]
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      
      {/* Video & Content Stage (8 cols) */}
      <div className="lg:col-span-8 space-y-6">
        
        {/* Responsive Video Container */}
        <div className="aspect-video bg-black rounded-2xl overflow-hidden relative shadow-lg flex items-center justify-center text-white">
          {activeLesson ? (
            <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-slate-900">
              <div className="w-16 h-16 rounded-full bg-red-600/90 flex items-center justify-center text-white mb-4 animate-pulse">
                <Play className="w-8 h-8 fill-current ml-1" />
              </div>
              <h3 className="font-extrabold text-base sm:text-lg max-w-md">{activeLesson.titleBn}</h3>
              <p className="text-xs text-slate-400 mt-1">{activeLesson.duration || "ভিডিও লেসন"}</p>
            </div>
          ) : (
            <p className="text-sm text-slate-400">লেসন নির্বাচন করুন</p>
          )}
        </div>

        {/* Active Lesson Header & Complete button */}
        {activeLesson && (
          <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-[#2563EB]">বর্তমান পাঠ</span>
                <h2 className="text-xl font-bold text-[#172033] mt-0.5">{activeLesson.titleBn}</h2>
              </div>
              <button
                type="button"
                onClick={() => toggleComplete(activeLesson.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                  completedLessonIds.includes(activeLesson.id)
                    ? "bg-emerald-50 text-[#16A34A] border border-emerald-200"
                    : "bg-[#172033] hover:bg-slate-800 text-white"
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {completedLessonIds.includes(activeLesson.id)
                    ? "সম্পন্ন হয়েছে"
                    : "সম্পন্ন হিসেবে চিহ্নিত করুন"}
                </span>
              </button>
            </div>

            {activeLesson.content && (
              <div className="pt-4 border-t border-slate-100 text-xs sm:text-sm text-[#475569] leading-relaxed">
                {activeLesson.content}
              </div>
            )}
          </div>
        )}

      </div>

      {/* Curriculum Playlist Sidebar (4 cols) */}
      <div className="lg:col-span-4 bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden h-fit">
        <div className="p-4 border-b border-slate-100 font-bold text-sm text-[#172033] flex items-center justify-between">
          <span>কোর্স কারিকুলাম</span>
          <span className="text-xs text-slate-500 font-normal">
            {completedLessonIds.length} টি শেষ
          </span>
        </div>

        <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
          {course.modules.map((mod) => (
            <div key={mod.id}>
              <div className="bg-slate-50 px-4 py-2.5 text-xs font-bold text-[#172033]">
                {mod.titleBn}
              </div>
              <div className="divide-y divide-slate-50">
                {mod.lessons.map((lesson) => {
                  const isActive = activeLesson?.id === lesson.id;
                  const isDone = completedLessonIds.includes(lesson.id);
                  return (
                    <button
                      key={lesson.id}
                      type="button"
                      onClick={() => setActiveLesson(lesson)}
                      className={`w-full text-left px-4 py-3 flex items-center justify-between text-xs transition-colors ${
                        isActive
                          ? "bg-blue-50/80 text-[#2563EB] font-bold"
                          : "hover:bg-slate-50 text-[#475569]"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate pr-2">
                        {isDone ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
                        ) : (
                          <Play className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-[#2563EB]" : "text-slate-400"}`} />
                        )}
                        <span className="truncate">{lesson.titleBn}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0 font-normal">
                        {lesson.duration}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
