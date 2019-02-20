import { RenderFunction } from '@storybook/react'
import * as React from 'react'

interface ContainerProps {
  maxWidth?: number | string
  padding?: number | string
}

export function createContainerDecorator(props: ContainerProps) {
  const { maxWidth = '600px', padding = 0 } = props
  return (story: RenderFunction) => {
    return <div style={{ maxWidth, padding }}>{story()}</div>
  }
}
