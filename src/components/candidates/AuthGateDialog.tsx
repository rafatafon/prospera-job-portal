'use client'

import { XIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Dialog as DialogPrimitive } from 'radix-ui'

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
        {/* Blurred overlay */}
        <DialogOverlay className="backdrop-blur-sm bg-black/40" />

        {/* Centering container — fixed full-screen flex, centers child reliably */}
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
          <DialogPrimitive.Content
            className="pointer-events-auto relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 duration-200"
          >
            {/* Brand orange top rule */}
            <div
              className="h-[3px] w-full"
              style={{ backgroundColor: '#E8501C' }}
              aria-hidden="true"
            />

            {/* Close button — absolute top-right */}
            <DialogClose
              className="absolute top-4 right-4 rounded-sm opacity-50 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 disabled:pointer-events-none"
              aria-label="Close"
            >
              <XIcon className="size-4 text-slate-500" />
              <span className="sr-only">Close</span>
            </DialogClose>

            {/* Content — centered layout */}
            <div className="px-8 pt-8 pb-8 flex flex-col items-center text-center">
              {/* Shield/lock icon badge */}
              <div
                className="mb-5 flex items-center justify-center w-12 h-12 rounded-full"
                style={{ backgroundColor: '#FEF0EB' }}
                aria-hidden="true"
              >
                <svg
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="size-6"
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

              {/* Title */}
              <DialogTitle className="text-[#0A1628] text-xl font-semibold leading-snug mb-2">
                {t('authGateTitle')}
              </DialogTitle>

              {/* Description */}
              <DialogDescription className="text-slate-500 text-sm leading-relaxed mb-7 max-w-xs">
                {t('authGateDescription')}
              </DialogDescription>

              {/* CTAs — stacked full width */}
              <div className="flex flex-col gap-3 w-full">
                <Button
                  asChild
                  size="lg"
                  className="w-full font-medium text-white shadow-sm hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: '#E8501C', borderColor: '#E8501C' }}
                >
                  <Link href="/company/signup">
                    {t('signUpCompany')}
                  </Link>
                </Button>

                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="w-full font-medium text-slate-700 border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  <Link href="/login">
                    {t('authGateLogin')}
                  </Link>
                </Button>
              </div>
            </div>
          </DialogPrimitive.Content>
        </div>
      </DialogPortal>
    </Dialog>
  )
}
