# ============================================================
# BRAIN TUMOR MRI CLASSIFICATION — ADVANCED CLINICAL DASHBOARD
# app_2.py  |  Enhanced with Grad-CAM XAI & Medical-Grade UI
# ------------------------------------------------------------
# Project  : Brain Tumor MRI Fine-Grained Classification
# Authors  : Phan Trọng Nguyên  &  Võ Bạch Kim Thịnh (2045230096)
# Advisor  : M.Sc. Trần Đình Toàn
# University: HUIT
# ============================================================

from pathlib import Path
import json

import cv2
import numpy as np
import streamlit as st
import tensorflow as tf
from PIL import Image
import matplotlib
import matplotlib.pyplot as plt
import matplotlib.cm as cm
from tensorflow.keras.layers import Dense


# ============================================================
# 1. PAGE CONFIG — MUST BE THE VERY FIRST STREAMLIT CALL
# ============================================================

st.set_page_config(
    page_title="NeuroScan AI — Brain Tumor MRI Classifier",
    page_icon="🧠",
    layout="wide",
    initial_sidebar_state="expanded",
)


# ============================================================
# 2. KERAS COMPATIBILITY PATCH  (keep identical to app.py)
# ============================================================

_original_dense_from_config = Dense.from_config


@classmethod
def fixed_dense_from_config(cls, config):
    config.pop("quantization_config", None)
    return _original_dense_from_config(config)


Dense.from_config = fixed_dense_from_config


# ============================================================
# 3. GLOBAL CSS — Medical-Grade Dashboard Theme
# ============================================================

GLOBAL_CSS = """
<style>
/* ── Import Inter from Google Fonts ── */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

/* ── Reset & Base ── */
html, body, [class*="css"] {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif !important;
    color: #1e293b;
}

/* ── Main canvas ── */
.main .block-container {
    padding: 1.5rem 2.5rem 3rem 2.5rem;
    max-width: 1400px;
}

/* ── App header bar ── */
.app-header {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 20px 0 10px 0;
    border-bottom: 2px solid #e2e8f0;
    margin-bottom: 24px;
}
.app-header .logo-badge {
    background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
    color: white;
    font-size: 28px;
    width: 56px; height: 56px;
    border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 4px 12px rgba(2, 132, 199, 0.35);
}
.app-header .title-block h1 {
    margin: 0; font-size: 1.75rem; font-weight: 800;
    color: #0f172a; letter-spacing: -0.5px;
}
.app-header .title-block p {
    margin: 2px 0 0 0; font-size: 0.85rem; color: #64748b; font-weight: 400;
}

/* ── Medical warning banner ── */
.med-warning {
    background: #fff7ed;
    border: 1px solid #fed7aa;
    border-left: 4px solid #f97316;
    border-radius: 8px;
    padding: 12px 16px;
    font-size: 0.83rem;
    color: #7c2d12;
    margin-bottom: 24px;
}

/* ── UI Card wrapper ── */
.ui-card {
    background: #ffffff;
    border: 1px solid #f1f5f9;
    border-radius: 12px;
    padding: 22px 24px;
    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -2px rgba(0,0,0,0.05);
    margin-bottom: 20px;
}
.ui-card .card-title {
    font-size: 0.70rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #94a3b8;
    margin-bottom: 10px;
}

/* ── Prediction badge — tumor ── */
.pred-badge-tumor {
    background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
    border: 1px solid #fbbf24;
    border-left: 4px solid #d97706;
    border-radius: 10px;
    padding: 16px 20px;
    margin-bottom: 12px;
}
.pred-badge-tumor .label { font-size: 0.68rem; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.07em; color: #92400e; }
.pred-badge-tumor .value { font-size: 1.55rem; font-weight: 800;
    color: #78350f; line-height: 1.2; margin-top: 4px; }

/* ── Prediction badge — normal ── */
.pred-badge-normal {
    background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
    border: 1px solid #86efac;
    border-left: 4px solid #22c55e;
    border-radius: 10px;
    padding: 16px 20px;
    margin-bottom: 12px;
}
.pred-badge-normal .label { font-size: 0.68rem; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.07em; color: #14532d; }
.pred-badge-normal .value { font-size: 1.55rem; font-weight: 800;
    color: #15803d; line-height: 1.2; margin-top: 4px; }

/* ── Confidence metric chip ── */
.conf-chip {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 12px 18px;
    display: inline-block;
    margin-bottom: 16px;
}
.conf-chip .label { font-size: 0.65rem; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.07em; color: #64748b; }
.conf-chip .value { font-size: 1.30rem; font-weight: 700;
    color: #0284c7; margin-top: 3px; }

/* ── Section divider ── */
.section-divider {
    border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;
}

/* ── Heatmap legend strip ── */
.heatmap-legend {
    display: flex; align-items: center; gap: 10px;
    font-size: 0.75rem; color: #64748b; margin-top: 8px;
}

/* ── Model info pill ── */
.model-pill {
    display: inline-block;
    background: #eff6ff; border: 1px solid #bfdbfe;
    border-radius: 20px; padding: 4px 12px;
    font-size: 0.75rem; font-weight: 600; color: #1d4ed8;
    margin-top: 4px;
}

/* ── Sidebar overrides ── */
section[data-testid="stSidebar"] {
    background: #f8fafc;
    border-right: 1px solid #e2e8f0;
}
section[data-testid="stSidebar"] h2, 
section[data-testid="stSidebar"] h3 {
    color: #0f172a; font-size: 0.9rem; font-weight: 700;
    border-bottom: 1px solid #e2e8f0; padding-bottom: 6px;
}

/* ── Class list in sidebar ── */
.class-list-item {
    font-size: 0.78rem; color: #475569; padding: 2px 0;
    border-bottom: 1px dashed #f1f5f9;
}

/* ── Upload zone styling ── */
[data-testid="stFileUploader"] {
    border: 2px dashed #cbd5e1 !important;
    border-radius: 12px !important;
    background: #f8fafc !important;
}

/* ── Spinner ── */
[data-testid="stSpinner"] { color: #0284c7 !important; }

/* ── Footer ── */
.app-footer {
    text-align: center;
    font-size: 0.75rem;
    color: #94a3b8;
    margin-top: 40px;
    padding-top: 20px;
    border-top: 1px solid #f1f5f9;
}
</style>
"""


