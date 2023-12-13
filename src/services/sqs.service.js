const aws = require('aws-sdk');

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
            console.log('Message consumed', data.Messages);

            sqs.deleteMessage({
                QueueUrl: `http://sqs.eu-west-2.localhost.localstack.cloud:4566/000000000000/${queueName}`,
                ReceiptHandle: data.Messages[0].ReceiptHandle
            }, (err, _) => {
                if(err) console.log('Error when purge message');
                else console.log('Message deleted');
            })
        }
    });
}

module.exports = { sendMessageQueue, consumeMessageQueue }