const aws = require('aws-sdk');
const { Consumer } = require('sqs-consumer');

aws.config.update({
    endpoint: 'http://localhost:4566',
    region: 'eu-west-2',
});

const sqs = new aws.SQS();

function sendMessageQueue(queueName, contentMessage) {
    const params = {
        DelaySeconds: 20,
        MessageBody: contentMessage,
        QueueUrl: `http://sqs.eu-west-2.localhost.localstack.cloud:4566/000000000000/${queueName}`
    };

    sqs.sendMessage(params, (err, data) => {
        if (err) {
            console.log(err);
        } else {
            console.log('Sent SQS message: ', data.MessageId);
        }
    });
}

function consumeMessages(queueName) {
    const consumer = Consumer.create({
        queueUrl: `http://sqs.eu-west-2.localhost.localstack.cloud:4566/000000000000/${queueName}`,
        handleMessage: async message => {
            console.log(`Message consumed from ${queueName}`, message);
        },
        sqs: sqs,
        batchSize: 10
    });

    consumer.on('error', error => {
        console.log(`Error consuming message`, error);
    });

    consumer.start();
}

module.exports = { sendMessageQueue, consumeMessages }