import { useCallback } from 'react'
import { SpringConfig, useSpring } from '@react-spring/three'
import { useBox } from './useBox'
import { R3FlexProps } from '.'

export function useSpringBox(
  flexProps: R3FlexProps | undefined,
  centerAnchor: boolean | undefined,
  index: number | undefined,
  onUpdateTransformation?: (x: number, y: number, width: number, height: number) => void,
  config?: SpringConfig
) {
  const [spring, api] = useSpring(
    {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      config,
    },
    [config]
  )

  const update = useCallback(
    (x: number, y: number, width: number, height: number) => {
      onUpdateTransformation && onUpdateTransformation(x, y, width, height)
      api.start({
        x,
        y,
        width,
        height,
      })
    },
    [api, onUpdateTransformation]
  )

  const node = useBox(flexProps, centerAnchor, index, update)

  return { node, ...spring }
}
