import { createTransformer } from 'mobx'
import { computed } from 'mobx'
import { GroundViewModel } from '../ground/view_model'
import { FieldModel } from './model'

export type KickTargetProps = {

}

const KickTarget = (props: KickTargetProps) => {

}

const Robot = () => {

}


export class FieldViewModel {
  public constructor(private model: FieldModel) {}

  public static of = createTransformer((model: FieldModel): FieldViewModel => {
    return new FieldViewModel(model)
  })

  @computed
  public get scene() {
    return [
      this.ground
    ]
  }
  
  @computed
  private get ground() {
    return GroundViewModel.of(this.model.ground).ground
  }
}
