#!/usr/bin/env bash

gcp_project=crypto-etl-ethereum-dev
stage_bucket=crypto-etl-ethereum-dev-dataflow-temp
FUNCTION_RUNTIME=nodejs8
FUNCTION_TRIGGER_TOPIC=crypto_ethereum.large_transactions


gcloud beta functions deploy pubsub-to-twitter --project ${gcp_project} --entry-point subscribe \
--runtime ${FUNCTION_RUNTIME} --stage-bucket gs://${stage_bucket} --trigger-topic ${FUNCTION_TRIGGER_TOPIC}