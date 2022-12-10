#!/usr/bin/env node
const LaunchDarkly = require("launchdarkly-node-server-sdk");
const { uniqueNamesGenerator, names } = require("unique-names-generator");

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const sdkKey = process.env.LAUNCHDARKLY_SDK_KEY;

// what custom conversion metric to track
const metricKey = process.env.METRIC_KEY;

// the boolean feature flag to evaluate
const featureFlagKey = process.env.FLAG_KEY;

// times to evaluate the flag
const times = process.env.TIMES;

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

const ldClient = LaunchDarkly.init(sdkKey);

ldClient
  .waitForInitialization()
  .then(function () {
    showMessage("SDK successfully initialized!");
    for (var i = 0; i < times; i++) {
      const context = getContext();
      showMessage("Random user: " + context.name);

      ldClient.variation(
        featureFlagKey,
        context,
        false,
        function (err, flagValue) {
          showMessage(
            "Feature flag '" +
              featureFlagKey +
              "' is " +
              flagValue +
              " for this context"
          );
          // if the flag returns true we send a track event
          if (flagValue) ldClient.track(metricKey, context);
        }
      );
    }
    ldClient.flush(function () {
      ldClient.close();
    });
  })
  .catch(function (error) {
    showMessage("SDK failed to initialize: " + error);
    process.exit(1);
  });

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
