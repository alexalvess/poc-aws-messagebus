const sqsInfra = require('./infra/sqs.infra');
const sqsService = require('./services/sqs.service');

const snsInfra = require('./infra/sns.infra');
const snsService = require('./services/sns.service');
const eventBridgeService = require('./services/eventBridge.service');

const warehouseDelayedQueueName = 'warehouse-delayed-queue';
const increaseInventoryQueueName = 'increase-inventory-queue';
const updateInventoryStatusQueueName = 'update-inventory-status-queue';

const increaseInventoryTopicName = 'increase-inventory-topic';

execute();

async function execute() {
    await createQueuesAndTopics();
    await subscribeTopicsInQueues();
    await throwMessages();
    consumeMessages();
}

async function createQueuesAndTopics() {
    sqsInfra.createQueue(warehouseDelayedQueueName);
    sqsInfra.createQueue(increaseInventoryQueueName);
    sqsInfra.createQueue(updateInventoryStatusQueueName);

    snsInfra.createSnsTopic(increaseInventoryTopicName);

    await sleep(500);
}

async function subscribeTopicsInQueues() {
    snsInfra.subscribeSnsTopicInQueue(increaseInventoryTopicName, increaseInventoryQueueName);
    snsInfra.subscribeSnsTopicInQueue(increaseInventoryTopicName, updateInventoryStatusQueueName);

    await sleep(500);
}

async function throwMessages() {
    // Schedule a message
    await eventBridgeService.scheduleMessage(increaseInventoryTopicName, {message: '111=== EVENT BRIDGE ==='}, 1);
    await eventBridgeService.scheduleMessage(increaseInventoryTopicName, {message: '444=== EVENT BRIDGE ==='}, 2);
    await eventBridgeService.scheduleMessage(increaseInventoryTopicName, {message: '555=== EVENT BRIDGE ==='}, 1);

    // Send directly message to a queue
    sqsService.sendMessageQueue(warehouseDelayedQueueName, {message: '222=== SQS DIRECT! ===' }, {});

    // Just one publishing to broadcast the message to all consumers
    snsService.publishMessage(increaseInventoryTopicName, {message: '333=== SNS BROADCAST! ==='} );

    await sleep(500);
}

function consumeMessages() {
    // Each service can consume specific queues
    const consumer1 = sqsService.consumeMessages(warehouseDelayedQueueName);

    const consumer2 = sqsService.consumeMessages(increaseInventoryQueueName);
    const consumer3 = sqsService.consumeMessages(updateInventoryStatusQueueName);

    Promise.all([consumer1, consumer2, consumer3]);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}