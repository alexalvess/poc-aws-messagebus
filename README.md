#### Some commands

* Create queues

```base
aws sqs create-queue --endpoint-url http://localhost:4566 --queue-name [YOUR_QUEUE_NAME] --profile localstack
```

* List queues

```bash
aws sqs list-queues --endpoint-url http://localhost:4566 --profile localstack
```

* Create topics

```bash
aws sns create-topic --endpoint-url http://localhost:4566 --name [YOUR_TOPIC] --profile localstack
```

* List topics

```bash
aws sns list-topics --profile localstack
```

---

### References

* https://dev.to/flflima/rodando-sqs-localmente-com-localstack-3nap
* https://docs.localstack.cloud/user-guide/aws/sqs/#:~:text=The%20LocalStack%20Web%20Application%20provides,under%20the%20App%20Integration%20section.