# ============================================================
# 4. PATH CONFIGURATION  (identical structure to app.py)
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent

MODEL_PATH = (
    PROJECT_ROOT / "models" / "baseline_models" / "baseline_cnn_best.keras"
)

MODEL_PATH_FINAL = (
    PROJECT_ROOT / "models" / "baseline_models" / "baseline_cnn_final.keras"
)

CLASS_INDICES_PATH = (
    PROJECT_ROOT / "reports" / "baseline_model" / "class_indices.json"
)

IMG_SIZE = (224, 224)

# Classes that are NOT tumors (for badge colour selection)
NORMAL_CLASSES = {"Normal T1", "Normal T1C+", "Normal T2"}

# Last conv layer name in the Baseline CNN (Lightweight_CNN)
BASELINE_LAST_CONV = "conv2d_3"


# ============================================================
# 5. LOAD MODEL & CLASS NAMES  (cached, identical to app.py)
# ============================================================

@st.cache_resource
def load_trained_model(model_path: str):
    """Load a Keras model from disk with compile=False."""
    return tf.keras.models.load_model(str(model_path), compile=False)


@st.cache_data
def load_class_names(class_indices_path: str):
    """Return class name list ordered by integer index."""
    with open(class_indices_path, "r", encoding="utf-8") as f:
        class_indices = json.load(f)
    index_to_class = {int(v): k for k, v in class_indices.items()}
    return [index_to_class[i] for i in range(len(index_to_class))]


# ============================================================
# 6. IMAGE PREPROCESSING  (identical to app.py)
# ============================================================

def preprocess_image(image: Image.Image) -> np.ndarray:
    """Convert PIL image → normalised float32 batch tensor (1, 224, 224, 3)."""
    image = image.convert("RGB").resize(IMG_SIZE)
    arr = np.array(image).astype("float32") / 255.0
    return np.expand_dims(arr, axis=0)


# ============================================================
# 7. PREDICTION WITH DUAL-OUTPUT DETECTION
# ============================================================

def predict_image_full(model, image: Image.Image, class_names):
    """
    Run inference.  Returns:
        predicted_class (str), confidence (float),
        probabilities (np.ndarray), raw_heatmap_or_None
    """
    processed = preprocess_image(image)
    raw_output = model.predict(processed, verbose=0)

    # Dual-Head model: output is a list/tuple → [class_probs, heatmap]
    if isinstance(raw_output, (list, tuple)):
        probabilities = np.array(raw_output[0]).squeeze()
        raw_heatmap   = np.array(raw_output[1]).squeeze()   # shape (48,48,1) or (48,48)
    else:
        # Baseline single-output model
        probabilities = np.array(raw_output).squeeze()
        raw_heatmap   = None

    predicted_index = int(np.argmax(probabilities))
    predicted_class = class_names[predicted_index]
    confidence      = float(probabilities[predicted_index])

    return predicted_class, confidence, probabilities, raw_heatmap


