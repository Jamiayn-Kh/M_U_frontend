import type { Adjustment, MoldOrderItem } from '@/types'

export interface EffectiveOrderItem {
  moldCode: string
  codePrefix: string
  quantity: number
  stoneRequired: boolean
}

function getLatestAdjustment(adjustments: Adjustment[]): Adjustment | undefined {
  return adjustments.reduce<Adjustment | undefined>(
    (latest, current) => !latest || current.id > latest.id ? current : latest,
    undefined
  )
}

export function getEffectiveOrderItems(items: MoldOrderItem[]): EffectiveOrderItem[] {
  return items.flatMap((item) => {
    const latestAdjustment = getLatestAdjustment(item.adjustments ?? [])

    if (latestAdjustment?.action === 'CANCEL') return []

    return [{
      moldCode: latestAdjustment?.finalMoldCode ?? item.moldCode,
      codePrefix: (latestAdjustment?.finalMoldCode ?? item.moldCode).charAt(0),
      quantity: latestAdjustment?.finalQuantity ?? item.quantity,
      stoneRequired: item.stoneRequired,
    }]
  })
}

export function getEffectiveOrderSummary(items: MoldOrderItem[]) {
  const effectiveItems = getEffectiveOrderItems(items)

  return {
    moldCount: effectiveItems.length,
    totalQuantity: effectiveItems.reduce((sum, item) => sum + item.quantity, 0),
    stoneRequiredCount: effectiveItems.filter((item) => item.stoneRequired).length,
  }
}
