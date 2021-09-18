import React, { useLayoutEffect, useMemo, useCallback, PropsWithChildren, useRef } from 'react'
import * as THREE from 'three'
import { useFrame, useThree, ReactThreeFiber } from '@react-three/fiber'
import mergeRefs from 'react-merge-refs'
import { YGNodeRef, CONSTANTS } from 'yoga-wasm-slim'

import {
  setYogaProperties,
  rmUndefFromObj,
  vectorFromObject,
  Axis,
  getDepthAxis,
  getFlex2DSize,
  getOBBSize,
  getRootShift,
  useYogaAsync,
  setPropertyString,
} from './util'
import { boxContext, flexContext, SharedFlexContext, SharedBoxContext } from './context'
import type { R3FlexProps, FlexYogaDirection, FlexPlane } from './props'

export type FlexProps = PropsWithChildren<
  Partial<{
    /**
     * Root container position
     */
    size: [number, number, number]
    yogaDirection: FlexYogaDirection
    plane: FlexPlane
    scaleFactor?: number
    onReflow?: (totalWidth: number, totalHeight: number) => void
    disableSizeRecalc?: boolean
    /** Centers flex container in position.
     *
     * !NB center is based on provided flex size, not on the actual content */
    centerAnchor?: boolean
  }> &
    R3FlexProps &
    Omit<ReactThreeFiber.Object3DNode<THREE.Group, typeof THREE.Group>, 'children'>
>
interface BoxesItem {
  node: YGNodeRef
  group: THREE.Group
  flexProps: R3FlexProps
  centerAnchor: boolean
}

