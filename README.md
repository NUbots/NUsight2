> As of February 2021, NUsight2 has been merged into the [NUbots/NUbots](https://github.com/NUbots/NUbots) repository, in the [`nusight2`](https://github.com/NUbots/NUbots/tree/master/nusight2) folder.
> Future development work will be done there.

# NUsight

[![Build status](https://badge.buildkite.com/b1f06cd8fd82665a45fdd4be65c110b48e96a11dfeeaefc56c.svg)](https://buildkite.com/nubots/nusight2)
[![Dependencies Status](https://david-dm.org/NUbots/NUsight2/status.svg)](https://david-dm.org/NUbots/NUsight2)
[![Development Dependencies Status](https://david-dm.org/NUbots/NUsight2/dev-status.svg)](https://david-dm.org/NUbots/NUsight2?type=dev)


## Dependencies
- [Node](https://nodejs.org/en/download/)
- [Yarn](https://yarnpkg.com/en/docs/install)

## Installing
`yarn`

## Running
`yarn start`

## Developing (Virtual Robots)
`yarn dev`

## Developing without typechecking
`yarn dev -t`

## Developing Components
`yarn storybook`

## Testing
`yarn test`

## Configure the nuclearnet connection address
`yarn start --address 192.168.1.255`
`yarn prod --address 192.168.1.255`
