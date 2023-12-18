const aws = require('aws-sdk');
const uuid = require('uuid');

aws.config.update({
    endpoint: 'http://localhost:4566',
    region: 'eu-west-2',
});

const eventBridge = new aws.EventBridge();

async function scheduleMessage(topicName, message, delayMinutes) {
    const topicArn = `arn:aws:sns:eu-west-2:000000000000:${topicName}`;
    const id = uuid.v4();

    await eventBridge.putRule({
        Name: id,
        ScheduleExpression: `rate(${delayMinutes} minute${delayMinutes > 1 ? 's' : ''})`,
        State: 'ENABLED'
    }).promise();

    await eventBridge.putTargets({
        Rule: id,
        Targets: [
            {
                Id: id,
                Arn: topicArn,
                Input: JSON.stringify({
                    id,
                    ...message
                })
            }
        ],
    }).promise();

    await eventBridge.putEvents({
        Entries: [
            {
                Source: id,
                DetailType: 'planner'
            }
        ],
    }).promise();
}

async function deleteEventBridgeRule(ruleName) {
    console.log('Deleting eb rule: ', ruleName);    
    await eventBridge.removeTargets({ Rule: ruleName, Ids: [ruleName] }).promise();
    await eventBridge.deleteRule({ Name: ruleName }).promise();
}

module.exports = { scheduleMessage, deleteEventBridgeRule }