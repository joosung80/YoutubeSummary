import { cva, type VariantProps } from 'class-variance-authority'
import { clsx } from 'clsx'
import { forwardRef } from 'react'

const buttonVariants = cva(
  'inline-flex items-center gap-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-60 disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        primary:
          'bg-indigo-600 text-white hover:bg-indigo-500 active:bg-indigo-600 dark:bg-indigo-500 dark:text-white dark:hover:bg-indigo-400',
        secondary:
          'border border-indigo-200 bg-white text-indigo-700 hover:bg-indigo-50 dark:border-indigo-900 dark:text-indigo-200 dark:bg-neutral-900 dark:hover:bg-neutral-800',
        ghost: 'text-indigo-700 hover:bg-indigo-50 dark:text-indigo-300 dark:hover:bg-neutral-800',
      },
      size: {
        sm: 'px-2.5 py-1.5',
        md: 'px-3 py-2',
        lg: 'px-4 py-2.5',
      },
    },
    defaultVariants: {
      variant: 'secondary',
      size: 'md',
    },
  },
)

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant, size, ...props },
  ref,
) {
  return (
    <button ref={ref} className={clsx(buttonVariants({ variant, size }), className)} {...props} />
  )
})

export { buttonVariants }




