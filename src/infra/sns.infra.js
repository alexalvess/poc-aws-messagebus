const aws = require('aws-sdk');
const sqsInfra = require('./sqs.infra');

aws.config.update({
    endpoint: 'http://localhost:4566',
    region: 'eu-west-2',
});

const sns = new aws.SNS();

function createSnsTopic(topicName) {
    const params = {
        Name: topicName,
    };

    sns.createTopic(params, (err, data) => {
        if (err) {
            console.error('Erro when try to create a topic:', err);
        } else {
            console.log('Topic created successfully:', data.TopicArn);
        }
    });
}

function subscribeSnsTopicInQueue(topicName, queueName) {
    const params = {
        Protocol: 'sqs',
        TopicArn: `arn:aws:sns:eu-west-2:000000000000:${topicName}`,
        Endpoint: `arn:aws:sqs:eu-west-2:000000000000:${queueName}`,
    };

    sns.subscribe(params, (err, data) => {
        if (err) {
            console.error('Error to create a subscriber:', err);
        } else {
            console.log('Subscriber created:', data.SubscriptionArn);
        }
    });
}



module.exports = { createSnsTopic, subscribeSnsTopicInQueue };