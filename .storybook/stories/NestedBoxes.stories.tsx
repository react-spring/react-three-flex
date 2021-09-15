import { AutomaticBox, Box, Flex } from '../../src'
import React, { Suspense } from 'react'
import { ComponentMeta, ComponentStory } from '@storybook/react'
import { Box as Cube } from '@react-three/drei'
import { Color } from '@react-three/fiber'

import { Setup } from '../Setup'

const Block = ({ color1, color2 }: { color1: Color; color2: Color }) => {
  return (
    <Box alignItems="flex-start" marginLeft={20} flexDirection="row">
      <AutomaticBox centerAnchor>
        <Cube args={[100, 100, 1]}>
          <meshBasicMaterial toneMapped={false} color={color1} />
        </Cube>
      </AutomaticBox>
      <AutomaticBox centerAnchor>
        <Cube args={[100, 100, 1]}>
          <meshBasicMaterial toneMapped={false} color={color2} />
        </Cube>
      </AutomaticBox>
    </Box>
  )
}

const NestedBoxes = ({ width, height }: { width: number; height: number }) => {
  return (
    <group position={[-200, 50, -200]}>
      <Flex flexDirection="row">
        <Block color1="red" color2="green" />
        <Block color1="yellow" color2="white" />
      </Flex>
    </group>
  )
}

export default {
  title: 'Example/NestedBoxes',
  component: NestedBoxes,
} as ComponentMeta<typeof NestedBoxes>

const Template: ComponentStory<typeof NestedBoxes> = (args) => (
  <Setup lights={false}>
    <Suspense fallback={null}>
      <NestedBoxes {...args} />
    </Suspense>
  </Setup>
)

export const Primary = Template.bind({})
Primary.args = {
  width: 3,
  height: 2,
}
