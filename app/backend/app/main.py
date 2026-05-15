from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image

from app.model import load_model, load_class_names
from app.prediction import predict_image


app = FastAPI(
    title="Brain Tumor MRI Classification API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model = load_model()
class_names = load_class_names()


@app.get("/")
def home():
    return {
        "message": "Brain Tumor MRI Classification API is running"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "model_loaded": model is not None,
        "classes": class_names
    }


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400,
            detail="Vui lòng upload file ảnh hợp lệ."
        )

    try:
        image = Image.open(file.file)
        result = predict_image(model, image, class_names)
        return result

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Lỗi dự đoán: {str(e)}"
        )