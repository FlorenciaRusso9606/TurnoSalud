import { Navbar } from '@/components/layout/Navbar'
import { Sidebar } from '@/components/layout/Sidebar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar />
      <Sidebar />
      <main className="ml-48 pt-14 p-8">
        {children}
      </main>
    </div>
  )
}
