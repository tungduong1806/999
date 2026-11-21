'use client'

import { LocateFixed, LoaderCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

export function LocateButton({ onLocate, pending }: { onLocate: () => void; pending: boolean }) {
  return <Tooltip>
    <TooltipTrigger render={<Button variant="outline" size="icon" className="wx-map-icon" onClick={onLocate} disabled={pending} aria-label="Vị trí của tôi" />}>
      {pending ? <LoaderCircle className="motion-safe:animate-spin" /> : <LocateFixed />}
    </TooltipTrigger>
    <TooltipContent side="left">Vị trí của tôi</TooltipContent>
  </Tooltip>
}
