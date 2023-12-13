const sqsInfra = require('./infra/sqs.infra');
const sqsService = require('./services/sqs.service');

const snsInfra = require('./infra/sns.infra');
const snsService = require('./services/sns.service');

// For first time
const warehouseDelayedQueueName = 'warehouse-delayed-queue';
const increaseInventoryQueueName = 'increase-inventory-queue';
const updateInventoryStatusQueueName = 'update-inventory-status-queue';

const increaseInventoryTopicName = 'increase-inventory-topic';

sqsInfra.createQueue(warehouseDelayedQueueName);
sqsInfra.createQueue(increaseInventoryQueueName);
sqsInfra.createQueue(updateInventoryStatusQueueName);

snsInfra.createSnsTopic(increaseInventoryTopicName);

snsInfra.subscribeSnsTopicInQueue({
    topicName: increaseInventoryTopicName,
    queueName: increaseInventoryQueueName
});
snsInfra.subscribeSnsTopicInQueue({
    topicName: increaseInventoryTopicName,
    queueName: updateInventoryStatusQueueName
});

// Send directly message to a queue
sqsService.sendMessageQueue(warehouseDelayedQueueName, 'SQS DIRECT MESSAGE!');

// Just one publishing to broadcast the message to all consumers
snsService.publishMessage(increaseInventoryTopicName, 'SNS BROADCAST MESSAGE!');

// Each service can consume specific queues
sqsService.consumeMessageQueue(warehouseDelayedQueueName);

sqsService.consumeMessageQueue(increaseInventoryQueueName);
sqsService.consumeMessageQueue(updateInventoryStatusQueueName);