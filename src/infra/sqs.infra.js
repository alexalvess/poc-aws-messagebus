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

module.exports = { createQueue }