# ============================================================
# 8. XAI HEATMAP — Compatible with subclassed Keras models
# ============================================================

def _apply_colormap_jet(heatmap_2d: np.ndarray) -> np.ndarray:
    """Normalise a 2-D float map → uint8 JET RGB (224×224×3)."""
    max_val = heatmap_2d.max()
    if max_val > 0:
        heatmap_2d = heatmap_2d / max_val
    resized   = cv2.resize(heatmap_2d, IMG_SIZE)
    uint8_map = np.uint8(255 * np.clip(resized, 0, 1))
    colored   = cv2.applyColorMap(uint8_map, cv2.COLORMAP_JET)
    return cv2.cvtColor(colored, cv2.COLOR_BGR2RGB)


def _gradcam_intercept(model, img_tensor: tf.Tensor,
                       last_conv_layer, class_idx: int):
    """
    Proper Grad-CAM for subclassed Keras models.

    Strategy:
      1. Monkey-patch ``last_conv_layer.call`` to capture its output tensor
         during a first forward pass.
      2. Wrap that captured output in a ``tf.Variable`` so GradientTape can
         differentiate through it.
      3. Run only the layers *after* the conv layer under the tape to get
         the class score gradient w.r.t. conv output.

    Works as long as ``model.layers`` lists layers in forward-pass order
    (true for the Lightweight_CNN architecture).
    """
    # ── Step 1: intercept conv output during a normal forward pass ──
    captured: dict = {}

    original_call = last_conv_layer.call

    def capturing_call(inputs, **kwargs):
        out = original_call(inputs, **kwargs)
        captured["conv_out"] = out
        return out

    last_conv_layer.call = capturing_call
    try:
        _ = model(img_tensor, training=False)
    finally:
        last_conv_layer.call = original_call   # always restore

    if "conv_out" not in captured:
        return None

    conv_out_tensor = captured["conv_out"]   # (1, H, W, C)

    # ── Step 2: collect layers *after* the conv layer ──
    post_layers = []
    found = False
    for lyr in model.layers:
        if found:
            post_layers.append(lyr)
        if lyr is last_conv_layer:
            found = True

    if not post_layers:
        # No post-conv layers found via model.layers — fall back
        return None

    # ── Step 3: GradientTape watching the conv output Variable ──
    conv_var = tf.Variable(conv_out_tensor, trainable=True, dtype=tf.float32)

    with tf.GradientTape() as tape:
        tape.watch(conv_var)
        x = conv_var
        for lyr in post_layers:
            try:
                x = lyr(x, training=False)
            except TypeError:
                x = lyr(x)
        predictions = x
        if isinstance(predictions, (list, tuple)):
            class_score = predictions[0][:, class_idx]
        else:
            class_score = predictions[:, class_idx]

    grads = tape.gradient(class_score, conv_var)   # (1, H, W, C)
    if grads is None:
        return None

    # ── Grad-CAM weighting ──
    pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))          # (C,)
    conv_np      = conv_out_tensor.numpy()[0]                     # (H, W, C)
    heatmap      = np.einsum("hwc,c->hw", conv_np,
                             pooled_grads.numpy())                # (H, W)
    heatmap      = np.maximum(heatmap, 0)

    return _apply_colormap_jet(heatmap)


def _saliency_fallback(model, img_tensor: tf.Tensor, class_idx: int):
    """
    Input-gradient saliency map — universal fallback for any Keras model.
    Computes |∂score/∂pixel| averaged over colour channels, then Gaussian-
    smoothed to produce a spatial relevance map.
    """
    img_var = tf.Variable(img_tensor, trainable=True, dtype=tf.float32)
    with tf.GradientTape() as tape:
        tape.watch(img_var)
        preds = model(img_var, training=False)
        if isinstance(preds, (list, tuple)):
            score = preds[0][:, class_idx]
        else:
            score = preds[:, class_idx]

    grads    = tape.gradient(score, img_var)     # (1, 224, 224, 3)
    saliency = tf.reduce_max(tf.abs(grads[0]), axis=-1).numpy()   # (224, 224)
    saliency = cv2.GaussianBlur(saliency, (15, 15), 0)

    return _apply_colormap_jet(saliency)


