import { useCallback, useContext as useContextImpl, useMemo, useState } from 'react'
import { Box3, Object3D, Vector3 } from 'three'
import { flexContext, boxNodeContext, referenceGroupContext } from './context'
import { Axis, getOBBSize } from './util'

export function useContext<T>(context: React.Context<T>) {
  let result = useContextImpl(context)
  if (result == null) {
    console.warn('You must place this hook/component under a <Flex/> component!')
  }
  return result
}

export function useFlexNode() {
  return useContext(boxNodeContext)
}

const boundingBox = new Box3()
const vec = new Vector3()

export function usePropsSyncSize<T>(
  flexProps: T
): [T & { width?: number; height?: number }, (ref: Object3D | undefined) => void] {
  const [overwrittenProps, setSize] = usePropsSetSize(flexProps)
  const { plane } = useContext(flexContext)
  const referenceGroup = useContextImpl(referenceGroupContext)
  const setRef = useCallback(
    (ref: Object3D | undefined) => {
      if (ref == null) {
        setSize([undefined, undefined])
      } else {
        getOBBSize(ref, referenceGroup, boundingBox, vec)
        const mainAxis = plane[0] as Axis
        const crossAxis = plane[1] as Axis
        setSize([vec[mainAxis], vec[crossAxis]])
      }
    },
    [setSize, referenceGroup, plane]
  )
  return [overwrittenProps, setRef]
}

/**
 * explicitly set the size of the box's yoga node
 * @requires that the surrounding Flex-Element has `disableSizeRecalc` set to `true`
 */
export function usePropsSetSize<T>(
  flexProps: T
): [T & { width?: number; height?: number }, (size: [width: number | undefined, height: number | undefined]) => void] {
  const [[width, height], setSize] = useState<[width: number | undefined, height: number | undefined]>([
    undefined,
    undefined,
  ])
  const overwrittenProps = useMemo(() => {
    if (width != null && height != null) {
      return {
        width,
        height,
        ...flexProps,
      }
    } else {
      return flexProps
    }
  }, [flexProps, width, height])
  return [overwrittenProps, setSize]
}
