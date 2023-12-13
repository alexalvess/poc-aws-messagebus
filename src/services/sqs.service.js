const aws = require('aws-sdk');

aws.config.update({
    endpoint: 'http://localhost:4566',
    region: 'eu-west-2',
});

const sqs = new aws.SQS();

function sendMessageQueue(queueName, contentMessage) {
    const currentDate = new Date();
    const futureDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDay() + 2, 15, 0, 0)
    const diffDate = new Date(futureDate.getTime() - currentDate.getTime());

    const params = {
        DelaySeconds: diffDate.getSeconds(), // Delayed message
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

function consumeMessageQueue(queueName) {
    sqs.receiveMessage({
        MaxNumberOfMessages: 5,
        VisibilityTimeout: 20,
        WaitTimeSeconds: 0,
        AttributeNames: [
            "SentTimestamp"
        ],
        MessageAttributeNames: [
            "All"
        ],
        QueueUrl: `http://sqs.eu-west-2.localhost.localstack.cloud:4566/000000000000/${queueName}`
    }, (err, data) => {
        if (err) console.log('Receive error when try to consume', err);
        else {
            console.log(data.Messages);
        }
    });
}

module.exports = { sendMessageQueue, consumeMessageQueue }