from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[3]

MODEL_PATH = (
    PROJECT_ROOT
    / "models"
    / "baseline_models"
    / "baseline_cnn_best.keras"
    #/ "brain_tumor_model.keras"
)

CLASS_INDICES_PATH = (
    PROJECT_ROOT
    / "reports"
    / "baseline_model"
    / "class_indices.json"
)

IMG_SIZE = (224, 224)

# print(PROJECT_ROOT)
# print(MODEL_PATH)