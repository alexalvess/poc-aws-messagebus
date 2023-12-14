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

async function consumeMessages(queueName) {
    while(true) {
        try {
            const params = {
                MaxNumberOfMessages: 10,
                VisibilityTimeout: 300,
                WaitTimeSeconds: 5,
                AttributeNames: [
                    "All"
                ],
                MessageAttributeNames: [
                    "All"
                ],
                QueueUrl: `http://sqs.eu-west-2.localhost.localstack.cloud:4566/000000000000/${queueName}`
            };

            const response = await sqs.receiveMessage(params).promise();

            if(response.Messages.length > 0) {
                await proccessMessageBatch(response.Messages, queueName);
            } else {
                await waitUntilMessagesArrive(10);
                console.log(`No messages received at ${queueName}, waiting...`);
            }
        } catch (error) {
            console.log(`Error receiving messages`, error);
        }
    }
}

async function proccessMessageBatch(messages, queueName) {
    for (const message of messages) {
        try {
            console.log(`Message consumed from`, message);
            await sqs.deleteMessage({
                QueueUrl: `http://sqs.eu-west-2.localhost.localstack.cloud:4566/000000000000/${queueName}`,
                ReceiptHandle: message.ReceiptHandle
            }).promise();
            console.log(`Message deleted from ${queueName}`);
        } catch (error) {
            console.log(`Error processing message`, error);
        }
    }
}

async function waitUntilMessagesArrive(pollingInterval) {
    await new Promise((resolve) => setTimeout(resolve, pollingInterval));
    return true;
}

module.exports = { sendMessageQueue, consumeMessages }