<!--
title: Google Assistant Platform / Smooch (Alpha)
description: Google Cloud Function that implements a simple Google Actions Integration for Smooch
layout: Doc
-->

# Smooch on Google Assistant Platform

This sample code shows how to connect Smooch to the Google Assistant Platform (Google Home, Assistant App, and much more). It allows Google Assistant users to send plain-text messages as Smooch appUser messages. It also provides subsequent appMaker messages as responses, if they are received within Google Assistant's response window.

## Use-cases

- Deploying chat bots to Google Assistant
- Creating multi-channel chat experiences that are initiated via Google Assistant voice commands.

## Setup

### Deploying to Google Cloud Functions

_In order to use this example you must have serverless on your machine, follow the instructions [here](https://github.com/serverless/serverless) to install it. If this is your first time using serverless, you will also need to [configure credentials for GCF](https://serverless.com/framework/docs/providers/google/guide/credentials/) on your local machine._

To install this skill on your machine, run:

```bash
serverless install -u https://github.com/smooch/smooch-google-actions -n smooch-google-actions
cd smooch-google-actions
npm install
```

In _index.js_ replace the sample Smooch app secret key pair with your own, like so:


In order to deploy the endpoint, run:

```bash
serverless deploy
```

The expected result should be similar to:

```bash
Serverless: Packaging service...
Serverless: Excluding development dependencies...
Serverless: Compiling function "first"...
Serverless: Uploading artifacts...
Serverless: Artifacts successfully uploaded...
Serverless: Updating deployment...
Serverless: Checking deployment update progress...
..........
Serverless: Done...
Service Information
service: smooch-gap-service
project: smooch-gap
stage: dev
region: us-central1

Deployed functions
first
   https://us-central1-smooch-gap.cloudfunctions.net/http
```

### Configuring the Google Action

Next we need to setup a Google Action. Create your action using the [console](https://console.actions.google.com).

When you've completed the setup, edit action.json to fill in YOUR_PROJECT_NAME and YOUR_ENDPOINT with the project name you've configured in the actions console as well as the endpoint to which you deployed the cloud function from the last step.

Once you've made the modifications, upload it to the server with:

```bash
$ gactions test --project YOUR_PROJECT_NAME --action_package action.json
Pushing the app for the Assistant for testing...
Your app for the Assistant for project YOUR_PROJECT_NAME is now ready for testing on Actions on Google enabled devices or the Actions Web Simulator at https://console.actions.google.com/project/YOUR_PROJECT_NAME/simulator/
```

## Test

You're now ready to test the integration using any of your connected Google Assistant devices on your account or the testing simulator built into the Actions console.
