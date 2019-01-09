import { computed, observable } from 'mobx'
import { createTransformer } from 'mobx-utils'

import { Frame, ScriptTunerModel } from '../model'

export class ViewerViewModel {
  constructor(private model: ScriptTunerModel) {
  }

  static of = createTransformer((model: ScriptTunerModel): ViewerViewModel => {
    return new ViewerViewModel(model)
  })

  @computed
  get servos() {
    return this.model.servos.map(servo => {
      const time = this.model.currentTime
      const frame = findFrame(time, servo.frames)

      if (frame) {
        return [time, frame.angle]
      } else {
        const [left, right] = findNearestFrames(time, servo.frames)
        const leftFrame = findFrame(left, servo.frames)
        const rightFrame = findFrame(right, servo.frames)

        if (leftFrame && rightFrame) {
          return [time, interpolateAngle(leftFrame, rightFrame, time)]
        } else {
          return [time, Infinity]
        }
      }
    })
  }
}

function findNearestFrames(time: number, servoFrames: Frame[]): [number, number] {
  const [i, smaller, greater] = binarySearch(servoFrames, frame => time - frame.time)
  // console.log('i, smaller, greater', i, smaller, greater)
  return [-1, -1]
}

function findFrame(time: number, servoFrames: Frame[]): Frame | undefined {
  const [index, smaller, greater] = binarySearch(servoFrames, frame => time - frame.time)
  // console.log('find frame: index, smaller, greater', index, smaller, greater)
  return servoFrames[index]
}

function interpolateAngle(left: Frame, right: Frame, time: number): number {
  const { time: x1, angle: y1 } = left
  const { time: x2, angle: y2 } = right
  const slope = (y2 - y1) / (x2 - x1)

  return (slope * (time - x1)) + y1
}

type CompareFunction<T> = (item: T) => number

function binarySearch<T>(
  array: T[],
  comparator: CompareFunction<T>,
  start: number = 0,
  end: number = array.length,
): [number, number, number] {
  // console.log('\n\n\n')
  while (start <= end) {
    const i = Math.floor(start + (end - start) / 2)
    const compareResult = comparator(array[i])

    if (compareResult === 0) {
      return [i, i - 1, i + 1]
    } else if (compareResult > 0) {
      start = i + 1
    } else if (compareResult < 0) {
      end = i - 1
    }
  }

  // console.log(start, end)
  return [-1, end, end + 1]
}
