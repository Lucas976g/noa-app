import { useEffect, useState } from "react"

import { useAuthStore } from "@/auth/session-store"

export const useAuthHydration = (): boolean => {
  const [hydrated, setHydrated] = useState(() =>
    useAuthStore.persist.hasHydrated()
  )

  useEffect(() => {
    const unsubFinish = useAuthStore.persist.onFinishHydration(() =>
      setHydrated(true)
    )
    const unsubHydrate = useAuthStore.persist.onHydrate(() =>
      setHydrated(false)
    )

    return () => {
      unsubFinish()
      unsubHydrate()
    }
  }, [])

  return hydrated
}
