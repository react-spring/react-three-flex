import React, { useLayoutEffect, useRef, useMemo, useState } from 'react'
import * as THREE from 'three'
import { ReactThreeFiber, useFrame } from '@react-three/fiber'
import mergeRefs from 'react-merge-refs'

import { setYogaProperties, rmUndefFromObj, useYogaAsync } from './util'
import { boxContext, flexContext, SharedBoxContext } from './context'
import { R3FlexProps } from './props'
import { useReflow, useContext } from './hooks'

export type BoxProps = {
  centerAnchor?: boolean
  children: React.ReactNode | ((width: number, height: number, centerAnchor?: boolean) => React.ReactNode)
} & R3FlexProps &
  Omit<ReactThreeFiber.Object3DNode<THREE.Group, typeof THREE.Group>, 'children'>

function BoxImpl(
  {
    // Non-flex props
    children,
    centerAnchor,

    // flex props
    flexDirection,
    flexDir,
    dir,

    alignContent,
    alignItems,
    alignSelf,
    align,

    justifyContent,
    justify,

    flexBasis,
    basis,
    flexGrow,
    grow,

    flexShrink,
    shrink,

    flexWrap,
    wrap,

    margin,
    m,
    marginBottom,
    marginLeft,
    marginRight,
    marginTop,
    mb,
    ml,
    mr,
    mt,

    padding,
    p,
    paddingBottom,
    paddingLeft,
    paddingRight,
    paddingTop,
    pb,
    pl,
    pr,
    pt,

    height,
    width,

    maxHeight,
    maxWidth,
    minHeight,
    minWidth,

    // other
    ...props
  }: BoxProps,
  ref: React.Ref<THREE.Group>
) {
  // must memoize or the object literal will cause every dependent of flexProps to rerender everytime
  const flexProps: R3FlexProps = useMemo(() => {
    const _flexProps = {
      flexDirection,
      flexDir,
      dir,

      alignContent,
      alignItems,
      alignSelf,
      align,

      justifyContent,
      justify,

      flexBasis,
      basis,
      flexGrow,
      grow,
      flexShrink,
      shrink,

      flexWrap,
      wrap,

      margin,
      m,
      marginBottom,
      marginLeft,
      marginRight,
      marginTop,
      mb,
      ml,
      mr,
      mt,

      padding,
      p,
      paddingBottom,
      paddingLeft,
      paddingRight,
      paddingTop,
      pb,
      pl,
      pr,
      pt,

      height,
      width,

      maxHeight,
      maxWidth,
      minHeight,
      minWidth,
    }

    rmUndefFromObj(_flexProps)
    return _flexProps
  }, [
    align,
    alignContent,
    alignItems,
    alignSelf,
    dir,
    flexBasis,
    basis,
    flexDir,
    flexDirection,
    flexGrow,
    grow,
    flexShrink,
    shrink,
    flexWrap,
    height,
    justify,
    justifyContent,
    m,
    margin,
    marginBottom,
    marginLeft,
    marginRight,
    marginTop,
    maxHeight,
    maxWidth,
    mb,
    minHeight,
    minWidth,
    ml,
    mr,
    mt,
    p,
    padding,
    paddingBottom,
    paddingLeft,
    paddingRight,
    paddingTop,
    pb,
    pl,
    pr,
    pt,
    width,
    wrap,
  ])

  const yoga = useYogaAsync('./')

  const { registerBox, unregisterBox, scaleFactor } = useContext(flexContext)
  const { node: parent } = useContext(boxContext)
  const group = useRef<THREE.Group>()
  const node = useMemo(() => yoga._YGNodeNew(), [])
  const reflow = useReflow()

  useLayoutEffect(() => {
    setYogaProperties(yoga, node, flexProps, scaleFactor)
  }, [flexProps, node, scaleFactor])

  // Make child known to the parents yoga instance *before* it calculates layout
  useLayoutEffect(() => {
    if (!group.current || !parent) return

    yoga._YGNodeInsertChild(parent, node, yoga._YGNodeGetChildCount(parent))
    registerBox(node, group.current, flexProps, centerAnchor)

    // Remove child on unmount
    return () => {
      yoga._YGNodeRemoveChild(parent, node)
      unregisterBox(node)
    }
  }, [node, parent, flexProps, centerAnchor, registerBox, unregisterBox])

  // We need to reflow if props change
  useLayoutEffect(() => {
    reflow()
  }, [children, flexProps, reflow])

  const [size, setSize] = useState<[number, number]>([0, 0])
  const epsilon = 1 / scaleFactor
  useFrame(() => {
    const width =
      (typeof flexProps.width === 'number' ? flexProps.width : null) || yoga._YGNodeLayoutGetWidth(node) / scaleFactor
    const height =
      (typeof flexProps.height === 'number' ? flexProps.height : null) ||
      yoga._YGNodeLayoutGetHeight(node) / scaleFactor

    if (Math.abs(width - size[0]) > epsilon || Math.abs(height - size[1]) > epsilon) {
      setSize([width, height])
    }
  })

  const sharedBoxContext = useMemo<SharedBoxContext>(() => ({ node, size, centerAnchor }), [node, size, centerAnchor])

  return (
    <group ref={mergeRefs([group, ref])} {...props}>
      <boxContext.Provider value={sharedBoxContext}>
        {typeof children === 'function' ? children(size[0], size[1], centerAnchor) : children}
      </boxContext.Provider>
    </group>
  )
}

/**
 * Box container for 3D Objects.
 * For containing Boxes use `<Flex />`.
 */
export const Box = React.forwardRef<THREE.Group, BoxProps>(BoxImpl)

Box.displayName = 'Box'
