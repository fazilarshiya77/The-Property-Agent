import type { LucideIcon } from 'lucide-react';
import { useAdminGuard } from '../stores/authStore';
import AdminLayout from '../components/admin/AdminLayout';

interface AdminComingSoonProps {
  title: string;
  icon: LucideIcon;
  description: string;
}

export default function AdminComingSoon({ title, icon: Icon, description }: AdminComingSoonProps) {
  const ready = useAdminGuard();

  if (!ready) return null;

  return (
    <AdminLayout title={title}>
      <div className="mt-2 bg-white rounded-2xl border border-neutral-100 shadow-sm py-16 px-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center mx-auto mb-4">
          <Icon className="h-6 w-6 text-brand-600" />
        </div>
        <h2 className="text-lg font-display font-bold text-navy-900 mb-2">{title} — Coming Soon</h2>
        <p className="text-sm text-neutral-500 max-w-md mx-auto leading-relaxed">{description}</p>
      </div>
    </AdminLayout>
  );
}
