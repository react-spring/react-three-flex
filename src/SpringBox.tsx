import React, { forwardRef, ReactNode, useMemo } from 'react'
import { boxSizeContext, usePropsSyncSize, useSpringBox } from '.'
import { R3FlexProps, useProps } from './props'
import { useMemoArray } from './Box'
import { FrameValue, a, AnimatedProps } from '@react-spring/three'
import { boxNodeContext } from './context'
import * as Fiber from '@react-three/fiber'
import mergeRefs from 'react-merge-refs'

export const SpringBox = forwardRef<
  ReactNode,
  {
    onUpdateTransformation?: (x: number, y: number, width: number, height: number) => void
    centerAnchor?: boolean
    children: ((width: FrameValue<number>, height: FrameValue<number>) => React.ReactNode) | React.ReactNode
    index?: number
  } & R3FlexProps &
    AnimatedProps<Fiber.GroupProps>
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
    const [flexProps, groupProps] = useProps<AnimatedProps<Fiber.GroupProps>>(props)

    const { node, x, y, width, height } = useSpringBox(flexProps, centerAnchor, index, onUpdateTransformation)

    const size = useMemoArray<[FrameValue<number>, FrameValue<number>]>([width, height])

    return (
      <a.group ref={ref} {...groupProps} position-x={x} position-y={y}>
        <boxNodeContext.Provider value={node}>
          <boxSizeContext.Provider value={size}>
            {useMemo(
              () => (typeof children === 'function' ? children(width, height) : children),
              [width, height, children]
            )}
          </boxSizeContext.Provider>
        </boxNodeContext.Provider>
      </a.group>
    )
  }
)

export const AutomaticSpringBox = forwardRef<
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
  return <SpringBox ref={mergedReds} {...overwrittenProps} />
})
