import { useRef, useState, useCallback, useEffect } from 'react'

// ── Procedural ambient soundscape (no audio files needed) ─────────────────────

function buildSoundscape(ctx) {
  const master = ctx.createGain()
  master.gain.setValueAtTime(0, ctx.currentTime)
  master.gain.linearRampToValueAtTime(0.7, ctx.currentTime + 4)
  master.connect(ctx.destination)

  // 1. Wind — white noise through a band-pass filter with slow LFO swell
  const bufSize   = ctx.sampleRate * 2
  const noiseBuffer = ctx.createBuffer(1, bufSize, ctx.sampleRate)
  const data        = noiseBuffer.getChannelData(0)
  for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1

  const noiseSource = ctx.createBufferSource()
  noiseSource.buffer = noiseBuffer
  noiseSource.loop   = true

  const windFilter = ctx.createBiquadFilter()
  windFilter.type            = 'bandpass'
  windFilter.frequency.value = 400
  windFilter.Q.value         = 0.8

  const windGain = ctx.createGain()
  windGain.gain.value = 0.18

  const lfo = ctx.createOscillator()
  lfo.type            = 'sine'
  lfo.frequency.value = 0.08
  const lfoGain = ctx.createGain()
  lfoGain.gain.value = 0.10
  lfo.connect(lfoGain)
  lfoGain.connect(windGain.gain)
  lfo.start()

  noiseSource.connect(windFilter)
  windFilter.connect(windGain)
  windGain.connect(master)
  noiseSource.start()

  // 2. Deep nature hum — very low filtered noise layer
  const humSource = ctx.createBufferSource()
  humSource.buffer = noiseBuffer
  humSource.loop   = true
  humSource.playbackRate.value = 0.5

  const humFilter = ctx.createBiquadFilter()
  humFilter.type            = 'lowpass'
  humFilter.frequency.value = 120
  humFilter.Q.value         = 1.5

  const humGain = ctx.createGain()
  humGain.gain.value = 0.09

  humSource.connect(humFilter)
  humFilter.connect(humGain)
  humGain.connect(master)
  humSource.start(0, Math.random() * 2)

  // 3. Bird chirps — random oscillator bursts at irregular intervals
  function scheduleChirp() {
    const delay   = 2.5 + Math.random() * 5
    const startAt = ctx.currentTime + delay

    const osc  = ctx.createOscillator()
    const gEnv = ctx.createGain()
    osc.type = 'sine'

    const baseFreq = 1800 + Math.random() * 1400
    osc.frequency.setValueAtTime(baseFreq, startAt)
    osc.frequency.linearRampToValueAtTime(baseFreq * 1.35, startAt + 0.07)
    osc.frequency.linearRampToValueAtTime(baseFreq * 0.90, startAt + 0.14)

    gEnv.gain.setValueAtTime(0, startAt)
    gEnv.gain.linearRampToValueAtTime(0.06 + Math.random() * 0.04, startAt + 0.04)
    gEnv.gain.linearRampToValueAtTime(0, startAt + 0.18)

    osc.connect(gEnv)
    gEnv.connect(master)
    osc.start(startAt)
    osc.stop(startAt + 0.22)

    if (Math.random() > 0.55) {
      const osc2  = ctx.createOscillator()
      const gEnv2 = ctx.createGain()
      osc2.type = 'sine'
      const t2 = startAt + 0.25
      osc2.frequency.setValueAtTime(baseFreq * 1.1, t2)
      osc2.frequency.linearRampToValueAtTime(baseFreq * 1.5, t2 + 0.08)
      gEnv2.gain.setValueAtTime(0, t2)
      gEnv2.gain.linearRampToValueAtTime(0.05, t2 + 0.03)
      gEnv2.gain.linearRampToValueAtTime(0, t2 + 0.15)
      osc2.connect(gEnv2)
      gEnv2.connect(master)
      osc2.start(t2)
      osc2.stop(t2 + 0.18)
    }

    setTimeout(() => {
      if (ctx.state !== 'closed') scheduleChirp()
    }, delay * 1000)
  }

  scheduleChirp()

  return master
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useAmbientSound() {
  const [muted,  setMuted]  = useState(false)
  const [active, setActive] = useState(false)
  const ctxRef    = useRef(null)
  const masterRef = useRef(null)

  const start = useCallback(async () => {
    if (active) return
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    await ctx.resume()
    const master = buildSoundscape(ctx)
    ctxRef.current    = ctx
    masterRef.current = master
    setActive(true)
  }, [active])

  const toggle = useCallback(() => {
    const master = masterRef.current
    const ctx    = ctxRef.current
    if (!master || !ctx) return
    setMuted(prev => {
      const next = !prev
      master.gain.setTargetAtTime(next ? 0 : 0.7, ctx.currentTime, 0.5)
      return next
    })
  }, [])

  useEffect(() => () => { ctxRef.current?.close() }, [])

  return { muted, active, start, toggle }
}
