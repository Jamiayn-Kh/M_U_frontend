'use client'

import { AppLayout } from '@/components/AppLayout'
import { EmptyState } from '@/components/EmptyState'

export default function ActivityPage() {
  return (
    <AppLayout>
      <div className="space-y-5">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Үйл явцын түүх</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Системийн үйл ажиллагааны бүртгэл</p>
        </div>

        <EmptyState
          title="Түүх одоогоор байхгүй байна"
          description="Үйл явцын түүх бүртгэх функц удахгүй нэмэгдэнэ."
        />
      </div>
    </AppLayout>
  )
}
