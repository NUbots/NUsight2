import { storiesOf } from '@storybook/react'
import { runInAction } from 'mobx'
import { observer } from 'mobx-react'
import { Component } from 'react'
import * as React from 'react'

import { SeededRandom } from '../../../../../shared/base/random/seeded_random'
import { fullscreen } from '../../../storybook/fullscreen'
import { Classification } from '../../classifications'
import { Lut } from '../../lut'
import { ClassifiedImageModel } from '../model'
import { ClassifiedImageView } from '../view'

import * as imageUrl from './image.jpg'

storiesOf('classifier.classified_image', module)
  .addDecorator(fullscreen)
  .add('renders statically', () => {
    const random = SeededRandom.of('classifier')
    const lut = generateLut(random)
    const model = ClassifiedImageModel.of({ lut })
    return <ClassifiedImageViewHarness model={model}/>
  })

@observer
class ClassifiedImageViewHarness extends Component<{ model: ClassifiedImageModel }> {
  async componentDidMount() {
    const image = await loadImage(imageUrl)
    runInAction(() => this.props.model.image = { type: 'image', image })
  }

  render() {
    return <ClassifiedImageView model={this.props.model}/>
  }
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject()
    image.src = url
  })
}

const classifications = Object.freeze([
  Classification.White,
  Classification.Green,
  Classification.Yellow,
  Classification.Orange,
  Classification.Cyan,
  Classification.Magenta,
])

function generateLut(random: SeededRandom, percentageFull = 0.4) {
  return Lut.generate({ x: 4, y: 4, z: 4 }, () => {
    return random.float() <= percentageFull ? random.choice(classifications) : Classification.Unclassified
  })
}
