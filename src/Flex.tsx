import React, { useLayoutEffect, useMemo, useCallback, PropsWithChildren, useRef } from 'react'
import Yoga, { YogaNode } from 'yoga-layout-prebuilt'

import { setYogaProperties, rmUndefFromObj, Axis, getDepthAxis, getFlex2DSize, getAxis } from './util'
import { boxNodeContext, flexContext, SharedFlexContext } from './context'
import type { R3FlexProps, FlexYogaDirection, FlexPlane } from './props'
import { Group } from 'three'
import { useProps } from '.'

export type FlexProps = PropsWithChildren<
  Partial<{
    /**
     * Root container position
     */
    size: [number, number, number]
    yogaDirection: FlexYogaDirection
    plane: FlexPlane
    scaleFactor?: number
    maxUps?: number
    onReflow?: (totalWidth: number, totalHeight: number) => void
  }> &
    R3FlexProps
>
interface BoxesItem {
  node: YogaNode
  parent: YogaNode
  yogaIndex: number
  reactIndex: number | undefined
  centerAnchor?: boolean
  onUpdateTransformation?: (x: number, y: number, width: number, height: number) => void
}

/**
 * Flex container. Can contain Boxes
 */
export function Flex({
  // Non flex props
  size = [1, 1, 1],
  yogaDirection = 'ltr',
  plane = 'xy',
  children,
  scaleFactor = 100,
  onReflow,
  maxUps,

  // other
  ...props
}: FlexProps) {
  // must memoize or the object literal will cause every dependent of flexProps to rerender everytime
  const [flexProps] = useProps(props)

  const reflowRef = useRef<() => void>(null as any)

  // Mechanism for invalidating and recalculating layout
  const reflowTimeout = useRef<number | undefined>(undefined)

  const requestReflow = useCallback(() => {
    if (reflowTimeout.current == null) {
      reflowTimeout.current = window.setTimeout(() => {
        reflowRef.current()
        reflowTimeout.current = undefined
      }, 1000 / (maxUps ?? 10))
    }
  }, [maxUps])

  // Keeps track of the yoga nodes of the children and the related wrapper groups
  const boxesRef = useRef<BoxesItem[]>([])
  const dirtyParents = useRef<Set<YogaNode>>(new Set())

  const registerBox = useCallback(
    (node: YogaNode, parent: YogaNode) => {
      boxesRef.current.push({ node, reactIndex: undefined, yogaIndex: -1, parent })
      dirtyParents.current.add(parent)
      requestReflow()
    },
    [requestReflow]
  )
  const updateBox = useCallback(
    (
      node: YogaNode,
      index: number | undefined,
      onUpdateTransformation: (x: number, y: number, width: number, height: number) => void,
      centerAnchor?: boolean
    ) => {
      const i = boxesRef.current.findIndex((b) => b.node === node)
      if (i !== -1) {
        boxesRef.current[i] = {
          ...boxesRef.current[i],
          reactIndex: index,
          onUpdateTransformation,
          centerAnchor,
        }
        dirtyParents.current.add(boxesRef.current[i].parent)
        requestReflow()
      } else {
        console.warn(`unable to unregister box (node could not be found)`)
      }
    },
    [requestReflow]
  )
  const unregisterBox = useCallback(
    (node: YogaNode) => {
      const i = boxesRef.current.findIndex((b) => b.node === node)
      if (i !== -1) {
        const { parent, node } = boxesRef.current[i]
        boxesRef.current.splice(i, 1)
        parent.removeChild(node)
        dirtyParents.current.add(parent)
        requestReflow()
      } else {
        console.warn(`unable to unregister box (node could not be found)`)
      }
    },
    [requestReflow]
  )

  // Reference to the yoga native node
  const node = useMemo(() => Yoga.Node.create(), [])

  useLayoutEffect(() => {
    reflowRef.current = () => {
      // Common variables for reflow
      const mainAxis = plane[0] as Axis
      const crossAxis = plane[1] as Axis
      const depthAxis = getDepthAxis(plane)
      const [flexWidth, flexHeight] = getFlex2DSize(size, plane)
      const yogaDirection_ =
        yogaDirection === 'ltr' ? Yoga.DIRECTION_LTR : yogaDirection === 'rtl' ? Yoga.DIRECTION_RTL : yogaDirection

      dirtyParents.current.forEach((parent) => updateRealBoxIndices(boxesRef.current, parent))
      dirtyParents.current.clear()

      // Perform yoga layout calculation
      node.calculateLayout(flexWidth * scaleFactor, flexHeight * scaleFactor, yogaDirection_)

      let minX = 0
      let maxX = 0
      let minY = 0
      let maxY = 0

      // Reposition after recalculation
      boxesRef.current.forEach(({ node, centerAnchor, onUpdateTransformation }) => {
        const { left, top, width, height } = node.getComputedLayout()

        const axesValues = [left + (centerAnchor ? width / 2 : 0), -(top + (centerAnchor ? height / 2 : 0)), 0]
        const axes: Array<Axis> = [mainAxis, crossAxis, depthAxis]

        onUpdateTransformation &&
          onUpdateTransformation(
            NaNToZero(getAxis('x', axes, axesValues)) / scaleFactor,
            NaNToZero(getAxis('y', axes, axesValues)) / scaleFactor,
            NaNToZero(width) / scaleFactor,
            NaNToZero(height) / scaleFactor
          )

        minX = Math.min(minX, left)
        minY = Math.min(minY, top)
        maxX = Math.max(maxX, left + width)
        maxY = Math.max(maxY, top + height)
      })

      // Call the reflow event to update resulting size
      onReflow && onReflow((maxX - minX) / scaleFactor, (maxY - minY) / scaleFactor)
    }
    requestReflow()
  }, [requestReflow, node, onReflow, size, plane, yogaDirection, scaleFactor])

  useLayoutEffect(() => {
    setYogaProperties(node, flexProps, scaleFactor)
    // We need to reflow everything if flex props changes
    requestReflow()
  }, [node, flexProps, scaleFactor, requestReflow])

  // Shared context for flex and box
  const sharedFlexContext = useMemo<SharedFlexContext>(
    () => ({
      plane,
      requestReflow,
      registerBox,
      updateBox,
      unregisterBox,
      scaleFactor,
    }),
    [plane, requestReflow, registerBox, unregisterBox, scaleFactor, updateBox]
  )

  return (
    <flexContext.Provider value={sharedFlexContext}>
      <boxNodeContext.Provider value={node}>{children}</boxNodeContext.Provider>
    </flexContext.Provider>
  )
}

