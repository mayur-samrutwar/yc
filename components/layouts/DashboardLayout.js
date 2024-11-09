import { useRouter } from 'next/router';
import Link from 'next/link';

export default function DashboardLayout({ children }) {
  const router = useRouter();

  const navigation = [
    { name: 'Admin', href: '/admin' },
    { name: 'Creator', href: '/creator' },
    { name: 'User', href: '/user' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-foreground/5">
        <nav className="mt-16 px-6">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`block py-2 px-4 rounded-lg mb-2 ${
                router.pathname === item.href
                  ? 'bg-foreground text-background'
                  : 'hover:bg-foreground/10'
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="pl-64">
        <header className="h-16 fixed top-0 right-0 left-64 bg-background border-b border-foreground/10 px-8 flex items-center">
          <h1 className="text-xl font-semibold">Dashboard</h1>
        </header>
        <main className="pt-16 px-8 py-6">
          {children}
        </main>
      </div>
    </div>
  );
}
