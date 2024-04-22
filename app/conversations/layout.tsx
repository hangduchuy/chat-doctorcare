import getConversation from '../actions/getConversation'
import getUsers from '../actions/getUsers'
import Sidebar from '../components/sidebar/Sidebar'
import ConversationList from './components/ConversationList'

export default async function ConversationsLayout({ children }: { children: React.ReactNode }) {
  const conversations = await getConversation()
  const users = await getUsers()

  return (
    <Sidebar>
      <div className='h-full'>
        <ConversationList users={users} initialItems={conversations} />
        {children}
      </div>
    </Sidebar>
  )
}
