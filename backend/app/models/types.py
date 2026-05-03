import json

from sqlalchemy import Text
from sqlalchemy.types import TypeDecorator


class JsonList(TypeDecorator):
    """Stores a Python list as JSON text. Deserializes on read."""

    impl = Text
    cache_ok = True

    def process_bind_param(self, value, dialect):
        if value is None:
            return "[]"
        return json.dumps(value)

    def process_result_value(self, value, dialect):
        if not value:
            return []
        return json.loads(value)