def compute_gradcam(model, image: Image.Image, class_idx: int) -> np.ndarray:
    """
    Compute an attention heatmap compatible with both Functional/Sequential
    and subclassed Keras models (e.g. Lightweight_CNN).

    Cascade:
      1. Grad-CAM via conv-layer interception  (best quality)
      2. Input-gradient saliency map           (universal fallback)
      3. Return None                           (if everything fails)

    Returns uint8 RGB array (224, 224, 3) or None.
    """
    img_tensor = tf.cast(preprocess_image(image), tf.float32)

    # ── Find last Conv2D layer ──
    last_conv_layer = None
    try:
        last_conv_layer = model.get_layer(BASELINE_LAST_CONV)
    except (ValueError, AttributeError):
        pass

    if last_conv_layer is None:
        for lyr in reversed(model.layers):
            if isinstance(lyr, tf.keras.layers.Conv2D):
                last_conv_layer = lyr
                break

    # ── Attempt 1: Grad-CAM via interception ──
    if last_conv_layer is not None:
        try:
            result = _gradcam_intercept(model, img_tensor, last_conv_layer, class_idx)
            if result is not None:
                return result
        except Exception:
            pass   # silently fall through to saliency

    # ── Attempt 2: Input-gradient saliency ──
    try:
        return _saliency_fallback(model, img_tensor, class_idx)
    except Exception:
        return None


# ============================================================
# 9. DUAL-HEAD HEATMAP PROCESSING
# ============================================================

def process_dualhead_heatmap(raw_heatmap: np.ndarray) -> np.ndarray:
    """
    Upscale and colourise a raw Heatmap Decoder output (48×48 sigmoid map)
    to a (224, 224, 3) uint8 RGB array using the VIRIDIS colormap.
    """
    # Ensure 2-D
    if raw_heatmap.ndim == 3:
        raw_heatmap = raw_heatmap[:, :, 0]

    # Normalise to [0, 1]
    h_min, h_max = raw_heatmap.min(), raw_heatmap.max()
    if h_max > h_min:
        raw_heatmap = (raw_heatmap - h_min) / (h_max - h_min)

    # Upscale
    heatmap_resized = cv2.resize(raw_heatmap, IMG_SIZE, interpolation=cv2.INTER_LINEAR)
    heatmap_uint8   = np.uint8(255 * heatmap_resized)

    colormap_applied = cv2.applyColorMap(heatmap_uint8, cv2.COLORMAP_VIRIDIS)
    colormap_rgb     = cv2.cvtColor(colormap_applied, cv2.COLOR_BGR2RGB)
    return colormap_rgb


# ============================================================
# 10. BLEND HEATMAP ONTO ORIGINAL SCAN
# ============================================================

def blend_heatmap(original_image: Image.Image, heatmap_rgb: np.ndarray, alpha: float) -> np.ndarray:
    """
    Alpha-blend heatmap_rgb (uint8 224×224×3) with the original MRI scan.
    alpha=0 → pure scan; alpha=1 → pure heatmap.
    Returns uint8 (224, 224, 3) array.
    """
    scan_arr = np.array(
        original_image.convert("RGB").resize(IMG_SIZE)
    ).astype(np.float32)

    heatmap_f = heatmap_rgb.astype(np.float32)
    blended   = (1.0 - alpha) * scan_arr + alpha * heatmap_f
    return np.clip(blended, 0, 255).astype(np.uint8)


# ============================================================
# 11. MODERN PROBABILITY BAR CHART
# ============================================================

