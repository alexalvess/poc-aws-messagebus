const aws = require('aws-sdk');

aws.config.update({
    endpoint: 'http://localhost:4566',
    region: 'eu-west-2',
});

const sns = new aws.SNS();

function publishMessage(topicName, contentMessage) {
    const params = {
        TopicArn: `arn:aws:sns:eu-west-2:000000000000:${topicName}`,
        Message: JSON.stringify(contentMessage),
    };

    sns.publish(params, (err, data) => {
        if (err) {
            console.error('Error to publish in a topic:', err);
        } else {
            console.log('Message published:', data.MessageId);
        }
    });
}

module.exports = { publishMessage }