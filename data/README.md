# Data Directory

This directory contains the dataset and processed data used in the **Brain Tumor MRI Deep Learning** project.

## Dataset Information

- **Dataset Name:** Brain Tumor MRI Images – 30 Classes
- **Source:** [Kaggle Dataset](https://www.kaggle.com/datasets/fernando2rad/brain-tumor-mri-images-30-classes/data?utm_source=chatgpt.com)
- **Modality:** MRI (Magnetic Resonance Imaging)
- **Task Type:** Multi-class image classification
- **Domain:** Medical Imaging / Deep Learning

The dataset contains MRI brain tumor images from multiple tumor categories and MRI sequences such as:

- T1
- T1C+
- T2

Example tumor classes include:

- Astrocytoma
- Ependymoma
- Schwannoma
- Glioblastoma
- Meningioma
- Medulloblastoma
- Oligodendroglioma

---

# Directory Structure

```text
data/
├── processed/           # Preprocessed and transformed datasets
├── raw/                 # Original dataset files
│   ├── brain_data/
│   │   ├── Astrocytoma T1/
│   │   ├── Astrocytoma T1C+/
│   │   ├── Astrocytoma T2/
│   │   ├── Ependymoma T1/
│   │   ├── Schwannoma T1/
│   │   ├── Schwannoma T1C+/
│   │   └── Schwannoma T2/
│   ├── DATA.json        # Metadata or label information
│   └── archive.zip      # Original compressed dataset
└── README.md
```

---

# Data Description

## raw/

Contains the original MRI dataset downloaded from Kaggle.

### archive.zip
Compressed original dataset file.

### DATA.json
Stores metadata, labels, or dataset configuration information.

### brain_data/
Contains MRI brain tumor images grouped by:

- Tumor type
- MRI sequence

---

## processed/

Contains processed data generated during preprocessing steps such as:

- Image resizing
- Normalization
- Augmentation
- Train/validation/test split
- Tensor conversion

Processed data is not included in version control unless necessary.

---

# Notes

- Large dataset files such as `.zip`, `.json`, and image folders may be excluded from Git tracking using `.gitignore`.
- This project is intended for educational and research purposes only.
- Medical datasets should not be used for real clinical diagnosis.

---

# Citation

If you use this dataset in research or academic work, please cite the original dataset author from Kaggle.

Dataset URL:
[Brain Tumor MRI Images – 30 Classes](https://www.kaggle.com/datasets/fernando2rad/brain-tumor-mri-images-30-classes/data?utm_source)