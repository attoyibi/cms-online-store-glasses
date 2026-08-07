import type { Metadata } from "next";

import { AdminNav } from "@/components/admin/admin-nav";
import { getAdminUser } from "@/lib/supabase/admin";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const user = await getAdminUser();

  // Halaman login memakai layout ini juga, tapi tanpa sidebar.
  if (!user) {
    return <div className="flex min-h-dvh flex-col">{children}</div>;
  }

  return (
    <div className="flex min-h-dvh flex-col lg:flex-row">
      <aside className="border-b bg-card p-4 lg:h-dvh lg:w-64 lg:shrink-0 lg:overflow-y-auto lg:border-b-0 lg:border-r lg:p-5">
        <AdminNav email={user.email ?? "admin"} />
      </aside>

      <div className="flex-1 lg:h-dvh lg:overflow-y-auto">
        <div className="mx-auto w-full max-w-5xl px-5 py-8 sm:px-8">
          {children}
        </div>
      </div>
    </div>
  );
}
