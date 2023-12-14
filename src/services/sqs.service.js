const aws = require('aws-sdk');
const { Consumer } = require('sqs-consumer');

aws.config.update({
    endpoint: 'http://localhost:4566',
    region: 'eu-west-2',
});

const sqs = new aws.SQS();

function sendMessageQueue(queueName, contentMessage, sendParams) {
    const params = {
        MessageBody: contentMessage,
        MessageAttributes: {
            'RetryCount': {
                DataType: 'Number',
                StringValue: '0'
            }
        },
        QueueUrl: `http://sqs.eu-west-2.localhost.localstack.cloud:4566/000000000000/${queueName}`,
        ...sendParams
    };

    sqs.sendMessage(params, (err, data) => {
        if (err) {
            console.log(err);
        } else {
            console.log(`Sent SQS message to ${queueName}: `, data.MessageId);
        }
    });
}

function consumeMessages(queueName) {
    const consumer = Consumer.create({
        messageAttributeNames: [ 'All' ],
        queueUrl: `http://sqs.eu-west-2.localhost.localstack.cloud:4566/000000000000/${queueName}`,
        handleMessage: async message => {
            try {
                console.log(`Message consumed from ${queueName}`, message.Body);
                throw new Error('Proposital error');
            } catch (error) {
                console.log('Error processing message: ', error.message);
                executeSecondLevelResilience(queueName, message, 3);
            }
        },
        sqs: sqs,
        batchSize: 10
    });

    consumer.on('error', error => {
        console.log(`Error consuming message`, error);
    });

    consumer.start();
}

function executeSecondLevelResilience(queueName, message, maxRetryCount) {
    let retryCount = message.MessageAttributes && parseInt(message.MessageAttributes['RetryCount'].StringValue);
    
    if (retryCount <= maxRetryCount) {
        console.log(`Retry count: ${retryCount}`);
        sendMessageQueue(queueName, message.Body, {
            DelaySeconds: 5,
            MessageAttributes: {
                'RetryCount': {
                    DataType: 'Number',
                    StringValue: (retryCount + 1).toString()
                }
            }
        });
    } else {
        sendMessageQueue(`${queueName}-dlq`, message.Body, {
            MessageAttributes: {
                'RetryCount': {
                    DataType: 'Number',
                    StringValue: maxRetryCount.toString()
                }
            }
        });
    }
}

module.exports = { sendMessageQueue, consumeMessages }