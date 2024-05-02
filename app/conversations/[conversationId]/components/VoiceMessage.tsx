import { useEffect, useRef, useState } from 'react'
import { FaPlay, FaStop } from 'react-icons/fa'
import WaveSurfer from 'wavesurfer.js'

const VoiceMessage: React.FC<{ src: any }> = ({ src }) => {
  const [currentPlaybackTime, setCurrentPlaybackTime] = useState<number>(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [totalDuration, setTotalDuration] = useState<number>(0)
  const [audioMessage, setAudioMessage] = useState<HTMLAudioElement | null>(null)

  const waveFormRef = useRef(null)
  const waveform = useRef<WaveSurfer | null>(null)

  useEffect(() => {
    if (waveform.current === null && waveFormRef.current !== null) {
      waveform.current = WaveSurfer.create({
        container: waveFormRef.current,
        waveColor: '#ccc',
        progressColor: '#4a9eff',
        cursorColor: '#7ae3c3',
        barWidth: 2,
        height: 30
      })

      waveform.current.on('finish', () => {
        setIsPlaying(false)
      })
    }
    return () => {}
  }, [])

  useEffect(() => {
    const audio = new Audio(src)
    setAudioMessage(audio)
    waveform.current?.load(src)
    waveform.current?.on('ready', () => {
      setTotalDuration(waveform.current?.getDuration() || 0)
    })
  }, [src])

  useEffect(() => {
    if (audioMessage) {
      const updateplaybackTime = () => {
        setCurrentPlaybackTime(audioMessage.currentTime)
      }
      audioMessage.addEventListener('timeupdate', updateplaybackTime)

      return () => {
        audioMessage.removeEventListener('timeupdate', updateplaybackTime)
      }
    }
  }, [audioMessage])

  const handlePlayAudio = () => {
    if (audioMessage) {
      waveform.current?.stop()
      waveform.current?.play()
      audioMessage.play()
      setIsPlaying(true)
    }
  }

  const handlePauseAudio = () => {
    waveform.current?.stop()
    setIsPlaying(false)
    if (audioMessage) audioMessage.pause()
  }

  const formatTime = (time: number) => {
    if (isNaN(time)) return '00:00'
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <div className='flex items-center gap-5 p-4 text-white text-sm bg-slate-500'>
      <div className='p-2 rounded-full bg-white cursor-pointer'>
        {!isPlaying ? (
          <FaPlay size={12} className='text-slate-500' title='Play' onClick={handlePlayAudio} />
        ) : (
          <FaStop size={12} className='text-slate-500' title='Stop' onClick={handlePauseAudio} />
        )}
      </div>
      <div className='relative'>
        <div className='w-60' ref={waveFormRef} />
        <div className='text-gray-200 text-[11px] flex justify-between absolute'>
          <span>{formatTime(isPlaying ? currentPlaybackTime : totalDuration)}</span>
        </div>
      </div>
    </div>
  )
}

export default VoiceMessage
