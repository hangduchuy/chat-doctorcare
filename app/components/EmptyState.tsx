import Image from 'next/image'

const EmptyState = () => {
  return (
    <div className='px-4 py-10 sm:px-6 lg:px-8 h-full flex justify-center items-center bg-gray-100'>
      <div className='text-center items-center flex flex-col'>
        <Image className='mx-auto w-auto' height='48' width='48' src='/images/logo.svg' alt='Logo' />
        <h2 className='mt-6 text-center text-3xl font-bold tracking-tight text-gray-900'>Chat hỗ trợ khánh hàng</h2>
        {/* <h3 className='mt-2 text-2xl font-semibold text-gray-900'>Chat hỗ trợ khánh hàng</h3> */}
      </div>
    </div>
  )
}

export default EmptyState
