import { createContext } from 'react'
import { Group } from 'three'
import { YogaNode } from 'yoga-layout-prebuilt'
import { FlexPlane, R3FlexProps } from './props'

export interface SharedFlexContext {
  scaleFactor: number
  plane: FlexPlane
  requestReflow(): void
  registerBox(node: YogaNode, parent: YogaNode): void
  updateBox(
    node: YogaNode,
    index: number | undefined,
    onUpdateTransformation: (x: number, y: number, width: number, height: number) => void,
    centerAnchor?: boolean
  ): void
  unregisterBox(node: YogaNode): void
  notInitialized?: boolean
}

const initialSharedFlexContext: SharedFlexContext = {
  plane: 'xy',
  scaleFactor: 100,
  requestReflow() {
    console.warn('Flex not initialized! Please report')
  },
  registerBox() {
    console.warn('Flex not initialized! Please report')
    return 0
  },
  updateBox() {
    console.warn('Flex not initialized! Please report')
  },
  unregisterBox() {
    console.warn('Flex not initialized! Please report')
  },
  notInitialized: true,
}

export const flexContext = createContext<SharedFlexContext>(initialSharedFlexContext)

export const boxNodeContext = createContext<YogaNode | null>(null)

export const referenceGroupContext = createContext<Group | null>(null as any)
