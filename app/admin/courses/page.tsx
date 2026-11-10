import { DataService } from "@/lib/services/data-service";
import { CourseManagementClient } from "./CourseManagementClient";

export const dynamic = "force-dynamic";

export default async function AdminCoursesPage() {
  const [courses, categories] = await Promise.all([
    DataService.getCourses(false),
    DataService.getCategories(),
  ]);

  return (
    <CourseManagementClient
      initialCourses={courses}
      initialCategories={categories}
    />
  );
}