def build_prob_chart(prob_dict: dict, predicted_class: str):
    """Render a modernised horizontal bar chart and return the figure."""
    classes = list(prob_dict.keys())
    probs   = list(prob_dict.values())
    max_idx = int(np.argmax(probs))

    colors = ["#94a3b8"] * len(classes)   # slate-blue default
    colors[max_idx] = "#f59e0b"            # amber accent for top class

    fig, ax = plt.subplots(figsize=(9, 7))
    fig.patch.set_facecolor("none")       # transparent canvas
    ax.set_facecolor("#fafafa")

    bars = ax.barh(classes, probs, color=colors, height=0.65, edgecolor="none")

    # Dashed grid
    ax.set_axisbelow(True)
    ax.xaxis.grid(True, linestyle="--", color="#e5e7eb", linewidth=0.8)

    # Spine cleanup
    for spine in ["top", "right", "left", "bottom"]:
        ax.spines[spine].set_visible(False)
    ax.tick_params(left=False, bottom=False)

    ax.set_xlabel("Probability", fontsize=9, color="#64748b", labelpad=8)
    ax.set_xlim(0, 1.08)
    ax.invert_yaxis()
    ax.tick_params(axis="y", labelsize=8.5, colors="#374151")
    ax.tick_params(axis="x", labelsize=8, colors="#9ca3af")

    # Value labels
    for i, v in enumerate(probs):
        colour = "#92400e" if i == max_idx else "#6b7280"
        weight = "bold" if i == max_idx else "normal"
        ax.text(v + 0.012, i, f"{v*100:.1f}%",
                va="center", fontsize=8, color=colour, fontweight=weight)

    fig.tight_layout(pad=1.2)
    return fig


# ============================================================
# 12. SIDEBAR CONTENT
# ============================================================

def render_sidebar(model_path: str, class_names: list, model_type: str):
    st.sidebar.markdown("## 🏥 NeuroScan AI")
    st.sidebar.markdown(f"<span class='model-pill'>Model: {model_type}</span>",
                        unsafe_allow_html=True)
    st.sidebar.markdown("---")

    with st.sidebar.expander("📂 Model Paths", expanded=False):
        st.code(str(model_path), language="text")
        st.code(str(CLASS_INDICES_PATH), language="text")

    st.sidebar.markdown(f"**Image input size:** `{IMG_SIZE[0]} × {IMG_SIZE[1]}`")
    st.sidebar.markdown(f"**Number of classes:** `{len(class_names)}`")
    st.sidebar.markdown("---")

    with st.sidebar.expander("📋 All 30 Classes", expanded=False):
        for cn in class_names:
            st.sidebar.markdown(f"<div class='class-list-item'>• {cn}</div>",
                                unsafe_allow_html=True)

    st.sidebar.markdown("---")
    st.sidebar.markdown(
        "<div style='font-size:0.72rem;color:#94a3b8;'>"
        "🎓 HUIT · Deep Learning Project<br>"
        "Phan Trọng Nguyên &amp; Võ Bạch Kim Thịnh<br>"
        "Advisor: M.Sc. Trần Đình Toàn"
        "</div>",
        unsafe_allow_html=True
    )


# ============================================================
# 13. PREDICTION BADGE HTML HELPERS
# ============================================================

def prediction_badge_html(predicted_class: str) -> str:
    is_normal = predicted_class in NORMAL_CLASSES
    css_class = "pred-badge-normal" if is_normal else "pred-badge-tumor"
    icon      = "✅" if is_normal else "⚠️"
    return f"""
    <div class="{css_class}">
        <div class="label">{icon} Diagnostic Prediction</div>
        <div class="value">{predicted_class}</div>
    </div>
    """


def confidence_chip_html(confidence: float) -> str:
    return f"""
    <div class="conf-chip">
        <div class="label">🎯 Confidence Score</div>
        <div class="value">{confidence * 100:.2f}%</div>
    </div>
    """


# ============================================================
# 14. CHECK REQUIRED FILES
# ============================================================

def check_required_files(model_path: Path):
    if not model_path.exists():
        st.error(f"Model file not found:\n`{model_path}`")
        st.stop()
    if not CLASS_INDICES_PATH.exists():
        st.error(f"Class indices not found:\n`{CLASS_INDICES_PATH}`")
        st.stop()


# ============================================================
# 15. MAIN APPLICATION
# ============================================================

