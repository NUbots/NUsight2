import { message } from '../../src/shared/proto/messages'
import { MessageTypePath } from '../client/network/message_type_names'
import { SeededRandom } from '../shared/base/random/seeded_random'
import { range } from '../shared/base/range'
import { Simulator } from './simulator'
import { Message } from './simulator'
import BallMeasurementType = message.vision.Ball.MeasurementType
import GoalMeasurementType = message.vision.Goal.MeasurementType
import NUsightBalls = message.vision.NUsightBalls
import NUsightGoals = message.vision.NUsightGoals
import Side = message.vision.Goal.Side
import Team = message.vision.Goal.Team

export class VisionSimulator implements Simulator {
  public constructor(private random: SeededRandom) {
  }

  public static of() {
    return new VisionSimulator(SeededRandom.of('vision_simulator'))
  }

  public simulate(time: number, index: number, numRobots: number): Message[] {
    return [
      this.balls(time, index, numRobots),
      this.goals(time, index, numRobots),
    ]
  }

  public balls(time: number, index: number, numRobots: number): Message {
    const numBalls = this.random.integer(0, 3)
    const messageType = MessageTypePath.of().getPath(NUsightBalls)
    // TODO: production reasonable values.
    const buffer = NUsightBalls.encode({
      balls: range(numBalls).map(i => ({
        visObject: {
          timestamp: { seconds: time },
          screenAngular: { x: 0, y: 0 },
          angularSize: { x: 0, y: 0 },
          cameraId: 1,
        },
        measurements: [{
          type: BallMeasurementType.WIDTH_BASED,
          rBCc: { x: 0, y: 0, z: 0 },
          covariance: { x: { x: 0, y: 0, z: 0 }, y: { x: 0, y: 0, z: 0 }, z: { x: 0, y: 0, z: 0 } },
        }],
        edgePoints: [
          { x: 0, y: 0, z: 0 },
        ],
        circle: {
          radius: 10,
          centre: { x: this.random.float(0, 300), y: this.random.float(0, 150) },
        },
      })),
    }).finish()
    return { messageType, buffer }
  }

  public goals(time: number, index: number, numRobots: number): Message {
    const numGoals = this.random.integer(0, 3)
    const messageType = MessageTypePath.of().getPath(NUsightGoals)
    // TODO: production reasonable values.
    const buffer = NUsightGoals.encode({
      goals: range(numGoals).map(i => ({
        visObject: {
          timestamp: { seconds: time },
          screenAngular: { x: 0, y: 0 },
          angularSize: { x: 0, y: 0 },
          cameraId: 1,
        },
        side: Side.UNKNOWN_SIDE,
        team: Team.UNKNOWN_TEAM,
        quad: {
          tl: { x: 0, y: 0 },
          tr: { x: 0, y: 0 },
          bl: { x: 0, y: 0 },
          br: { x: 0, y: 0 },
        },
        measurement: [{
          type: GoalMeasurementType.UNKNOWN_MEASUREMENT,
          position: { x: 0, y: 0, z: 0 },
          covariance: { x: { x: 0, y: 0, z: 0 }, y: { x: 0, y: 0, z: 0 }, z: { x: 0, y: 0, z: 0 } },
          normalAngles: { x: 0, y: 0 },
          normAngCov: { x: { x: 0, y: 0 }, y: { x: 0, y: 0 } },
        }],
      })),
    }).finish()
    return { messageType, buffer }
  }
}
