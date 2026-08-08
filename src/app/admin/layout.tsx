import type { Metadata } from "next";

import { AdminNav } from "@/components/admin/admin-nav";
import { NotRegisteredNotice } from "@/components/admin/not-registered-notice";
import { getAdminUser } from "@/lib/supabase/admin";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const session = await getAdminUser();

  // Halaman login memakai layout ini juga, tapi tanpa sidebar.
  if (!session) {
    return <div className="flex min-h-dvh flex-col">{children}</div>;
  }

  const { user, isRegistered } = session;
  const email = user.email ?? "admin";

  return (
    <div className="flex min-h-dvh flex-col lg:flex-row">
      <aside className="border-b bg-card p-4 lg:h-dvh lg:w-64 lg:shrink-0 lg:overflow-y-auto lg:border-b-0 lg:border-r lg:p-5">
        <AdminNav email={email} />
      </aside>

      <div className="flex-1 lg:h-dvh lg:overflow-y-auto">
        <div className="mx-auto w-full max-w-5xl px-5 py-8 sm:px-8">
          {!isRegistered && <NotRegisteredNotice email={email} />}
          {children}
        </div>
      </div>
    </div>
  );
}
