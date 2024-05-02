import { useEffect, useRef, useState } from 'react'

import { FaPauseCircle, FaPlay, FaStop, FaTrash } from 'react-icons/fa'
import { HiPaperAirplane } from 'react-icons/hi2'
import WaveSurfer from 'wavesurfer.js'
import axios from 'axios'

const CaptureAudio: React.FC<{ hide: any; conversationId: any }> = ({ hide, conversationId }) => {
  const [isRecording, setIsRecording] = useState(false)
  const [recordedAudio, setRecordedAudio] = useState<File | HTMLAudioElement | null>(null)
  const [waveform, setWaveform] = useState<WaveSurfer | null>(null)
  const [recordingDuration, setRecordingDuration] = useState<number>(0)
  const [currentPlaybackTime, setCurrentPlaybackTime] = useState<number>(0)
  const [totalDuration, setTotalDuration] = useState<number>(0)
  const [isPlaying, setIsPlaying] = useState(false)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const mediaRecorderRed = useRef<MediaRecorder | null>(null)
  const waveFormRef = useRef(null)

  const cloudinaryUploadUrl = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`

  useEffect(() => {
    let interval: any
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingDuration((prev) => {
          setTotalDuration(prev + 1)
          return prev + 1
        })
      }, 1000)
    }

    return () => {
      clearInterval(interval)
    }
  }, [isRecording])

  useEffect(() => {
    if (waveFormRef.current) {
      const wavesurfer = WaveSurfer.create({
        container: waveFormRef.current,
        waveColor: '#ccc',
        progressColor: '#4a9eff',
        cursorColor: '#7ae3c3',
        barWidth: 2,
        height: 30
      })

      setWaveform(wavesurfer)

      wavesurfer.on('finish', () => {
        setIsPlaying(false)
      })

      return () => {
        wavesurfer.destroy()
      }
    }
  }, [])

  useEffect(() => {
    if (waveform) handleStartRecording()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [waveform])

  useEffect(() => {
    if (recordedAudio instanceof HTMLAudioElement) {
      const updateplaybackTime = () => {
        setCurrentPlaybackTime(recordedAudio.currentTime)
      }
      recordedAudio.addEventListener('timeupdate', updateplaybackTime)

      return () => {
        recordedAudio.removeEventListener('timeupdate', updateplaybackTime)
      }
    }
  }, [recordedAudio])

  const handlePlayRecording = () => {
    waveform?.stop()
    waveform?.play()
    setIsPlaying(true)
    if (recordedAudio instanceof File) {
      const audioUrl = URL.createObjectURL(recordedAudio)
      const audioElement = new Audio(audioUrl)
      audioElement.play()
      setRecordedAudio(audioElement)
    }
  }

  const handlePauseRecording = () => {
    waveform?.stop()
    setIsPlaying(false)
    if (recordedAudio instanceof HTMLAudioElement) {
      recordedAudio.pause()
    }
  }

  const handleStartRecording = () => {
    setRecordingDuration(0)
    setCurrentPlaybackTime(0)
    setTotalDuration(0)
    setIsRecording(true)
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        const mediaRecorder = new MediaRecorder(stream)
        mediaRecorderRed.current = mediaRecorder

        if (audioRef.current) {
          audioRef.current.srcObject = stream
        }

        const chunks: BlobPart[] = []
        mediaRecorder.ondataavailable = (e) => chunks.push(e.data)

        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'audio/ogg; codecs=opus' })
          const audioUrl = URL.createObjectURL(blob)
          const audio = new Audio(audioUrl)
          setRecordedAudio(audio)

          if (waveform) {
            waveform.load(audioUrl)
          }
        }

        mediaRecorder.start()
      })
      .catch((err) => {
        console.error(err)
      })
  }

  const handleStopRecording = () => {
    if (mediaRecorderRed.current && isRecording) {
      mediaRecorderRed.current.stop()
      setIsRecording(false)
      waveform?.stop()

      const audioChunks: BlobPart[] = []
      mediaRecorderRed.current.addEventListener('dataavailable', (event) => {
        audioChunks.push(event.data)
      })

      mediaRecorderRed.current.addEventListener('stop', () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/mp3' })
        const audioFile = new File([audioBlob], 'recording.mp3')
        setRecordedAudio(audioFile)
      })
    }
  }

  const formatTime = (time: number) => {
    if (isNaN(time)) return '00:00'
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  const sendRecording = async () => {
    if (recordedAudio instanceof File) {
      const formData = new FormData()
      formData.append('file', recordedAudio)
      formData.append('upload_preset', 'sbvaprxq')

      const response = await axios.post(cloudinaryUploadUrl, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      if (response.data && response.data.secure_url) {
        const audioUrl = response.data.secure_url

        // Sau khi tải lên thành công, gửi URL của tệp âm thanh và conversationId lên server

        await axios.post('/api/messages', {
          audio: audioUrl,
          conversationId
        })
      } else {
        console.error('Failed to upload audio to Cloudinary')
      }
      hide()
    }
  }
  return (
    <div className='flex w-full gap-5 item-center'>
      <div className='flex justify-center items-center'>
        <FaTrash size={22} className='text-sky-500 cursor-pointer' title='Delete' onClick={() => hide()} />
      </div>
      <div className='mx-2 py-2 px-4 flex gap-3 text-white justify-center items-center bg-sky-500 rounded-full drop-shadow-lg'>
        {isRecording ? (
          <div className='flex gap-4'>
            <div className='p-2 rounded-full bg-white cursor-pointer' onClick={handleStopRecording}>
              <FaPauseCircle size={12} className='text-sky-500' />
            </div>
            <div className='animate-pulse 2-60'>
              Recording <span>{recordingDuration}s</span>
            </div>
          </div>
        ) : (
          <div>
            {recordedAudio && (
              <div className='p-2 rounded-full bg-white cursor-pointer'>
                {!isPlaying ? (
                  <FaPlay size={12} className='text-sky-500' title='Play' onClick={handlePlayRecording} />
                ) : (
                  <FaStop size={12} className='text-sky-500' title='Stop' onClick={handlePauseRecording} />
                )}
              </div>
            )}
          </div>
        )}
        <div className='w-60' ref={waveFormRef} hidden={isRecording} />
        {recordedAudio && isPlaying && <span>{formatTime(currentPlaybackTime)}</span>}
        {recordedAudio && !isPlaying && <span>{formatTime(totalDuration)}</span>}
        <audio ref={audioRef} hidden />
      </div>
      {/* <div className='mr-4'>
        {!isRecording ? (
          <FaMicrophone size={12} onClick={handleStartRecording} />
        ) : (
          <FaPauseCircle size={12} onClick={handleStopRecording} />
        )}
      </div> */}

      <div className='flex items-center gap-2 lg:gap-4'>
        <button
          onClick={sendRecording}
          className='rounded-full p-2 bg-sky-500 cursor-pointer hover:bg-sky-600 transition'
        >
          <HiPaperAirplane size={18} className='text-white' />
        </button>
      </div>
    </div>
  )
}

export default CaptureAudio
