'use client'

import axios from 'axios'
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form'
import { HiPhoto, HiPaperAirplane } from 'react-icons/hi2'
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react'
import { CldUploadButton } from 'next-cloudinary'
import { useEffect, useRef, useState } from 'react'
import { BsEmojiSmile } from 'react-icons/bs'
import { FaMicrophone } from 'react-icons/fa'
import CaptureAudio from './CaptureAudio'
// import dynamic from 'next/dynamic'

import useConversation from '@/app/hooks/useConversation'
import MessageInput from './MessageInput'

const Form = () => {
  const { conversationId } = useConversation()
  // const [isTyping, setIsTyping] = useState(false) // Trạng thái typing
  const [showEmojiPicker, setShowEmojiPicker] = useState(false) // Trạng thái emoji modal
  const [showAudioRecorder, setShowAudioRecorder] = useState(false) // Trạng thái audio modal
  const emojiPickerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (event.target.id !== 'emoji-open') {
        if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
          setShowEmojiPicker(false)
        }
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [])

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<FieldValues>({
    defaultValues: {
      message: ''
    }
  })

  const messageValue = watch('message')

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    setValue('message', '', { shouldValidate: true })
    // setIsTyping(false)
    axios.post('/api/messages', {
      ...data,
      conversationId
    })
  }

  // const handleTyping = () => {
  //   const typingStatus = messageValue.trim() !== '' // Kiểm tra nội dung message
  //   if (isTyping !== typingStatus) {
  //     setIsTyping(typingStatus) // Bắt đầu typing khi người dùng nhập tin nhắn
  //     console.log('Typing...')
  //     // axios.post('/api/typing', {
  //     //   conversationId,
  //     //   isTyping: true
  //     // });
  //   }
  // }

  const handleUpload = (result: any) => {
    // setIsTyping(false)
    axios.post('/api/messages', {
      image: result?.info?.secure_url,
      conversationId
    })
  }

  const handleEmojiClick = (emoji: EmojiClickData) => {
    setValue('message', messageValue + emoji.emoji)
    setShowEmojiPicker(!showEmojiPicker)
  }

  const handleEmojiModal = () => {
    setShowEmojiPicker(!showEmojiPicker)
  }

  // console.log('Typing...', isTyping)

  return (
    <div className='py-4 px-4 bg-white border-t flex items-center gap-2 lg:gap-4 w-full'>
      {!showAudioRecorder && (
        <>
          <FaMicrophone
            size={24}
            className='text-sky-500 cursor-pointer'
            title='Record'
            onClick={() => setShowAudioRecorder(true)}
          />
          {/* <div className='rounded-full p-2 hover:bg-neutral-100'> */}
          <BsEmojiSmile size={24} id='emoji-open' className='text-sky-500 cursor-pointer' onClick={handleEmojiModal} />
          {/* </div> */}

          {showEmojiPicker && (
            <div className='absolute bottom-20 z-40' ref={emojiPickerRef}>
              <EmojiPicker onEmojiClick={handleEmojiClick} />
            </div>
          )}
          <CldUploadButton options={{ maxFiles: 1 }} onUpload={handleUpload} uploadPreset='sbvaprxq'>
            <HiPhoto size={30} className='text-sky-500' />
          </CldUploadButton>

          <form
            className='flex items-center gap-2 lg:gap-4 w-full'
            onSubmit={handleSubmit(onSubmit)}
            // onInput={handleTyping}
          >
            <MessageInput id='message' register={register} errors={errors} required placeholder='Write a message' />
            <button type='submit' className='rounded-full p-2 bg-sky-500 cursor-wait hover:bg-sky-600 transition'>
              <HiPaperAirplane size={18} className='text-white' />
            </button>
          </form>
        </>
      )}

      {showAudioRecorder && <CaptureAudio hide={setShowAudioRecorder} conversationId={conversationId} />}
    </div>
  )
}

export default Form
