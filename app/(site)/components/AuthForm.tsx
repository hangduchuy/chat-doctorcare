'use client'

import { useCallback, useEffect, useState } from 'react'
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form'
import { BsGithub, BsGoogle } from 'react-icons/bs'
import axios from 'axios'
import toast from 'react-hot-toast'
import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

import AuthSocialButton from './AuthSocialButton'
import Input from '../../components/inputs/Input'
import Button from '../../components/Button'

type Variant = 'LOGIN' | 'REGISTER'

const AuthAssistant = {
  email: 'assistant@gmail.com',
  id: '6629c0c820d872765cdcd961'
}

const AuthForm = () => {
  const session = useSession()
  const router = useRouter()
  const [variant, setVariant] = useState<Variant>('LOGIN')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (session?.status === 'authenticated') {
      if (session?.data?.user?.email === AuthAssistant.email) {
        router.push('/conversations')
      } else {
        axios
          .post('/api/conversations', {
            userId: AuthAssistant.id
          })
          .then(async (data) => {
            await router.push(`/conversations/${data.data.id}`)
            axios.post('/api/messages', {
              senderId: AuthAssistant.id,
              conversationId: data.data.id,
              message: `Chào ${session.data.user?.name} đến hệ thống chat hỗ trợ DoctorCareHA, tôi có thể giúp gì cho bạn?`
            })
          })
      }
    }
  }, [router, session])

  const toggleVariant = useCallback(() => {
    if (variant === 'LOGIN') {
      setVariant('REGISTER')
    } else {
      setVariant('LOGIN')
    }
  }, [variant])

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<FieldValues>({
    defaultValues: {
      name: '',
      email: '',
      password: ''
    }
  })

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    setIsLoading(true)

    if (variant === 'REGISTER') {
      axios
        .post('/api/register', data)
        .then(() => signIn('credentials', data))
        .catch(() => {
          toast.error('Đã xảy ra sự cố')
        })
        .finally(() => {
          setIsLoading(false)
        })
    }

    if (variant === 'LOGIN') {
      signIn('credentials', {
        ...data,
        redirect: false
      })
        .then((callback) => {
          if (callback?.error) {
            toast.error('Đăng nhập thất bại')
          }
          if (callback?.ok && !callback?.error) {
            toast.success('Đăng nhập thành công')
            router.push('/users')
          }
        })
        .finally(() => {
          setIsLoading(false)
        })
    }
  }

  const socialAction = (action: string) => {
    setIsLoading(true)

    signIn(action, { redirect: false })
      .then((callback) => {
        if (callback?.error) {
          toast.error('Đăng nhập thất bại')
        }
        if (callback?.ok && !callback?.error) {
          toast.success('Đăng nhập thành công')
        }
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  return (
    <div className='mt-8 sm:mx-auto sm:W-full sm:max-w-xl'>
      <div className='bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10'>
        <form className='space-y-6' onSubmit={handleSubmit(onSubmit)}>
          {variant === 'REGISTER' && (
            <Input id='name' label='Name' register={register} errors={errors} disabled={isLoading} />
          )}

          <Input id='email' label='Email' register={register} errors={errors} disabled={isLoading} />
          <Input
            id='password'
            label='Password'
            type='password'
            register={register}
            errors={errors}
            disabled={isLoading}
          />
          <div>
            <Button disabled={isLoading} fullWidth type='submit'>
              {variant === 'LOGIN' ? 'Đăng nhập' : 'Đăng ký'}
            </Button>
          </div>
        </form>

        <div className='mt-6'>
          <div className='relative'>
            <div className='absolute inset-0 flex items-center'>
              <div className='w-full border-t border-gray-300' />
            </div>
            <div className='relative flex justify-center text-sm'>
              <span className='px-2 bg-white text-gray-500'>Hoặc đăng nhập bằng</span>
            </div>
          </div>
          <div className='mt-6 grid grid-cols-2 gap-3'>
            <AuthSocialButton icon={BsGithub} onClick={() => socialAction('github')} />
            <AuthSocialButton icon={BsGoogle} onClick={() => socialAction('google')} />
          </div>
        </div>

        <div className='flex gap-2 justify-center text-sm mt-6 px-2 text-gray-500'>
          <div>{variant === 'LOGIN' ? 'Bạn chưa có tài khoản?' : 'Bạn đã có tài khoản?'}</div>
          <button type='button' onClick={toggleVariant} className='text-blue-500 hover:underline focus:outline-none'>
            {variant === 'LOGIN' ? 'Đăng ký ngay' : 'Đăng nhập ngay'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AuthForm
