const Firestore = require('@google-cloud/firestore');

const PROJECTID = 'test';
const COLLECTION_NAME = 'demo';

const firestore = new Firestore({
    projectId: PROJECTID,
    timestampsInSnapshots: true
    // NOTE don't hardcode your project credentials here.
    // If you have to, export the following to your shell:
    //   GOOGLE_APPLICATION_CREDENTIALS=<path>
    // keyFilename: '/cred/cloud-functions-firestore-000000000000.json',
});

// subscribe is the main function called by Cloud Functions.
module.exports.subscribe = async (data, context) => {
    const pubSubMessage = data;
    const parsedMessage = parseMessage(pubSubMessage.data);

    console.log(JSON.stringify(parsedMessage));

    const timestamp = parsedMessage.timestamp;
    const volumeId = parsedMessage.from_address_label + '__' + parsedMessage.to_address_label;

    return firestore.collection(COLLECTION_NAME).doc(timestamp)
        .collection('volume').doc(volumeId).set({
        from: parsedMessage.from_address_label,
        to: parsedMessage.to_address_label,
        amount: parsedMessage.volume
    }).then(doc => {
        console.info('stored new doc id#', timestamp + '_' + volumeId);
    }).catch(err => {
        console.error(err);
    });
};

// eventToBuild transforms pubsub event message to a build object.
const parseMessage = (data) => {
    return JSON.parse(new Buffer(data, 'base64').toString());
};

