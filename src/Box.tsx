import React, { forwardRef, ReactNode, useCallback, useMemo, useState, useContext, createContext } from 'react'
import mergeRefs from 'react-merge-refs'
import { boxNodeContext } from './context'
import { R3FlexProps, useProps } from './props'

import { useBox, usePropsSyncSize } from '.'
import { FrameValue } from '@react-spring/core'
import type * as Fiber from '@react-three/fiber'

/**
 * Box container for 3D Objects.
 * For containing Boxes use `<Flex />`.
 */
export const Box = forwardRef<
  ReactNode,
  {
    onUpdateTransformation?: (x: number, y: number, width: number, height: number) => void
    centerAnchor?: boolean
    children: ((width: number, height: number) => React.ReactNode) | React.ReactNode
    index?: number
  } & R3FlexProps &
    Fiber.GroupProps
>(
  (
    {
      // Non-flex props
      children,
      centerAnchor,

      onUpdateTransformation,
      index,

      // other
      ...props
    },
    ref
  ) => {
    // must memoize or the object literal will cause every dependent of flexProps to rerender everytime
    const [flexProps, groupProps] = useProps<Fiber.GroupProps>(props)

    const [[x, y, width, height], setTransformation] = useState<[number, number, number, number]>([0, 0, 0, 0])

    const node = useBox(
      flexProps,
      centerAnchor,
      index,
      useCallback(
        (x: number, y: number, width: number, height: number) => {
          onUpdateTransformation && onUpdateTransformation(x, y, width, height)
          setTransformation([x, y, width, height])
        },
        [onUpdateTransformation]
      )
    )

    const size = useMemoArray<[number, number]>([width, height])

    return (
      <group ref={ref} {...groupProps} position-x={x} position-y={y}>
        <boxNodeContext.Provider value={node}>
          <boxSizeContext.Provider value={size}>
            {useMemo(
              () => (typeof children === 'function' ? children(width, height) : children),
              [width, height, children]
            )}
          </boxSizeContext.Provider>
        </boxNodeContext.Provider>
      </group>
    )
  }
)

export const AutomaticBox = forwardRef<
  ReactNode,
  {
    onUpdateTransformation?: (x: number, y: number, width: number, height: number) => void
    centerAnchor?: boolean
    children: ((width: number, height: number) => React.ReactNode) | React.ReactNode
    index?: number
  } & R3FlexProps &
    Fiber.GroupProps
>((props, ref) => {
  const [overwrittenProps, setRef] = usePropsSyncSize(props)
  const mergedReds = useMemo(() => mergeRefs([ref, setRef]), [ref, setRef])
  return <Box ref={mergedReds} {...overwrittenProps} />
})

export function useMemoArray<T extends Array<any>>(array: T): T {
  return useMemo(() => array, [array])
}

export const boxSizeContext = createContext<[number | FrameValue<number>, number | FrameValue<number>]>(null as any)

export function useFlexSize() {
  return useContext(boxSizeContext)
}

Box.displayName = 'Box'
