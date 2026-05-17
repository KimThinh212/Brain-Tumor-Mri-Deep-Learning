# 🧠 Brain Tumor MRI Deep Learning

Deep Learning project for **Brain Tumor Classification** using MRI images and Convolutional Neural Networks (CNN).

This project focuses on medical image classification using MRI brain scans to identify **30 tumor categories** from a public Kaggle dataset. The system includes data preprocessing, model training, evaluation, and **3 deployment interfaces**: FastAPI REST API, Streamlit web app, and a full-stack web frontend.

---

## 📂 Dataset

**Source:** [Kaggle - Brain Tumor MRI Images 30 Classes](https://www.kaggle.com/datasets/fernando2rad/brain-tumor-mri-images-30-classes/data)

The dataset contains **11,300 MRI brain images** across **30 classes**, combining:
- **Tumor Types:** Astrocytoma, Ependymoma, Glioma, Hemangiopericytoma, Meningioma, Neurocytoma, Oligodendroglioma, Schwannoma, Other, Normal
- **MRI Sequences:** T1, T1C+, T2

> **Note:** Original images are 512×512. The dataset has significant class imbalance (ratio ~8.28), handled via augmentation and class weighting during training.

---

## 🗂️ Project Structure

```bash
Brain-Tumor-Mri-Deep-Learning/
│
├── 📁 app/                     # Application / deployment code
│   ├── 📁 backend/             #   FastAPI REST API
│   │   └── app/
│   │       ├── main.py         #     API endpoints (/, /health, /predict)
│   │       ├── model.py        #     Model & class names loader
│   │       ├── prediction.py   #     Inference logic
│   │       ├── preprocessing.py#     Image preprocessing
│   │       └── config.py       #     Paths & constants
│   ├── 📁 frontend/            #   Web UI (NeuroScan AI)
│   │   ├── index.html          #     Main SPA
│   │   ├── css/                #     Stylesheets
│   │   └── js/                 #     JS modules (auth, predict, model, utils)
│   └── 📁 streamlit_app/       #   Streamlit app
│       └── app.py              #     Quick inference UI
│
├── 📁 data/                    # Dataset storage
│   ├── raw/                    #   Original dataset + archive.zip
│   └── processed/              #   Split into train/val/test (30 classes)
│
├── 📁 models/                  # Trained model weights
│   └── baseline_models/
│       ├── baseline_cnn_best.keras
│       └── baseline_cnn_final.keras
│
├── 📁 notebooks/               # Jupyter notebooks
│   ├── 01_infomation_data.ipynb   #   EDA & class distribution
│   ├── 02_dataset_split.ipynb     #   Train/val/test splitting
│   ├── 03_baseline.ipynb          #   Baseline CNN training
│   └── 03_baseline_detailed.ipynb #   Detailed baseline training
│
├── 📁 reports/                 # Evaluation reports & visualizations
│   ├── baseline_model/         #   Metrics, classification report, figures
│   └── images/                 #   EDA plots
│
├── 📁 logs/                    # Training logs (CSV)
├── 📁 documents/               # Documentation
├── 📁 src/                     # Source code modules
│
├── 📄 requirements.txt
├── 📄 LICENSE
└── 📄 README.md
```

---

## 🚀 Features

### Dataset
- **11,300 MRI images** across **30 classes** (10 tumor types × 3 MRI sequences: T1, T1C+, T2)
- **Imbalance ratio**: 8.28 (max class 977 vs min class 118)
- **Original image size**: 512×512 pixels
- **Split**: 70/15/15 → ~7,910 train / 1,695 val / 1,695 test

### Baseline CNN Model
- Architecture: `Conv2D(32)→Pool→Conv2D(64)→Pool→Conv2D(128)→Pool→Conv2D(256)→Pool→Flatten→Dense(256)→Dropout(0.5)→Dense(128)→Dropout(0.3)→Dense(30, softmax)`
- Optimizer: Adam (lr=0.001), Loss: Categorical Crossentropy, Batch size: 32, Epochs: 20
- **Test Accuracy: 42.49%** | **Precision (macro): 46.48%** | **Recall (macro): 38.59%** | **F1 (macro): 38.88%**

### Preprocessing & Augmentation
- Resize to 224×224, convert to RGB, normalize pixels to [0,1]
- Training augmentation: rotation ±15°, width/height shift 0.1, zoom 0.1, horizontal flip

### Deployment
- **FastAPI Backend** — REST API at `/predict` with image upload
- **Streamlit App** — Quick inference with side-by-side image & results
- **Web Frontend (NeuroScan AI)** — Full SPA with:
  - Dashboard with system stats
  - MRI upload & prediction with Chart.js visualization
  - Model metrics display (accuracy, precision, recall, F1)
  - User authentication (login/register via localStorage)

### Notebooks
- `01_information_data.ipynb` — EDA with class distribution & imbalance analysis
- `02_dataset_split.ipynb` — Dataset splitting pipeline (70/15/15)
- `03_baseline_detailed.ipynb` — Baseline CNN training with metrics tracking

---

## 🛠️ Technologies Used

| Technology              | Purpose                   |
| ----------------------- | ------------------------- |
| 🐍 Python               | Main programming language |
| 🧠 TensorFlow / Keras   | Deep Learning framework   |
| ⚡ FastAPI              | REST API backend          |
| 📊 NumPy & Pandas       | Data processing           |
| 🖼️ OpenCV / Pillow     | Image preprocessing       |
| 📈 Matplotlib           | Visualization             |
| 🤖 Scikit-learn         | Evaluation metrics        |
| 📓 Jupyter Notebook     | Experimentation           |
| 🌐 HTML / CSS / JS      | Web frontend              |
| 📊 Chart.js             | Client-side charts        |
| 🎈 Streamlit            | Quick prototyping UI      |

---

## ⚙️ Installation

Clone the repository:

```bash
git clone https://github.com/KimThinh212/Brain-Tumor-Mri-Deep-Learning.git
cd Brain-Tumor-Mri-Deep-Learning
```

Install dependencies:

```bash
pip install -r requirements.txt
```

---

## ▶️ Usage

### FastAPI Backend

```bash
cd app/backend
uvicorn app.main:app --reload
# API available at http://127.0.0.1:8000
# Docs at http://127.0.0.1:8000/docs
```

### Streamlit App

```bash
streamlit run app/streamlit_app/app.py
```

### Web Frontend

Open `app/frontend/index.html` in your browser.  
> **Note:** The frontend calls the FastAPI backend at `http://127.0.0.1:8000/predict`. Start the backend first for live predictions, or it falls back to demo mode.

### Notebooks

```bash
jupyter notebook notebooks/
```

Default accounts (frontend auth):
| Username | Password   | Role     |
| -------- | ---------- | -------- |
| `admin`  | `admin123` | Admin    |
| `doctor` | `doctor123`| Doctor   |
| `guest`  | `guest123` | Guest    |

---

## 📊 Baseline Results

| Metric               | Value    |
| -------------------- | -------- |
| Test Accuracy        | 42.49%   |
| Test Loss            | 1.776    |
| Precision (macro)    | 46.48%   |
| Recall (macro)       | 38.59%   |
| F1-score (macro)     | 38.88%   |
| Precision (weighted) | 45.57%   |
| Recall (weighted)    | 42.49%   |
| F1-score (weighted)  | 40.83%   |

> **Note:** This is a **baseline CNN** model. The 30-class imbalance (ratio 8.28) and limited training (20 epochs) contribute to the modest accuracy. Future improvements could include transfer learning (EfficientNet/ResNet), oversampling minority classes, and longer training with class weights.
>
> Training log and figures available in `logs/baseline_log/` and `reports/baseline_model/figures/`.

---

## 👥 Contributors

Show some love and end up in the hall of fame.

<p align="center">
  <a href="https://github.com/KimThinh212/Brain-Tumor-Mri-Deep-Learning/graphs/contributors">
    <img src="https://contrib.rocks/image?repo=KimThinh212/Brain-Tumor-Mri-Deep-Learning" />
  </a>
</p>
