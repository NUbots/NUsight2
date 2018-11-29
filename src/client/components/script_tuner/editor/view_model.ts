// TODO map out each of the limbs into script line

import { observable } from 'mobx'

export class EditorViewModel {
  @observable cellWidth = 32
  @observable scaleX = 2
  @observable height = 200
  @observable timelineLength = 90
}
