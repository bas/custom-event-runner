#!/usr/bin/env node
const LaunchDarkly = require("launchdarkly-node-server-sdk");
const { uniqueNamesGenerator, names } = require("unique-names-generator");

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const sdkKey = process.env.LAUNCHDARKLY_SDK_KEY;

// what custom conversion metrics to track
const primaryMetric = process.env.PRIMARY_METRIC_KEY;
const secondaryMetric = process.env.SECONDARY_METRIC_KEY;

// the boolean feature flag to evaluate
const featureFlagKey = process.env.FLAG_KEY;

// times to evaluate the flag
const times = process.env.TIMES;

const results = {
  primaryMetric: 0,
  secondaryMetric: 0,
};

function showMessage(s) {
  console.log("*** " + s);
  console.log("");
}

if (sdkKey == "") {
  showMessage(
    "Please edit index.js to set sdkKey to your LaunchDarkly SDK key first"
  );
  process.exit(1);
}

const options = {
  logger: LaunchDarkly.basicLogger({
    level: "debug",
    destination: console.log,
  }),
};

const ldClient = LaunchDarkly.init(sdkKey, options);

const main = async () => {
  try {
    await ldClient.waitForInitialization();
    for (var i = 0; i < times; i++) {
      const context = getContext();
      const flagValue = await ldClient.variation(
        featureFlagKey,
        context,
        false
      );
      if (flagValue) {
        if (Math.random() < 0.6) ldClient.track(primaryMetric, context);
      } else {
        if (Math.random() < 0.5) ldClient.track(primaryMetric, context);
      }
    }

    ldClient.flush(() => {
      ldClient.close();
    });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

function getContext() {
  let randomName = uniqueNamesGenerator({
    dictionaries: [names],
  });

  const email = randomName.toLowerCase() + "@example.com";

  let userContext = {
    kind: "user",
    key: email,
    email: email,
    name: randomName,
  };
  return userContext;
}

main();
