import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import { a } from '@react-spring/three'

import { Flex, Box, SpringBox } from '../../src'
import { Setup } from '../Setup'

const List = ({ width, height }: { width: number; height: number }) => {
  return (
    <group position={[-width / 2, height / 2, 0]}>
      <Flex size={[width, height, 0]} flexDirection="row" flexWrap="wrap">
        {new Array(8).fill(undefined).map((_, i) => (
          <SpringBox margin={0.3} key={i} width={1.6} height={2} centerAnchor>
            {(width, height) => (
              <a.mesh scale-x={width} scale-y={height}>
                <planeBufferGeometry args={[1, 1]} />
                <meshBasicMaterial color={0x0000ff} />
              </a.mesh>
            )}
          </SpringBox>
        ))}
      </Flex>
    </group>
  )
}

export default {
  title: 'Example/List',
  component: List,
} as ComponentMeta<typeof List>

const Template: ComponentStory<typeof List> = (args) => (
  <Setup>
    <List {...args} />
  </Setup>
)

export const Primary = Template.bind({})
Primary.args = {
  width: 12,
  height: 7,
}
