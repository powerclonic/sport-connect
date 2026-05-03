from flask import Blueprint, jsonify

api_bp = Blueprint("api", __name__)


@api_bp.get("/health")
def health() -> tuple[dict[str, str], int]:
    return jsonify({"status": "ok", "service": "sportconnect-api"}), 200


@api_bp.get("/bootstrap")
def bootstrap() -> tuple[dict[str, object], int]:
    return jsonify(
        {
            "brand": "SportConnect",
            "locales": ["en", "pt-BR"],
            "theme": "sportLight",
            "services": {"cache": "redis", "database": "mysql"},
        }
    ), 200