'use client'

import { useAuth } from '@/lib/auth-context'
import { Gem, Package, BarChart2, Clock } from 'lucide-react'

export function CraftsmanDashboard() {
  const { user } = useAuth()

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Сайн байна уу, {user?.fullName}!</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Дархан &middot; {user?.organizationName}</p>
      </div>

      {/* Welcome card */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Gem className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">Дарханы самбар</h2>
            <p className="text-xs text-muted-foreground">Мөнгөн урлал систем</p>
          </div>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-sm text-amber-800 leading-relaxed">
            Бараа бүртгэл болон үйлдвэрлэлийн удирдлагын хэсэг дараагийн хөгжүүлэлтээр нэмэгдэнэ.
          </p>
        </div>
      </div>

      {/* Placeholder modules */}
      <div className="grid sm:grid-cols-2 gap-4">
        {[
          { icon: Package, label: 'Бараа бүртгэл', desc: 'Дараагийн хувилбарт нэмэгдэнэ' },
          { icon: BarChart2, label: 'Үйлдвэрлэлийн удирдлага', desc: 'Дараагийн хувилбарт нэмэгдэнэ' },
          { icon: Clock, label: 'Ажлын хуваарь', desc: 'Дараагийн хувилбарт нэмэгдэнэ' },
          { icon: Gem, label: 'Загварын каталог', desc: 'Дараагийн хувилбарт нэмэгдэнэ' },
        ].map(({ icon: Icon, label, desc }) => (
          <div
            key={label}
            className="bg-card border border-dashed border-border rounded-xl p-5 flex items-start gap-3 opacity-60"
          >
            <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
              <Icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
