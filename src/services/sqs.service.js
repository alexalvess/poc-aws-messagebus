const aws = require('aws-sdk');
const { Consumer } = require('sqs-consumer');
const eventBridgeService = require('./eventBridge.service');

aws.config.update({
    endpoint: 'http://localhost:4566',
    region: 'eu-west-2',
});

const sqs = new aws.SQS();

function sendMessageQueue(queueName, contentMessage, sendParams) {
    const params = {
        MessageBody: JSON.stringify(contentMessage),
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
            console.log('\x1b[33m%s\x1b[0m', `Sent SQS message to ${queueName}: `, data.MessageId);
        }
    });
}

async function consumeMessages(queueName) {
    const consumer = Consumer.create({
        messageAttributeNames: [ 'All' ],
        queueUrl: `http://sqs.eu-west-2.localhost.localstack.cloud:4566/000000000000/${queueName}`,
        handleMessage: async message => {
            try {
                const body = JSON.parse(message.Body);

                if(body.Message) {
                    const messageContent = JSON.parse(body.Message);
                    if(messageContent.scheduleId){
                        console.info('\x1b[36m%s\x1b[0m', `Message consumed from ${queueName}`, messageContent.scheduleId);
                        await eventBridgeService.deleteEventBridgeRule(queueName, messageContent.scheduleId);
                    }
                    else {
                        console.info('\x1b[36m%s\x1b[0m', `Message consumed from ${queueName}`, message.MessageId);
                    }
                }
            } catch (error) {
                console.log('\x1b[31m%s\x1b[0m', `Error processing message from ${queueName}:`, error.message);
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