function FlexImpl(
  {
    // Non flex props
    size = [1, 1, 1],
    yogaDirection = 'ltr',
    plane = 'xy',
    children,
    scaleFactor = 100,
    onReflow,
    disableSizeRecalc,
    centerAnchor: rootCenterAnchor,

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
  }: FlexProps,
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

  const rootGroup = useRef<THREE.Group>()

  // Keeps track of the yoga nodes of the children and the related wrapper groups
  const boxesRef = useRef<BoxesItem[]>([])
  const registerBox = useCallback(
    (node: YGNodeRef, group: THREE.Group, flexProps: R3FlexProps, centerAnchor: boolean = false) => {
      const i = boxesRef.current.findIndex((b) => b.node === node)
      if (i !== -1) {
        boxesRef.current.splice(i, 1)
      }
      boxesRef.current.push({ group, node, flexProps, centerAnchor })
    },
    []
  )
  const unregisterBox = useCallback((node: YGNodeRef) => {
    const i = boxesRef.current.findIndex((b) => b.node === node)
    if (i !== -1) {
      boxesRef.current.splice(i, 1)
    }
  }, [])

  const yoga = useYogaAsync('./')

  // Reference to the yoga native node
  const node = useMemo(() => yoga._YGNodeNew(), [])
  useLayoutEffect(() => {
    setYogaProperties(yoga, node, flexProps, scaleFactor)
  }, [node, flexProps, scaleFactor])

  // Mechanism for invalidating and recalculating layout
  const { invalidate } = useThree()
  const dirtyRef = useRef(true)
  const requestReflow = useCallback(() => {
    dirtyRef.current = true
    invalidate()
  }, [invalidate])

  // We need to reflow everything if flex props changes
  useLayoutEffect(() => {
    requestReflow()
  }, [children, flexProps, requestReflow])

  // Common variables for reflow
  const boundingBox = useMemo(() => new THREE.Box3(), [])
  const vec = useMemo(() => new THREE.Vector3(), [])
  const mainAxis = plane[0] as Axis
  const crossAxis = plane[1] as Axis
  const depthAxis = getDepthAxis(plane)
  const [flexWidth, flexHeight] = getFlex2DSize(size, plane)
  const yogaDirection_ =
    yogaDirection === 'ltr'
      ? CONSTANTS.DIRECTION_LTR
      : yogaDirection === 'rtl'
      ? CONSTANTS.DIRECTION_RTL
      : yogaDirection

  // Shared context for flex and box
  const sharedFlexContext = useMemo<SharedFlexContext>(
    () => ({
      requestReflow,
      registerBox,
      unregisterBox,
      scaleFactor,
    }),
    [requestReflow, registerBox, unregisterBox, scaleFactor]
  )
  const sharedBoxContext = useMemo<SharedBoxContext>(
    () => ({ node, size: [flexWidth, flexHeight], centerAnchor: rootCenterAnchor }),
    [node, flexWidth, flexHeight, rootCenterAnchor]
  )

  // Handles the reflow procedure
  function reflow() {
    if (!disableSizeRecalc) {
      // Recalc all the sizes
      boxesRef.current.forEach(({ group, node, flexProps }) => {
        if (yoga._YGNodeGetChildCount(node) === 0 || flexProps.width === undefined || flexProps.height === undefined) {
          // No size specified, calculate size
          if (rootGroup.current) {
            getOBBSize(group, rootGroup.current, boundingBox, vec)
          } else {
            // rootGroup ref is missing for some reason, let's just use usual bounding box
            boundingBox.setFromObject(group).getSize(vec)
          }

          setPropertyString(yoga, node, 'Width', flexProps.width || vec[mainAxis], scaleFactor)
          setPropertyString(yoga, node, 'Height', flexProps.height || vec[crossAxis], scaleFactor)
        }
      })
    }

    // Perform yoga layout calculation
    yoga._YGNodeCalculateLayout(node, flexWidth * scaleFactor, flexHeight * scaleFactor, yogaDirection_)

    const rootWidth = yoga._YGNodeLayoutGetWidth(node)
    const rootHeight = yoga._YGNodeLayoutGetHeight(node)

    let minX = 0
    let maxX = 0
    let minY = 0
    let maxY = 0

    // Reposition after recalculation
    boxesRef.current.forEach(({ group, node, centerAnchor }) => {
      const left = yoga._YGNodeLayoutGetLeft(node)
      const top = yoga._YGNodeLayoutGetTop(node)
      const width = yoga._YGNodeLayoutGetWidth(node)
      const height = yoga._YGNodeLayoutGetHeight(node)
      const [mainAxisShift, crossAxisShift] = getRootShift(rootCenterAnchor, rootWidth, rootHeight, yoga, node)

      const position = vectorFromObject({
        [mainAxis]: (mainAxisShift + left + (centerAnchor ? width / 2 : 0)) / scaleFactor,
        [crossAxis]: -(crossAxisShift + top + (centerAnchor ? height / 2 : 0)) / scaleFactor,
        [depthAxis]: 0,
      } as any)

      minX = Math.min(minX, left)
      minY = Math.min(minY, top)
      maxX = Math.max(maxX, left + width)
      maxY = Math.max(maxY, top + height)

      group.position.copy(position)
    })

    // Call the reflow event to update resulting size
    onReflow && onReflow((maxX - minX) / scaleFactor, (maxY - minY) / scaleFactor)

    // Ask react-three-fiber to perform a render (invalidateFrameLoop)
    invalidate()
  }

  // We check if we have to reflow every frame
  // This way we can batch the reflow if we have multiple reflow requests
  useFrame(() => {
    if (dirtyRef.current) {
      dirtyRef.current = false
      reflow()
    }
  })

  return (
    <group ref={mergeRefs([rootGroup, ref])} {...props}>
      <flexContext.Provider value={sharedFlexContext}>
        <boxContext.Provider value={sharedBoxContext}>{children}</boxContext.Provider>
      </flexContext.Provider>
    </group>
  )
}

/**
 * Flex container. Can contain Boxes
 */
export const Flex = React.forwardRef<THREE.Group, FlexProps>(FlexImpl)

Flex.displayName = 'Flex'
