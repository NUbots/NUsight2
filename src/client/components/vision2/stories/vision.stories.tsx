import { storiesOf } from '@storybook/react'
import React from 'react'
import { Matrix4 } from '../../../math/matrix4'
import { AppController } from '../../app/controller'
import { AppModel } from '../../app/model'
import { withRobotSelectorMenuBar } from '../../menu_bar/view'
import { RobotModel } from '../../robot/model'
import { fullscreen } from '../../storybook/fullscreen'
import { Projection } from '../camera/model'
import { Lens } from '../camera/model'
import { CameraParams } from '../camera/model'
import { CameraModel } from '../camera/model'
import { CameraViewProps } from '../camera/view'
import { VisionController } from '../controller'
import { ImageFormat } from '../image'
import { VisionModel } from '../model'
import { VisionView } from '../view'

storiesOf('components.vision2.layout', module)
  .addDecorator(fullscreen)
  .add('renders', () => {
    const appModel = AppModel.of({
      robots: [
        RobotModel.of({
          id: '1',
          name: 'Robot #1',
          enabled: true,
          connected: true,
          address: '127.0.0.1',
          port: 1,
        }),
        RobotModel.of({
          id: '2',
          name: 'Robot #2',
          enabled: true,
          connected: true,
          address: '127.0.0.2',
          port: 2,
        }),
        RobotModel.of({
          id: '3',
          name: 'Robot #3',
          enabled: true,
          connected: true,
          address: '127.0.0.3',
          port: 3,
        }),
        RobotModel.of({
          id: '4',
          name: 'Robot #4',
          enabled: true,
          connected: true,
          address: '127.0.0.4',
          port: 4,
        }),
      ],
    })
    const model = VisionModel.of(appModel)
    model.visionRobots.forEach(robot => {
      robot.cameras.set(
        1,
        CameraModel.of({
          id: 1,
          name: 'Camera #1',
          image: {
            type: 'element',
            width: 320,
            height: 240,
            element: {} as HTMLImageElement,
            format: ImageFormat.JPEG,
          },
          params: new CameraParams({
            Hcw: Matrix4.of(),
            lens: new Lens({ projection: Projection.RECTILINEAR, focalLength: 1 }),
          }),
        }),
      )
      robot.cameras.set(
        2,
        CameraModel.of({
          id: 2,
          name: 'Camera #2',
          image: {
            type: 'element',
            width: 320,
            height: 240,
            element: {} as HTMLImageElement,
            format: ImageFormat.JPEG,
          },
          params: new CameraParams({
            Hcw: Matrix4.of(),
            lens: new Lens({ projection: Projection.RECTILINEAR, focalLength: 1 }),
          }),
        }),
      )
    })
    const appController = AppController.of()
    const Menu = withRobotSelectorMenuBar(appModel.robots, appController.toggleRobotEnabled)
    const CameraView = (props: CameraViewProps) => (
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          color: 'white',
          backgroundColor: 'black',
          border: '1px dashed white',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          fontSize: '200%',
          boxSizing: 'border-box',
        }}
      >
        {props.model.name}
      </div>
    )
    const controller = VisionController.of()
    return (
      <VisionView
        controller={controller}
        model={model}
        Menu={Menu}
        CameraView={CameraView}
      />
    )
  })
