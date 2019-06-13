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
    const parsedMessage = parseMessage(data.data);

    console.log(JSON.stringify(parsedMessage));

    const timestamp = parsedMessage.timestamp;
    const date = new Date(timestamp);

    const batch = firestore.batch();

    const rootDocRef = firestore.collection(COLLECTION_NAME).doc(timestamp);
    batch.set(rootDocRef, {
        timestamp: Firestore.Timestamp.fromDate(date)
    });

    // TODO: Refactor duplication

    const volumeId = parsedMessage.from_address_label + '__' + parsedMessage.to_address_label;
    const childDocRef = rootDocRef.collection('volume').doc(volumeId);
    batch.set(childDocRef, {
        from: parsedMessage.from_address_label,
        to: parsedMessage.to_address_label,
        amount: parsedMessage.volume
    });

    // latest

    const latestRootDocRef = firestore.collection(COLLECTION_NAME).doc('latest');
    batch.set(latestRootDocRef, {
        timestamp: Firestore.Timestamp.fromDate(date)
    });

    const latestChildDocRef = latestRootDocRef.collection('volume').doc(volumeId);
    batch.set(latestChildDocRef, {
        from: parsedMessage.from_address_label,
        to: parsedMessage.to_address_label,
        amount: parsedMessage.volume
    });

    // commit

    return batch.commit().then(doc => {
        console.info('stored new doc id#', timestamp + '_' + volumeId);
    }).catch(err => {
        console.error(err);
    });
};

// eventToBuild transforms pubsub event message to a build object.
const parseMessage = (data) => {
    return JSON.parse(new Buffer(data, 'base64').toString());
};

