const aws = require('aws-sdk');

aws.config.update({
  endpoint: 'http://localhost:4566',
  region: 'eu-west-2',
});

const sqs = new aws.SQS();

function createQueue(queueName) {
  const params = {
    QueueName: queueName,
  };

  sqs.createQueue(params, (err, data) => {
    if (err) {
      console.error('Error to create queue:', err);
    } else {
      console.log('Queue created:', data.QueueUrl);
    }
  });
}

function getQueueAttributes(queueName) {
  const params = {
    QueueUrl: `http://sqs.eu-west-2.localhost.localstack.cloud:4566/000000000000/${queueName}`,
    AttributeNames: ['All'],
  };

  let attributes;

  sqs.getQueueAttributes(params, (err, data) => {
    if (err) {
      console.error('Error when try to get queue attrs:', err);
    } else {
      console.log('Queue attributes:', data.Attributes);
      attributes = data.Attributes;
    }
  });

  return attributes;
}

module.exports = { createQueue, getQueueAttributes }