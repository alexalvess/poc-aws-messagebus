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
    await snsInfra.subscribeSnsTopicInQueue(increaseInventoryTopicName, increaseInventoryQueueName);
    await snsInfra.subscribeSnsTopicInQueue(increaseInventoryTopicName, updateInventoryStatusQueueName);
}

async function throwMessages() {
    const currentDate = new Date();
    const futureDate = new Date(currentDate.getTime() + 60 * 1000);

    // Schedule a message
    eventBridgeService.scheduleMessage(increaseInventoryTopicName, {message: '=== EVENT BRIDGE ==='}, currentDate, futureDate);
    eventBridgeService.scheduleMessage(increaseInventoryTopicName, {message: '=== EVENT BRIDGE ==='}, currentDate, futureDate);

    // Send directly message to a queue
    sqsService.sendMessageQueue(warehouseDelayedQueueName, {message: '=== SQS DIRECT! ===' }, {});

    // Just one publishing to broadcast the message to all consumers
    snsService.publishMessage(increaseInventoryTopicName, {message: '=== SNS BROADCAST! ==='} );
}

function consumeMessages() {
    // Each service can consume specific queues
    sqsService.consumeMessages(warehouseDelayedQueueName);

    sqsService.consumeMessages(increaseInventoryQueueName, (message) => console.log(message));
    sqsService.consumeMessages(updateInventoryStatusQueueName);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}