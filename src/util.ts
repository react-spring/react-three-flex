import { Box3, Matrix4, Object3D, Vector3 } from 'three'
import Yoga, { YogaApi, YGNodeRef, CONSTANTS } from 'yoga-wasm-slim'
import usePromise from 'react-promise-suspense'
import { R3FlexProps, FlexPlane } from './props'

let yogaGlobalInstance: YogaApi | null = null
export function useYogaAsync(path: string): YogaApi {
  return usePromise(
    async (path: string) => {
      if (!yogaGlobalInstance) {
        const yoga = await Yoga({ locateFile: (file) => path + file })
        yogaGlobalInstance = yoga
      }
      return yogaGlobalInstance
    },
    [path]
  )
}

export const capitalize = (s: string) => s[0].toUpperCase() + s.slice(1)

export const jsxPropToYogaProp = (s: string) => s.toUpperCase().replace('-', '_')

export function setPropertyString(
  yogaInstance: YogaApi,
  node: YGNodeRef,
  name: string,
  value: string | number,
  scaleFactor: number,
  ...additionalParams: any[]
) {
  if (typeof value === 'number') {
    ;(yogaInstance as any)[`_YGNodeStyleSet${name}`](node, ...additionalParams, value * scaleFactor)
  } else if (value.endsWith('%')) {
    ;(yogaInstance as any)[`_YGNodeStyleSet${name}Percent`](node, ...additionalParams, parseFloat(value))
  } else if (value === 'auto') {
    ;(yogaInstance as any)[`_YGNodeStyleSet${name}Auto`](node, ...additionalParams)
  } else if (value.endsWith('px')) {
    ;(yogaInstance as any)[`_YGNodeStyleSet${name}`](node, ...additionalParams, parseFloat(value) * scaleFactor)
  }
}

export const setYogaProperties = (yogaInstance: YogaApi, node: YGNodeRef, props: R3FlexProps, scaleFactor: number) => {
  return Object.keys(props).forEach((name) => {
    const value = props[name as keyof R3FlexProps]
    if (!value) return

    if (!value) return

    if (typeof value === 'string') {
      switch (name) {
        case 'flexDir':
        case 'dir':
        case 'flexDirection':
          return yogaInstance._YGNodeStyleSetFlexDirection(
            node,
            CONSTANTS[`FLEX_DIRECTION_${jsxPropToYogaProp(value as string)}` as keyof typeof CONSTANTS]
          )
        case 'align':
        case 'alignItems':
          return yogaInstance._YGNodeStyleSetAlignItems(
            node,
            CONSTANTS[`ALIGN_${jsxPropToYogaProp(value as string)}` as keyof typeof CONSTANTS]
          )
        case 'alignContent':
          return yogaInstance._YGNodeStyleSetAlignContent(
            node,
            CONSTANTS[`ALIGN_${jsxPropToYogaProp(value as string)}` as keyof typeof CONSTANTS]
          )
        case 'alignSelf':
          return yogaInstance._YGNodeStyleSetAlignSelf(
            node,
            CONSTANTS[`ALIGN_${jsxPropToYogaProp(value as string)}` as keyof typeof CONSTANTS]
          )
        case 'justify':
        case 'justifyContent':
          return yogaInstance._YGNodeStyleSetJustifyContent(
            node,
            CONSTANTS[`JUSTIFY_${jsxPropToYogaProp(value as string)}` as keyof typeof CONSTANTS]
          )
        case 'wrap':
        case 'flexWrap':
          return yogaInstance._YGNodeStyleSetFlexWrap(
            node,
            CONSTANTS[`WRAP_${jsxPropToYogaProp(value as string)}` as keyof typeof CONSTANTS]
          )

        case 'basis':
        case 'flexBasis':
          return setPropertyString(yogaInstance, node, 'FlexBasis', value, scaleFactor)

        default:
          return setPropertyString(yogaInstance, node, capitalize(name), value, scaleFactor)
      }
    } else if (typeof value === 'number') {
      switch (name) {
        case 'grow':
        case 'flexGrow':
          return setPropertyString(yogaInstance, node, 'FlexGrow', value, scaleFactor)
        case 'shrink':
        case 'flexShrink':
          return setPropertyString(yogaInstance, node, 'FlexShrink', value, scaleFactor)

        case 'width':
          return setPropertyString(yogaInstance, node, 'Width', value, scaleFactor)
        case 'height':
          return setPropertyString(yogaInstance, node, 'Height', value, scaleFactor)

        case 'maxHeight':
          return setPropertyString(yogaInstance, node, 'MaxWidth', value, scaleFactor)
        case 'maxWidth':
          return setPropertyString(yogaInstance, node, 'MaxHeight', value, scaleFactor)
        case 'minHeight':
          return setPropertyString(yogaInstance, node, 'MinWidth', value, scaleFactor)
        case 'minWidth':
          return setPropertyString(yogaInstance, node, 'MinHeight', value, scaleFactor)

        case 'padding':
        case 'p':
          return setPropertyString(yogaInstance, node, 'Padding', value, scaleFactor, CONSTANTS.EDGE_ALL)
        case 'paddingLeft':
        case 'pl':
          return setPropertyString(yogaInstance, node, 'Padding', value, scaleFactor, CONSTANTS.EDGE_LEFT)
        case 'paddingRight':
        case 'pr':
          return setPropertyString(yogaInstance, node, 'Padding', value, scaleFactor, CONSTANTS.EDGE_RIGHT)
        case 'paddingTop':
        case 'pt':
          return setPropertyString(yogaInstance, node, 'Padding', value, scaleFactor, CONSTANTS.EDGE_TOP)
        case 'paddingBottom':
        case 'pb':
          return setPropertyString(yogaInstance, node, 'Padding', value, scaleFactor, CONSTANTS.EDGE_BOTTOM)

        case 'margin':
        case 'm':
          return setPropertyString(yogaInstance, node, 'Margin', value, scaleFactor, CONSTANTS.EDGE_ALL)
        case 'marginLeft':
        case 'ml':
          return setPropertyString(yogaInstance, node, 'Margin', value, scaleFactor, CONSTANTS.EDGE_LEFT)
        case 'marginRight':
        case 'mr':
          return setPropertyString(yogaInstance, node, 'Margin', value, scaleFactor, CONSTANTS.EDGE_RIGHT)
        case 'marginTop':
        case 'mt':
          return setPropertyString(yogaInstance, node, 'Margin', value, scaleFactor, CONSTANTS.EDGE_TOP)
        case 'marginBottom':
        case 'mb':
          return setPropertyString(yogaInstance, node, 'Margin', value, scaleFactor, CONSTANTS.EDGE_BOTTOM)
      }
    }
  })
}

