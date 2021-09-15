import { Box3, Matrix4, Object3D, Vector3 } from 'three'
import Yoga, { YogaNode } from 'yoga-layout-prebuilt'
import { R3FlexProps, FlexPlane } from './props'

export const capitalize = (s: string) => s[0].toUpperCase() + s.slice(1)

export const jsxPropToYogaProp = (s: string) => s.toUpperCase().replace('-', '_')

export const setYogaProperties = (node: YogaNode, props: R3FlexProps, scaleFactor: number) => {
  return Object.keys(props).forEach((name) => {
    const value = props[name as keyof R3FlexProps]

    if (typeof value === 'string') {
      switch (name) {
        case 'flexDir':
        case 'dir':
        case 'flexDirection':
          return node.setFlexDirection((Yoga as any)[`FLEX_DIRECTION_${jsxPropToYogaProp(value)}`])
        case 'align':
          node.setAlignItems((Yoga as any)[`ALIGN_${jsxPropToYogaProp(value)}`])
          return node.setAlignContent((Yoga as any)[`ALIGN_${jsxPropToYogaProp(value)}`])
        case 'alignContent':
          return node.setAlignContent((Yoga as any)[`ALIGN_${jsxPropToYogaProp(value)}`])
        case 'alignItems':
          return node.setAlignItems((Yoga as any)[`ALIGN_${jsxPropToYogaProp(value)}`])
        case 'alignSelf':
          return node.setAlignSelf((Yoga as any)[`ALIGN_${jsxPropToYogaProp(value)}`])
        case 'justify':
        case 'justifyContent':
          return node.setJustifyContent((Yoga as any)[`JUSTIFY_${jsxPropToYogaProp(value)}`])
        case 'wrap':
        case 'flexWrap':
          return node.setFlexWrap((Yoga as any)[`WRAP_${jsxPropToYogaProp(value)}`])
        case 'basis':
        case 'flexBasis':
          return node.setFlexBasis(value)
        case 'width':
          return node.setWidth(value)
        case 'height':
          return node.setHeight(value)

        default:
          return (node[`set${capitalize(name)}` as keyof YogaNode] as any)(value)
      }
    } else if (typeof value === 'number') {
      const scaledValue = value * scaleFactor
      switch (name) {
        case 'basis':
        case 'flexBasis':
          return node.setFlexBasis(scaledValue)
        case 'width':
          return node.setWidth(scaledValue)
        case 'height':
          return node.setHeight(scaledValue)
        case 'grow':
        case 'flexGrow':
          return node.setFlexGrow(scaledValue)
        case 'shrink':
        case 'flexShrink':
          return node.setFlexShrink(scaledValue)
        case 'align':
          return node.setAlignItems(value as any)
        case 'justify':
          return node.setJustifyContent(value as any)
        case 'flexDir':
        case 'dir':
          return node.setFlexDirection(value as any)
        case 'wrap':
          return node.setFlexWrap(value as any)
        case 'padding':
        case 'p':
          return node.setPadding(Yoga.EDGE_ALL, scaledValue)
        case 'paddingLeft':
        case 'pl':
          return node.setPadding(Yoga.EDGE_LEFT, scaledValue)
        case 'paddingRight':
        case 'pr':
          return node.setPadding(Yoga.EDGE_RIGHT, scaledValue)
        case 'paddingTop':
        case 'pt':
          return node.setPadding(Yoga.EDGE_TOP, scaledValue)
        case 'paddingBottom':
        case 'pb':
          return node.setPadding(Yoga.EDGE_BOTTOM, scaledValue)

        case 'margin':
        case 'm':
          return node.setMargin(Yoga.EDGE_ALL, scaledValue)
        case 'marginLeft':
        case 'ml':
          return node.setMargin(Yoga.EDGE_LEFT, scaledValue)
        case 'marginRight':
        case 'mr':
          return node.setMargin(Yoga.EDGE_RIGHT, scaledValue)
        case 'marginTop':
        case 'mt':
          return node.setMargin(Yoga.EDGE_TOP, scaledValue)
        case 'marginBottom':
        case 'mb':
          return node.setMargin(Yoga.EDGE_BOTTOM, scaledValue)
        case 'aspectRatio':
          return node.setAspectRatio(value)
        default:
          return (node[`set${capitalize(name)}` as keyof YogaNode] as any)(scaledValue)
      }
    } else if (typeof value === 'function') {
      switch (name) {
        case 'measureFunc':
          return node.setMeasureFunc(value)
      }
    }
  })
}

export type Axis = 'x' | 'y' | 'z'
export const axes: Axis[] = ['x', 'y', 'z']

export function getAxis(searchAxis: Axis, axes: Array<Axis>, values: Array<number>) {
  const index = axes.findIndex((axis) => axis === searchAxis)
  if (index == -1) {
    throw new Error(`unable to find axis "${searchAxis}" in [${axes.join(', ')}] `)
  }
  return values[index]
}

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
export const getOBBSize = (object: Object3D, root: Object3D | null, bb: Box3, size: Vector3) => {
  if (root == null) {
    bb.setFromObject(object).getSize(size)
  } else {
    object.updateMatrix()
    const oldMatrix = object.matrix
    const oldMatrixAutoUpdate = object.matrixAutoUpdate

    root.updateMatrixWorld()
    const m = new Matrix4().copy(root.matrixWorld).invert()
    //this also inverts all transformations by "object"
    object.matrix = m
    // to prevent matrix being reassigned
    object.matrixAutoUpdate = false
    root.updateMatrixWorld()

    bb.setFromObject(object).getSize(size)

    object.matrix = oldMatrix
    object.matrixAutoUpdate = oldMatrixAutoUpdate
    root.updateMatrixWorld()
  }
}
