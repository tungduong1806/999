'use client'

import { isServer, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from 'next-themes'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'

let browserClient: QueryClient | undefined

function queryClient() {
  if (isServer) return new QueryClient()
  return browserClient ??= new QueryClient()
}

export function WeatherProviders({ children }: { children: React.ReactNode }) {
  return <ThemeProvider attribute="data-weather-theme" storageKey="khi-viet-theme" defaultTheme="system" enableSystem disableTransitionOnChange>
    <QueryClientProvider client={queryClient()}>
      <TooltipProvider>{children}</TooltipProvider>
      <Toaster position="top-center" />
    </QueryClientProvider>
  </ThemeProvider>
}
