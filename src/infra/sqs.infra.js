const aws = require('aws-sdk');

aws.config.update({
  endpoint: 'http://localhost:4566',
  region: 'eu-west-2',
});

const sqs = new aws.SQS();

function createQueue(queueName) {
  sqs.createQueue({
      QueueName: queueName
    }, (err, data) => {
    if (err) {
      console.error('Error to create queue:', err);
    } else {
      createDlqQueue(queueName);
      console.log('Queue created:', data.QueueUrl);
    }
  });
}

function createDlqQueue(queueName) {
  sqs.createQueue({
    QueueName: `${queueName}-dlq`
  }, (err, data) => {
  if (err) {
    console.error('Error to create queue:', err);
  } else {
    console.log('Queue created:', data.QueueUrl);
  }
});
}

module.exports = { createQueue }