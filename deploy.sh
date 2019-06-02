#!/usr/bin/env bash

gcp_project=test
stage_bucket=test
FUNCTION_RUNTIME=nodejs8
FUNCTION_TRIGGER_TOPIC=crypto_ethereum.analytics_demo


gcloud beta functions deploy pubsub-to-firestore --project ${gcp_project} --entry-point subscribe \
--runtime ${FUNCTION_RUNTIME} --stage-bucket gs://${stage_bucket} --trigger-topic ${FUNCTION_TRIGGER_TOPIC}