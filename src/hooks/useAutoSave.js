import { useEffect, useRef } from 'react'

export function useAutoSave(saveFunction, data, delay = 1000) {
  const timeoutRef = useRef(null)

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      saveFunction(data)
    }, delay)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [data, saveFunction, delay])
}