/**
 * aligns react index with an ordered continous yogaIndex
 * @param boxesItems all boxes
 * @param parent the parent in which the reordering should happen
 */
function updateRealBoxIndices(boxesItems: Array<BoxesItem>, parent: YogaNode): void {
  //could be done without the filter more efficiently with another data structure (e.g. map with parent as key)
  sortIndex(boxesItems.filter(({ parent: boxParent }) => boxParent === parent)).forEach((box, index) => {
    if (box.yogaIndex != index) {
      if (box.yogaIndex != -1) {
        parent.removeChild(box.node)
      }
      parent.insertChild(box.node, index)
      box.yogaIndex = index
    }
  })
}

function sortIndex(boxes: Array<BoxesItem>): Array<BoxesItem> {
  //split array
  const { unindexed, indexed } = boxes.reduce<{ indexed: Array<BoxesItem>; unindexed: Array<BoxesItem> }>(
    ({ indexed, unindexed }, box) => ({
      indexed: box.reactIndex != null ? [...indexed, box] : indexed,
      unindexed: box.reactIndex == null ? [...unindexed, box] : unindexed,
    }),
    { indexed: [], unindexed: [] }
  )
  //sort after react Index
  const result = indexed.sort(({ reactIndex: r1 }, { reactIndex: r2 }) => r1! - r2!)
  //fillup array
  let i = 0
  let nextUnindexed = unindexed.shift()
  while (nextUnindexed != null) {
    const boxAtIndex = result[i]
    if (boxAtIndex == null || (boxAtIndex.reactIndex != null && boxAtIndex.reactIndex > i)) {
      result.splice(i, 0, nextUnindexed)
      nextUnindexed = unindexed.shift()
    }
    i++
  }
  return result
}

function NaNToZero(val: number) {
  return isNaN(val) ? 0 : val
}

Flex.displayName = 'Flex'
