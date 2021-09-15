import { Box, AutomaticBox, ReferenceGroup, Flex } from '../../src'
import React, { Suspense } from 'react'
import { ComponentMeta, ComponentStory } from '@storybook/react'

import { Setup } from '../Setup'
import { MathUtils } from 'three'

const { degToRad } = MathUtils

const Rotation = ({
  rotationX,
  rotationY,
  rotationZ,
  rotationXItems,
  rotationYItems,
  rotationZItems,
}: {
  rotationX: number
  rotationY: number
  rotationZ: number
  rotationXItems: number
  rotationYItems: number
  rotationZItems: number
}) => {
  const width = 3
  const height = 1
  return (
    <group position={[0, 0, 3]} rotation={[degToRad(rotationX), degToRad(rotationY), degToRad(rotationZ)]}>
      <Flex
        size={[width, height, 0]}
        flexDirection="row"
        flexWrap="no-wrap"
        alignItems="stretch"
        justifyContent="flex-start"
      >
        <ReferenceGroup>
          <AutomaticBox
            rotation={[degToRad(rotationXItems), degToRad(rotationYItems), degToRad(rotationZItems)]}
            centerAnchor
          >
            <mesh>
              <boxGeometry args={[1, 1, 1]} />
              <meshBasicMaterial color="red" wireframe />
            </mesh>
          </AutomaticBox>

          <AutomaticBox
            rotation={[degToRad(rotationXItems), degToRad(rotationYItems), degToRad(rotationZItems)]}
            centerAnchor
          >
            <mesh>
              <boxGeometry args={[1, 1, 1]} />
              <meshBasicMaterial color="orange" wireframe />
            </mesh>
          </AutomaticBox>
        </ReferenceGroup>
      </Flex>
    </group>
  )
}

export default {
  title: 'Example/Rotation',
  component: Rotation,
} as ComponentMeta<typeof Rotation>

const Template: ComponentStory<typeof Rotation> = (args) => (
  <Setup lights={false}>
    <Suspense fallback={null}>
      <Rotation {...args} />
    </Suspense>
  </Setup>
)

export const RootRotated = Template.bind({})
RootRotated.args = {
  rotationX: 10,
  rotationY: 30,
  rotationZ: 10,
  rotationXItems: 0,
  rotationYItems: 0,
  rotationZItems: 0,
}

export const ItemsRotated = Template.bind({})
ItemsRotated.args = {
  rotationX: 0,
  rotationY: 0,
  rotationZ: 0,
  rotationXItems: 0,
  rotationYItems: 45,
  rotationZItems: 0,
}
