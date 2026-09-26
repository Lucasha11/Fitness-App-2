import { useEffect, useState } from 'react'
import { fetchHotBar, type HotBarPost } from '../lib/hotbar'
import { localClock, type LocalClock } from '../lib/nyTime'

/** The deli's local clock, refreshed each minute so badges flip at 6 AM and 10 PM. */
export function useClock(): LocalClock {
  const [clock, setClock] = useState(() => localClock(new Date()))
  useEffect(() => {
    const id = window.setInterval(() => setClock(localClock(new Date())), 60_000)
    return () => window.clearInterval(id)
  }, [])
  return clock
}

let hotBarRequest: Promise<HotBarPost | null> | null = null

/** The hot bar post, fetched once per visit. `undefined` while loading. */
export function useHotBarPost(): HotBarPost | null | undefined {
  const [post, setPost] = useState<HotBarPost | null | undefined>(undefined)
  useEffect(() => {
    hotBarRequest ??= fetchHotBar(`${import.meta.env.BASE_URL}hotbar.json`)
    let live = true
    hotBarRequest.then((p) => live && setPost(p))
    return () => {
      live = false
    }
  }, [])
  return post
}
