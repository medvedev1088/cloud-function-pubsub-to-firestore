const request = require('request');
const Buffer = require('safe-buffer').Buffer;
const NEW_DIRECT_MESSAGE_ENDPOINT = "https://api.twitter.com/1.1/direct_messages/events/new.json";

const formatAmount = (num) => {
    if (num) {
        return num.toLocaleString('en', {minimumFractionDigits: 2, maximumFractionDigits: 2});
    } else {
        return num;
    }
};

const formatEtherValue = (value) => {
    const adjustedValue = value / Math.pow(10, 18);
    const formattedValue = formatAmount(adjustedValue);
    return formattedValue;
};

// subscribe is the main function called by Cloud Functions.
module.exports.subscribe = async (data, context, callback) => {
    const parsedMessage = parseMessage(data.data);

    console.log(JSON.stringify(parsedMessage));

    const message_text = `A new Ethereum transaction of ${formatEtherValue(parsedMessage.transaction.value)} ETH: 
https://etherscan.io/tx/${parsedMessage.transaction.hash}. The ${parsedMessage.percentile}th percentile 
for the past ${parsedMessage.percentile_period_days} days was ${formatEtherValue(parsedMessage.percentile_value)} ETH`;
    const message = {
        "event": {
            "type": "message_create",
            "message_create": {
                "target": {
                    "recipient_id": 6186992
                },
                "message_data": {
                    "text": message_text,
                }
            }
        }
    };
    request({
        url: NEW_DIRECT_MESSAGE_ENDPOINT,
        oauth: {
            consumer_key: process.env.APP_KEY,
            consumer_secret: process.env.APP_SECRET,
            token: process.env.TOKEN,
            token_secret: process.env.TOKEN_SECRET
        },
        method: "POST",
        json: message
    })
        .on("response", function (resp) {
            if (resp.statusCode > 299) {
                console.log("Failed to send list message, status code " + resp.statusCode);
                var body = '';
                resp.on('data', function (chunk) {
                    body += chunk;
                });
                resp.on('end', function () {
                    console.log('BODY: ' + body);
                    callback();
                });
            } else {
                callback();
            }

        })
        .on("error", function (err) {
            console.log("Failed to send list message: " + err);
            callback();
        });
};

// eventToBuild transforms pubsub event message to a build object.
const parseMessage = (data) => {
    return JSON.parse(new Buffer(data, 'base64').toString());
};

