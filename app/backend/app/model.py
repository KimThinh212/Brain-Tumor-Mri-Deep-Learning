import json
import tensorflow as tf
from tensorflow.keras.layers import Dense

from app.config import MODEL_PATH, CLASS_INDICES_PATH


_original_dense_from_config = Dense.from_config


@classmethod
def fixed_dense_from_config(cls, config):
    config.pop("quantization_config", None)
    return _original_dense_from_config(config)


Dense.from_config = fixed_dense_from_config


def load_model():
    if not MODEL_PATH.exists():
        raise FileNotFoundError(f"Không tìm thấy model: {MODEL_PATH}")

    model = tf.keras.models.load_model(
        MODEL_PATH,
        compile=False
    )

    return model


def load_class_names():
    if not CLASS_INDICES_PATH.exists():
        raise FileNotFoundError(
            f"Không tìm thấy class_indices.json: {CLASS_INDICES_PATH}"
        )

    with open(CLASS_INDICES_PATH, "r", encoding="utf-8") as f:
        class_indices = json.load(f)

    index_to_class = {
        int(index): class_name
        for class_name, index in class_indices.items()
    }

    class_names = [
        index_to_class[i]
        for i in range(len(index_to_class))
    ]

    return class_names