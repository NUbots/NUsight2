import { storiesOf } from '@storybook/react'
import { action } from 'mobx'
import { reaction } from 'mobx'
import { disposeOnUnmount } from 'mobx-react'
import { now } from 'mobx-utils'
import * as React from 'react'

import { SeededRandom } from '../../../../../shared/base/random/seeded_random'
import { range } from '../../../../../shared/base/range'
import { Classification } from '../../classifications'
import { Lut } from '../../lut'
import { VisualizerController } from '../controller'
import { VisualizerModel } from '../model'
import { VisualizerView } from '../view'

const classifications = Object.freeze([
  Classification.White,
  Classification.Green,
  Classification.Yellow,
  Classification.Orange,
  Classification.Cyan,
  Classification.Magenta,
])

const fullscreen = { width: 'calc(100vw - 20px)', height: 'calc(100vh - 20px)' }
storiesOf('classifier.visualizer', module)
  .add('renders statically', () => {
    const random = SeededRandom.of('classifier')
    const model = VisualizerModel.of(generateLut(random))
    const controller = VisualizerController.of(model)
    return <div style={fullscreen}>
      <VisualizerView model={model} controller={controller}/>
    </div>
  })
  .add('renders animated', () => {
    const random = SeededRandom.of('classifier')
    const model = VisualizerModel.of(generateLut(random))
    const controller = VisualizerController.of(model)
    return <div style={fullscreen}>
      <AnimatedVisualizer model={model} random={random}>
        <VisualizerView model={model} controller={controller}/>
      </AnimatedVisualizer>
    </div>
  })

class AnimatedVisualizer extends React.Component<{
  model: VisualizerModel,
  random: SeededRandom,
  children: any
}> {
  componentDidMount() {
    disposeOnUnmount(this, reaction(() => now('frame'), this.update))
  }

  render() {
    return this.props.children
  }

  @action.bound
  private update() {
    const percentageFull = 0.4
    range(100).forEach(() => {
      const { random, model: { lut } } = this.props
      const randomIndex = random.integer(0, lut.data.length)
      const randomClassification = random.float() <= percentageFull
        ? random.choice(classifications) : Classification.Unclassified
      lut.set(randomIndex, randomClassification)
    })
  }
}

function generateLut(random: SeededRandom, percentageFull = 0.4) {
  return Lut.generate({ x: 4, y: 4, z: 4 }, () => {
    return random.float() <= percentageFull ? random.choice(classifications) : Classification.Unclassified
  })
}
