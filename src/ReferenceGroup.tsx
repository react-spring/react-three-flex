import * as Fiber from '@react-three/fiber'
import React, { forwardRef, useMemo, useState } from 'react'
import { Group } from 'three'
import mergeRefs from 'react-merge-refs'
import { referenceGroupContext } from './context'

export const ReferenceGroup = forwardRef<Group, Fiber.GroupProps>(({ children, ...props }, ref) => {
  const [group, setRef] = useState<Group | null>(null)
  const mergedReds = useMemo(() => mergeRefs([ref, setRef]), [ref, setRef])
  return (
    <group ref={mergedReds} {...props}>
      <referenceGroupContext.Provider value={group}>{children}</referenceGroupContext.Provider>
    </group>
  )
})
