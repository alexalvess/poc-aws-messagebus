const aws = require('aws-sdk');

aws.config.update({
  endpoint: 'http://localhost:4566',
  region: 'eu-west-2',
});

const sqs = new aws.SQS();

async function createQueue(queueName) {
  try {
    await sqs.createQueue({ QueueName: queueName }).promise();
    await sqs.createQueue({ QueueName: queueName + '-dlq' }).promise();
    console.log('Queues created from:', queueName);
  } catch (error) {
    console.error('Error to create queue:', error.message);
  }
}

module.exports = { createQueue }