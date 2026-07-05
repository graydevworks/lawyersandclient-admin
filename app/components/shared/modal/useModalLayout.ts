export const modalContentClasses = (maxWidth = 'max-w-[440px]') => [
  maxWidth,
  'rounded-t-[20px] md:rounded-[20px]',
  'shadow-xl',
  'fixed bottom-0 left-0 right-0 translate-x-0 translate-y-0',
  'w-full z-[99999]',
  'md:bottom-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2',
  'md:w-auto',
  'animate-[slideUp_0.3s_ease-out] md:animate-none'
].join(' ')

export const statusIcons = {
  success: '/images/icons/success.jpg',
  error: '/images/icons/error.png',
  warning: '/images/icons/error.png',
  info: '/images/icons/info.png'
} as const

export type StatusType = keyof typeof statusIcons
