import { usePathname } from 'next/navigation'
import useConversation from './useConversation'
import { useMemo } from 'react'
import { HiChat, HiUsers } from 'react-icons/hi'
import { act } from 'react-dom/test-utils'
import { signOut } from 'next-auth/react'
import { HiArrowLeftOnRectangle } from 'react-icons/hi2'

const useRoutes = () => {
  const pathname = usePathname()
  const { conversationId } = useConversation()

  const routes = useMemo(
    () => [
      {
        label: 'Chat',
        href: '/conversation',
        icon: HiChat,
        active: pathname === '/conversation' || !!conversationId
      },
      {
        label: 'Users',
        href: '/users',
        icon: HiUsers,
        active: pathname === '/users'
      },
      {
        label: 'Logout',
        href: '#',
        onClick: () => signOut(),
        icon: HiArrowLeftOnRectangle
      }
    ],
    [pathname, conversationId]
  )

  return routes
}

export default useRoutes
