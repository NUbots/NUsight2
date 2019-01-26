import { storiesOf } from '@storybook/react'
import { action } from 'mobx'
import { reaction } from 'mobx'
import { disposeOnUnmount } from 'mobx-react'
import { now } from 'mobx-utils'
import { ComponentType } from 'react'
import * as React from 'react'

import { SeededRandom } from '../../../../../shared/base/random/seeded_random'
import { range } from '../../../../../shared/base/range'
import { Classification } from '../../classifications'
import { Lut } from '../../lut'
import { VisualizerModel } from '../model'
import { VisualiserProps } from '../view'
import { VisualizerView } from '../view'

const classifications = Object.freeze([
  Classification.White,
  Classification.Green,
  Classification.Yellow,
  Classification.Orange,
  Classification.Cyan,
  Classification.Magenta,
])

function generateLut(percentageFull = 0.2) {
  const random = SeededRandom.of('classifier')
  return Lut.generate({ x: 4, y: 4, z: 4 }, () => {
    return (random.float() <= percentageFull) ? random.choice(classifications) : Classification.Unclassified
  })
}

storiesOf('classifier.visualizer', module)
  .add('renders statically', () => {
    const model = VisualizerModel.of(generateLut())
    const Visualizer = VisualizerView.of(model)
    return <div style={{ width: 'calc(100vw - 20px)', height: 'calc(100vh - 20px)' }}>
      <Visualizer/>
    </div>
  })
  .add('renders animated', () => {
    const random = SeededRandom.of('classifier')
    const model = VisualizerModel.of(generateLut())
    return <div style={{ width: 'calc(100vw - 20px)', height: 'calc(100vh - 20px)' }}>
      <AnimatedVisualizer model={model} Visualizer={VisualizerView.of(model)} random={random}/>
    </div>
  })

class AnimatedVisualizer extends React.Component<{
  model: VisualizerModel,
  Visualizer: ComponentType<VisualiserProps>,
  random: SeededRandom
}> {
  componentDidMount() {
    disposeOnUnmount(this, reaction(() => now('frame'), this.update))
  }

  render() {
    return <this.props.Visualizer/>
  }

  @action.bound
  private update() {
    range(100).forEach(() => {
      const index = this.props.random.integer(0, this.props.model.lut.data.length)
      const percentageFull = 0.2
      const classification = (this.props.random.float() <= percentageFull)
        ? this.props.random.choice(classifications) : Classification.Unclassified
      this.props.model.lut.set(index, classification)
    })
  }
}
