import { useContext, useMemo, useLayoutEffect } from 'react'
import Yoga, { YogaNode } from 'yoga-layout-prebuilt'
import { R3FlexProps, useFlexNode } from '.'
import { flexContext } from './context'
import { setYogaProperties } from './util'

export function useBox(
  flexProps: R3FlexProps | undefined,
  centerAnchor: boolean | undefined,
  index: number | undefined,
  onUpdateTransformation: (x: number, y: number, width: number, height: number) => void
): YogaNode {
  const { registerBox, unregisterBox, updateBox, scaleFactor, requestReflow } = useContext(flexContext)
  const parent = useFlexNode()
  const node = useMemo(() => Yoga.Node.create(), [])

  useLayoutEffect(() => {
    setYogaProperties(node, flexProps ?? {}, scaleFactor)
    requestReflow()
  }, [flexProps, node, scaleFactor, requestReflow])

  //register and unregister box
  useLayoutEffect(() => {
    if (!parent) return
    registerBox(node, parent)
    return () => unregisterBox(node)
  }, [node, parent, registerBox, unregisterBox])

  //update box properties
  useLayoutEffect(
    () => updateBox(node, index, onUpdateTransformation, centerAnchor),
    [node, index, centerAnchor, onUpdateTransformation, updateBox]
  )

  return node
}
