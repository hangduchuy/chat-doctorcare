'use client'

import clsx from 'clsx'
import Link from 'next/link'

interface DesktopItemProps {
  label: string
  icon: any
  href: string
  onClick?: () => void
  active?: boolean
}

const DesktopItem: React.FC<DesktopItemProps> = ({ href, icon: Icon, label, active, onClick }) => {
  const handleClick = () => {
    if (onClick) {
      return onClick()
    }
  }

  return (
    <li onClick={handleClick}>
      <Link
        href={href}
        className={clsx(
          `group flex gap-x-3 rounded-md p-3 text-sm leading-6 font-semibold text-slate-800 hover:text-black hover:bg-gray-100`,
          active && `text-black bg-gray-100`
        )}
      >
        <Icon className='w-6 h-6 shrink-0' />
        <span className='sr-only'>{label}</span>
      </Link>
    </li>
  )
}

export default DesktopItem