def main():
    # ── Inject global CSS ──
    st.markdown(GLOBAL_CSS, unsafe_allow_html=True)

    # ── App header ──
    st.markdown(
        """
        <div class="app-header">
            <div class="logo-badge">🧠</div>
            <div class="title-block">
                <h1>NeuroScan AI — Brain Tumor MRI Classifier</h1>
                <p>Fine-Grained Classification · 30 Classes · 3 MRI Sequences · XAI Attention Maps</p>
            </div>
        </div>
        """,
        unsafe_allow_html=True,
    )

    # ── Medical disclaimer ──
    st.markdown(
        """
        <div class="med-warning">
            ⚕️ <strong>Clinical Disclaimer:</strong> This system is developed solely for
            academic research and educational purposes at HUIT University. It must
            <strong>NOT</strong> replace professional medical diagnosis or radiological assessment.
        </div>
        """,
        unsafe_allow_html=True,
    )

    # ── Model selector in sidebar ──
    available_models = {}
    if MODEL_PATH.exists():
        available_models["Baseline CNN (Best Checkpoint)"] = MODEL_PATH
    if MODEL_PATH_FINAL.exists():
        available_models["Baseline CNN (Final Epoch)"] = MODEL_PATH_FINAL
    if not available_models:
        st.error("No model files found. Check the `models/baseline_models/` directory.")
        st.stop()

    selected_label = st.sidebar.selectbox(
        "🔬 Select Model",
        options=list(available_models.keys()),
        index=0,
    )
    chosen_model_path = available_models[selected_label]

    check_required_files(chosen_model_path)

    # ── Load assets ──
    try:
        model       = load_trained_model(str(chosen_model_path))
        class_names = load_class_names(str(CLASS_INDICES_PATH))
    except Exception as exc:
        st.error("Failed to load model or class indices.")
        st.exception(exc)
        st.stop()

    # Detect model type for display label
    model_type = getattr(model, "name", "Unknown")
    render_sidebar(chosen_model_path, class_names, model_type)

    # ── XAI controls in sidebar ──
    st.sidebar.markdown("---")
    st.sidebar.markdown("### 🔥 Attention Heatmap Controls")
    show_heatmap = st.sidebar.checkbox("Show XAI Attention Heatmap", value=True)
    alpha_blend = st.sidebar.slider(
        "Heatmap Opacity (Alpha Blend)",
        min_value=0.0, max_value=1.0, value=0.45, step=0.05,
        help="0 = pure MRI scan · 1 = pure attention heatmap",
    )
    colormap_choice = st.sidebar.radio(
        "Heatmap Colormap",
        options=["JET (Grad-CAM)", "VIRIDIS", "HOT"],
        index=0,
    )

    # ── File uploader ──
    uploaded_file = st.file_uploader(
        "📤  Upload an MRI scan (JPG / PNG / BMP / WebP)",
        type=["jpg", "jpeg", "png", "bmp", "webp"],
        label_visibility="visible",
    )

    # ── Main content ──
    if uploaded_file is not None:
        image = Image.open(uploaded_file)

        # ── Run inference ──
        with st.spinner("🔄 Running inference & computing attention map…"):
            (predicted_class, confidence,
             probabilities, raw_heatmap) = predict_image_full(model, image, class_names)

            predicted_idx = int(np.argmax(probabilities))

            # ── Compute heatmap ──
            heatmap_rgb = None
            heatmap_source = "N/A"

            if show_heatmap:
                if raw_heatmap is not None:
                    heatmap_rgb    = process_dualhead_heatmap(raw_heatmap)
                    heatmap_source = "Dual-Head Decoder Output"
                else:
                    heatmap_rgb    = compute_gradcam(model, image, predicted_idx)
                    heatmap_source = f"Grad-CAM  ← {BASELINE_LAST_CONV}"

        st.markdown("<div style='height:16px'></div>", unsafe_allow_html=True)

        # ── TOP SECTION: Scan + Results ──
        col_scan, col_results = st.columns([1.1, 1], gap="large")

        # ─── LEFT: MRI scan + heatmap ───
        with col_scan:
            # Card label
            st.markdown(
                "<div class='card-title' style='margin-bottom:6px;'>🖼 Input MRI Scan</div>",
                unsafe_allow_html=True,
            )
            st.image(image, width="stretch", caption="Uploaded scan")

            if show_heatmap and heatmap_rgb is not None:
                # Apply user-chosen colormap override (Grad-CAM only)
                if raw_heatmap is None and colormap_choice != "JET (Grad-CAM)":
                    cm_code = (cv2.COLORMAP_VIRIDIS if "VIRIDIS" in colormap_choice
                               else cv2.COLORMAP_HOT)
                    gray_base   = cv2.cvtColor(heatmap_rgb, cv2.COLOR_RGB2GRAY)
                    colored     = cv2.applyColorMap(gray_base, cm_code)
                    heatmap_rgb = cv2.cvtColor(colored, cv2.COLOR_BGR2RGB)

                blended = blend_heatmap(image, heatmap_rgb, alpha_blend)

                st.markdown(
                    f"<div class='card-title' style='margin-top:16px;margin-bottom:6px;'>"
                    f"🔥 Attention Heatmap · {heatmap_source}</div>",
                    unsafe_allow_html=True,
                )
                st.image(blended, width="stretch",
                         caption=f"Blended view (opacity {alpha_blend:.0%})")
                st.markdown(
                    "<div class='heatmap-legend'>"
                    "🟦 Low &nbsp;|&nbsp; 🟨 Medium &nbsp;|&nbsp; 🟧 High &nbsp;|&nbsp; 🟥 Peak"
                    "</div>",
                    unsafe_allow_html=True,
                )

        # ─── RIGHT: Analysis results ───
        with col_results:
            # Prediction badge + confidence — all one self-contained HTML block
            st.markdown(prediction_badge_html(predicted_class), unsafe_allow_html=True)
            st.markdown(confidence_chip_html(confidence), unsafe_allow_html=True)

            st.markdown(
                "<div class='card-title' style='margin-top:16px;margin-bottom:8px;'>"
                "🏆 Top-5 Predictions</div>",
                unsafe_allow_html=True,
            )

            # Build the entire Top-5 table in ONE self-contained markdown block
            top5_idx  = np.argsort(probabilities)[::-1][:5]
            rows_html = ""
            for rank, idx in enumerate(top5_idx, 1):
                bar_w  = int(probabilities[idx] * 100)
                accent = "#f59e0b" if rank == 1 else "#94a3b8"
                t_col  = "#78350f" if rank == 1 else "#374151"
                fw     = "700"    if rank == 1 else "400"
                rows_html += (
                    f'<div style="margin-bottom:8px;">'
                    f'<div style="display:flex;justify-content:space-between;'
                    f'font-size:0.80rem;font-weight:{fw};color:{t_col};margin-bottom:3px;">'
                    f'<span>#{rank}&nbsp; {class_names[idx]}</span>'
                    f'<span>{probabilities[idx]*100:.1f}%</span></div>'
                    f'<div style="height:6px;background:#f1f5f9;border-radius:3px;overflow:hidden;">'
                    f'<div style="height:100%;width:{bar_w}%;background:{accent};'
                    f'border-radius:3px;"></div></div></div>'
                )
            st.markdown(rows_html, unsafe_allow_html=True)

        # ── FULL PROBABILITY CHART ──
        st.markdown(
            "<div class='card-title' style='margin-top:24px;margin-bottom:8px;'>"
            "📈 Full Class Probability Distribution (30 Classes)</div>",
            unsafe_allow_html=True,
        )
        prob_dict = {class_names[i]: float(probabilities[i]) for i in range(len(class_names))}
        fig = build_prob_chart(prob_dict, predicted_class)
        st.pyplot(fig, use_container_width=True)
        plt.close(fig)

        # ── Raw scores expandable ──
        with st.expander("🔢 View All Raw Probability Scores"):
            sorted_probs = sorted(prob_dict.items(), key=lambda x: x[1], reverse=True)
            cols = st.columns(3)
            for i, (cls_name, prob) in enumerate(sorted_probs):
                cols[i % 3].markdown(f"**{cls_name}**  \n`{prob*100:.2f}%`")

    else:
        # ── Empty state — fully self-contained HTML ──
        st.markdown(
            """
            <div class="ui-card" style="text-align:center;padding:60px 40px;">
                <div style="font-size:3.5rem;">🩻</div>
                <div style="font-size:1.1rem;font-weight:600;color:#374151;margin-top:12px;">
                    Upload a Brain MRI Scan to Begin
                </div>
                <div style="font-size:0.85rem;color:#94a3b8;margin-top:8px;">
                    Supported formats: JPG · PNG · BMP · WebP<br>
                    The model will classify the scan into one of 30 fine-grained categories
                    and highlight the most diagnostically relevant regions.
                </div>
            </div>
            """,
            unsafe_allow_html=True,
        )

    # ── Footer — fully self-contained HTML ──
    st.markdown(
        """
        <div class="app-footer">
            NeuroScan AI · Brain Tumor MRI Classification System<br>
            HUIT University · Deep Learning Graduation Thesis 2025<br>
            Phan Trọng Nguyên &amp; Võ Bạch Kim Thịnh · Advisor: M.Sc. Trần Đình Toàn
        </div>
        """,
        unsafe_allow_html=True,
    )


# ============================================================
# 16. ENTRY POINT
# ============================================================

if __name__ == "__main__":
    main()
