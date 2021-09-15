import {
  YogaFlexDirection,
  YogaAlign,
  YogaJustifyContent,
  YogaFlexWrap,
  YogaDirection,
  YogaMeasureMode,
} from 'yoga-layout-prebuilt'
import { rmUndefFromObj } from './util'
import { useMemo } from 'react'

export type FlexYogaDirection = YogaDirection | 'ltr' | 'rtl'
export type FlexPlane = 'xy' | 'yz' | 'xz'

export type Value = string | number

export type FlexDirection = YogaFlexDirection | 'row' | 'column' | 'row-reverse' | 'column-reverse'

export type JustifyContent =
  | YogaJustifyContent
  | 'center'
  | 'flex-end'
  | 'flex-start'
  | 'space-between'
  | 'space-evenly'
  | 'space-around'

export type Align =
  | YogaAlign
  | 'auto'
  | 'baseline'
  | 'center'
  | 'flex-end'
  | 'flex-start'
  | 'space-around'
  | 'space-between'
  | 'stretch'

export type FlexWrap = YogaFlexWrap | 'no-wrap' | 'wrap' | 'wrap-reverse'

export type R3FlexProps = Partial<{
  // Align
  alignContent: Align
  alignItems: Align
  alignSelf: Align
  // Shorthand for alignItems
  align: Align

  // Justify
  justifyContent: JustifyContent
  // Shorthand for justifyContent
  justify: JustifyContent

  // Direction
  flexDirection: FlexDirection
  // Shorthand for flexDirection
  flexDir: FlexDirection
  // Shorthand for flexDirection
  dir: FlexDirection

  // Wrap
  flexWrap: FlexWrap
  // Shorthand for flexWrap
  wrap: FlexWrap

  // Flex basis
  flexBasis: number
  // Shorthand for flexBasis
  basis: number

  // Grow & shrink
  flexGrow: number
  // Shorthand for flexGrow
  grow: number

  flexShrink: number
  // Shorthand for flexShrink
  shrink: number

  // Height & width
  height: Value
  width: Value
  maxHeight: Value
  maxWidth: Value
  minHeight: Value
  minWidth: Value

  // Padding
  padding: Value
  // Shorthand for padding
  p: Value

  paddingTop: Value
  // Shorthand for paddingTop
  pt: Value

  paddingBottom: Value
  // Shorthand for paddingBottom
  pb: Value

  paddingLeft: Value
  // Shorthand for paddingLeft
  pl: Value

  paddingRight: Value
  // Shorthand for paddingRight
  pr: Value

  // Margin
  margin: Value
  // Shorthand for margin
  m: Value

  marginTop: Value
  // Shorthand for marginTop
  mt: Value

  marginLeft: Value
  // Shorthand for marginLeft
  ml: Value

  marginRight: Value
  // Shorthand for marginRight
  mr: Value

  marginBottom: Value
  // Shorthand for marginBottom
  mb: Value

  measureFunc: (
    width: number,
    widthMeasureMode: YogaMeasureMode,
    height: number,
    heightMeasureMode: YogaMeasureMode
  ) => { width?: number; height?: number } | null

  aspectRatio: number
}>

export function useProps<T>({
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

  measureFunc,
  aspectRatio,

  // other
  ...props
}: R3FlexProps & T): [R3FlexProps, typeof props] {
  return [
    useMemo(() => {
      const result = {
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

        measureFunc,
        aspectRatio,
      }
      rmUndefFromObj(result)
      return result
    }, [
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

      measureFunc,
      aspectRatio,
    ]),
    props,
  ]
}
