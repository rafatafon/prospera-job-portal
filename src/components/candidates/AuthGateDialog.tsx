'use client'

import { XIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'

import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Link } from '@/i18n/navigation'

interface AuthGateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AuthGateDialog({ open, onOpenChange }: AuthGateDialogProps) {
  const t = useTranslations('talent')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        {/* Custom overlay with blur — avoids modifying shared dialog.tsx */}
        <DialogOverlay className="backdrop-blur-sm bg-black/40" />

        {/* Custom content div — mirrors DialogContent positioning without its default overlay */}
        <div
          role="dialog"
          aria-modal="true"
          className="fixed top-[50%] left-[50%] z-50 w-full max-w-[calc(100%-2rem)] sm:max-w-md translate-x-[-50%] translate-y-[-50%] focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
        >
          {/* Card with Prospera brand orange top rule */}
          <div className="relative bg-white rounded-xl shadow-2xl overflow-hidden">
            {/* Orange accent rule at the top — the one memorable visual */}
            <div
              className="h-[3px] w-full"
              style={{ backgroundColor: '#E8501C' }}
              aria-hidden="true"
            />

            <div className="px-6 pt-6 pb-7">
              {/* Close button */}
              <DialogClose
                className="absolute top-4 right-4 rounded-sm opacity-60 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 disabled:pointer-events-none"
                aria-label="Close"
              >
                <XIcon className="size-4 text-slate-500" />
                <span className="sr-only">Close</span>
              </DialogClose>

              {/* Icon lockup — small orange shield/lock badge for visual anchor */}
              <div
                className="mb-5 inline-flex items-center justify-center w-10 h-10 rounded-full"
                style={{ backgroundColor: '#FEF0EB' }}
                aria-hidden="true"
              >
                <svg
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="size-5"
                  aria-hidden="true"
                >
                  <path
                    d="M10 2L3 5v5c0 4.418 3.032 8.55 7 9.5C13.968 18.55 17 14.418 17 10V5l-7-3z"
                    fill="#E8501C"
                    fillOpacity="0.15"
                    stroke="#E8501C"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                  <rect
                    x="7.5"
                    y="9"
                    width="5"
                    height="4.5"
                    rx="0.75"
                    fill="#E8501C"
                  />
                  <path
                    d="M8.25 9V7.5a1.75 1.75 0 1 1 3.5 0V9"
                    stroke="#E8501C"
                    strokeWidth="1.25"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              {/* Title & description */}
              <div className="mb-6">
                <DialogTitle className="text-[#0A1628] text-xl font-semibold leading-snug mb-2">
                  {t('authGateTitle')}
                </DialogTitle>
                <DialogDescription className="text-slate-500 text-sm leading-relaxed">
                  {t('authGateDescription')}
                </DialogDescription>
              </div>

              {/* CTAs — stacked on mobile, side-by-side on sm+ */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                {/* Primary: sign up — Prospera orange */}
                <Button
                  asChild
                  size="lg"
                  className="flex-1 font-medium text-white shadow-sm hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: '#E8501C', borderColor: '#E8501C' }}
                >
                  <Link href="/company/signup">
                    {t('signUpCompany')}
                  </Link>
                </Button>

                {/* Secondary: login — outline */}
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="flex-1 font-medium text-slate-700 border-slate-300 hover:bg-slate-50 transition-colors"
                >
                  <Link href="/login">
                    {t('authGateLogin')}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogPortal>
    </Dialog>
  )
}
