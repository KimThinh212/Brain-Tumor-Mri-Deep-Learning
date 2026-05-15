# ============================================================
# STREAMLIT APP - BRAIN TUMOR MRI CLASSIFICATION
# ============================================================

from pathlib import Path
import json

import numpy as np
import streamlit as st
import tensorflow as tf
from PIL import Image
from tensorflow.keras.layers import Dense


# ============================================================
# 1. PAGE CONFIG - MUST BE FIRST STREAMLIT COMMAND
# ============================================================

st.set_page_config(
    page_title="Brain Tumor MRI Classification",
    page_icon="🧠",
    layout="wide"
)


# ============================================================
# 2. FIX KERAS MODEL LOADING COMPATIBILITY
# ============================================================

_original_dense_from_config = Dense.from_config


@classmethod
def fixed_dense_from_config(cls, config):
    config.pop("quantization_config", None)
    return _original_dense_from_config(config)


Dense.from_config = fixed_dense_from_config


# ============================================================
# 3. PATH CONFIG
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parent.parent

MODEL_PATH = (
    PROJECT_ROOT
    / "models"
    / "baseline_models"
    / "baseline_cnn_best.keras"
)

CLASS_INDICES_PATH = (
    PROJECT_ROOT
    / "reports"
    / "baseline_model"
    / "class_indices.json"
)

IMG_SIZE = (224, 224)


# ============================================================
# 4. LOAD MODEL AND CLASS NAMES
# ============================================================

@st.cache_resource
def load_trained_model(model_path):
    model = tf.keras.models.load_model(
        model_path,
        compile=False
    )
    return model


@st.cache_data
def load_class_names(class_indices_path):
    with open(class_indices_path, "r", encoding="utf-8") as f:
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


# ============================================================
# 5. IMAGE PREPROCESSING
# ============================================================

def preprocess_image(image):
    image = image.convert("RGB")
    image = image.resize(IMG_SIZE)

    image_array = np.array(image).astype("float32")
    image_array = image_array / 255.0

    image_array = np.expand_dims(image_array, axis=0)

    return image_array


# ============================================================
# 6. PREDICTION FUNCTION
# ============================================================

def predict_image(model, image, class_names):
    processed_image = preprocess_image(image)

    probabilities = model.predict(
        processed_image,
        verbose=0
    )[0]

    predicted_index = int(np.argmax(probabilities))
    predicted_class = class_names[predicted_index]
    confidence = float(probabilities[predicted_index])

    return predicted_class, confidence, probabilities


# ============================================================
# 7. CHECK REQUIRED FILES
# ============================================================

def check_required_files():
    if not MODEL_PATH.exists():
        st.error("Không tìm thấy file model.")
        st.code(str(MODEL_PATH))
        st.stop()

    if not CLASS_INDICES_PATH.exists():
        st.error("Không tìm thấy file class_indices.json.")
        st.code(str(CLASS_INDICES_PATH))
        st.stop()


# ============================================================
# 8. MAIN APP
# ============================================================

def main():

    st.title("🧠 Brain Tumor MRI Classification")

    st.write(
        """
        Ứng dụng dự đoán loại khối u não từ ảnh MRI bằng mô hình Deep Learning.
        """
    )

    st.warning(
        """
        ⚠️ Ứng dụng này chỉ phục vụ mục đích học tập và nghiên cứu.
        Không sử dụng để thay thế chẩn đoán y khoa.
        """
    )

    check_required_files()

    try:
        model = load_trained_model(MODEL_PATH)
        class_names = load_class_names(CLASS_INDICES_PATH)

    except Exception as e:
        st.error("Lỗi khi load model hoặc class indices.")
        st.exception(e)
        st.stop()

    st.sidebar.header("⚙️ Model Information")

    st.sidebar.write("Model path:")
    st.sidebar.code(str(MODEL_PATH))

    st.sidebar.write("Class indices path:")
    st.sidebar.code(str(CLASS_INDICES_PATH))

    st.sidebar.write(f"Image size: `{IMG_SIZE}`")

    st.sidebar.write("Classes:")
    for class_name in class_names:
        st.sidebar.write(f"- {class_name}")

    uploaded_file = st.file_uploader(
        "Upload MRI image",
        type=["jpg", "jpeg", "png", "bmp", "webp"]
    )

    if uploaded_file is not None:

        image = Image.open(uploaded_file)

        col1, col2 = st.columns(2)

        with col1:
            st.subheader("Uploaded MRI Image")
            st.image(
                image,
                caption="Input Image",
                use_container_width=True
            )

        with col2:
            st.subheader("Prediction Result")

            with st.spinner("Predicting..."):
                predicted_class, confidence, probabilities = predict_image(
                    model=model,
                    image=image,
                    class_names=class_names
                )

            st.success(f"Predicted Class: **{predicted_class}**")
            st.info(f"Confidence: **{confidence * 100:.2f}%**")

            st.subheader("Class Probabilities")

            prob_dict = {
                class_names[i]: float(probabilities[i])
                for i in range(len(class_names))
            }

            st.bar_chart(prob_dict)

            st.write("Detailed probabilities:")

            for class_name, prob in prob_dict.items():
                st.write(f"- **{class_name}**: {prob * 100:.2f}%")

    else:
        st.info("Vui lòng upload một ảnh MRI để dự đoán.")

    st.markdown("---")

    st.caption(
        "Brain Tumor MRI Classification | Deep Learning Project"
    )


# ============================================================
# 9. RUN APP
# ============================================================

if __name__ == "__main__":
    main()
