const aws = require('aws-sdk');

aws.config.update({
    endpoint: 'http://localhost:4566',
    region: 'eu-west-2',
});

const eventBridge = new aws.EventBridge();

function scheduleMessage(topicName, message, delayMinutes) {
    const topicArn = `arn:aws:sns:eu-west-2:000000000000:${topicName}`;

    eventBridge.putEvents({
        Entries: [
            {
                Source: 'custom.source',
                DetailType: 'custom.detailType',
                Detail: JSON.stringify({ data: 'TESTE 12345' }),
                EventBusName: 'default'
            }
        ]
    }, (error, data) => {
        if(error) {
            console.log('Error scheduling event', error);
            return;
        }

        console.log('Event published');

        eventBridge.putRule({
            Name: 'schedule_rule',
            EventPattern: JSON.stringify({
                source: ['custom.source'],
                detailType: ['custom.detailType'],
            }),
            
            ScheduleExpression: `rate(${delayMinutes} minute)`,
            State: 'ENABLED',
        }, (ruleError, ruleData) => {
            if(ruleError) {
                console.log('Error creating rule', ruleError);
                return;
            }

            console.log('Rule created');

            eventBridge.putTargets({
                Rule: 'schedule_rule',
                Targets: [
                    {
                        Arn: topicArn,
                        Id: '1'
                    }
                ]
            }, (targetError, targetData) => {
                if(targetError) {
                    console.log('Error linking target', targetError);
                    return;
                }

                console.log('Target linked');
            });
        });
    });
}

async function deleteEventBridgeRule(ruleName) {
    await eventBridge.removeTargets({ Rule: ruleName }).promise();
    await eventBridge.deleteRule({ Name: ruleName }).promise();
}

module.exports = { scheduleMessage, deleteEventBridgeRule }