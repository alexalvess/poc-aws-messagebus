const aws = require('aws-sdk');

const sns = new aws.SNS({
    endpoint: new aws.Endpoint('http://localhost:9911'),
    accessKeyId: 'na',
    secretAccessKey: 'na',
    region: 'eu-west-2'
});

const params = {
    TopicArn: 'arn:aws:sns:eu-west-2:123450000001:test-topic',
    Message: 'Hello SNS!',
};

sns.publish(params, (err, data) => {
    if (err) {
        console.error('Erro ao publicar mensagem no tópico:', err.message);
    } else {
        console.log('Mensagem publicada com sucesso:', data.MessageId);
    }
});