export const vectorFromObject = ({ x, y, z }: { x: number; y: number; z: number }) => new Vector3(x, y, z)

export type Axis = 'x' | 'y' | 'z'
export const axes: Axis[] = ['x', 'y', 'z']

export function getDepthAxis(plane: FlexPlane) {
  switch (plane) {
    case 'xy':
      return 'z'
    case 'yz':
      return 'x'
    case 'xz':
      return 'y'
  }
}

export function getFlex2DSize(sizes: [number, number, number], plane: FlexPlane) {
  switch (plane) {
    case 'xy':
      return [sizes[0], sizes[1]]
    case 'yz':
      return [sizes[1], sizes[2]]
    case 'xz':
      return [sizes[0], sizes[2]]
  }
}

export const rmUndefFromObj = (obj: Record<string, any>) =>
  Object.keys(obj).forEach((key) => (obj[key] === undefined ? delete obj[key] : {}))

/**
 * Adapted code from https://github.com/mrdoob/three.js/issues/11967
 * Calculates oriented bounding box size
 * Essentially it negates flex root rotation to provide proper number
 * E.g. if root flex group rotatet 45 degress, a cube box of size 1 will report sizes of sqrt(2)
 * but it should still be 1
 *
 * NB: This doesn't work when object itself is rotated (well, for now)
 */
export const getOBBSize = (object: Object3D, root: Object3D, bb: Box3, size: Vector3) => {
  object.updateMatrix()
  const oldMatrix = object.matrix
  const oldMatrixAutoUpdate = object.matrixAutoUpdate

  root.updateMatrixWorld()
  const m = new Matrix4().copy(root.matrixWorld).invert()
  object.matrix = m
  // to prevent matrix being reassigned
  object.matrixAutoUpdate = false
  root.updateMatrixWorld()

  bb.setFromObject(object).getSize(size)

  object.matrix = oldMatrix
  object.matrixAutoUpdate = oldMatrixAutoUpdate
  root.updateMatrixWorld()
}

// TODO add _YGNodeGetParent to yoga-wasm-slim
const getIsTopLevelChild = (yogaInstance: YogaApi, node: YGNodeRef) => {
  // @ts-ignore TODO rm, it's only here so I could build the package
  const parentNode = yogaInstance._YGNodeGetParent(node)
  if (!parentNode) return false
  // @ts-ignore TODO rm, it's only here so I could build the package
  return !yogaInstance._YGNodeGetParent(parentNode)
}

/** @returns [mainAxisShift, crossAxisShift] */
export const getRootShift = (
  rootCenterAnchor: boolean | undefined,
  rootWidth: number,
  rootHeight: number,
  yogaInstance: YogaApi,
  node: YGNodeRef
) => {
  if (!rootCenterAnchor || !getIsTopLevelChild(yogaInstance, node)) {
    return [0, 0]
  }
  const mainAxisShift = -rootWidth / 2
  const crossAxisShift = -rootHeight / 2
  return [mainAxisShift, crossAxisShift] as const
}
