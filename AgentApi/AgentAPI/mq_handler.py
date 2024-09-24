# flake8: noqa
import pika
import json
from typing import Callable

class MQHandler:
    def __init__(self, host: str = 'localhost'):
        self.connection = pika.BlockingConnection(pika.ConnectionParameters(host))

    def create_channel(self, queue_name: str, callback: Callable):
        channel = self.connection.channel()
        channel.queue_declare(queue=queue_name)
        channel.basic_consume(
            queue=queue_name,
            on_message_callback=callback,
            auto_ack=True
        )
        return channel

    def start_consuming(self, channel):
        channel.start_consuming()

    def close(self):
        self.connection.close()

# 创建一个全局的MQHandler实例
mq_handler = MQHandler()