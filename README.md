# custom-event-runner

This is not a general purpose script. This event runner is used to send track events for a simple AB style experiment.

## Installing

Download the [macOS Installer](https://nodejs.org/en/#home-downloadhead) from the [nodejs.org](https://nodejs.org/) web site and install the package.

You can run `node -v` to verify the installation.

## Running

Create a `.env` file form the `.env/example` file and update the variables with the SDK key, the flag and metric keys and the number of events to send.

From the command-line run:

```
node ./bin/index.js
```




