# README - Brain MRI Data Analysis (01_information_data.ipynb)

## Introduction
The notebook `01_information_data.ipynb` performs **Exploratory Data Analysis (EDA)** on a brain MRI dataset designed for brain tumor classification. 

The dataset consists of **30 classes**, where each class is a combination of:
*   **Tumor Type:** Astrocytoma, Ependymoma, Glioma, Meningioma, Normal, Oligodendroglioma, Schwannoma, Hemangiopericytoma, Neurocytoma, Other.
*   **MRI Pulse Sequence:** T1, T1C+, T2.

## Directory Structure
*   **Raw Data:** `data/raw/brain_data/`
*   **Processed Data:** `data/processed/`
*   **Output Visualizations:** `reports/images/information_data/`

## Data Exploration

### 1. Dataset Overview
*   **Total Images:** 11,300
*   **Number of Classes:** 30
*   **Naming Convention:** `[Tumor Type] [Sequence]` (e.g., *Meningioma T1C+*, *Hemangiopericytoma T2*)

### 2. Class Distribution
Statistical summary of the image count per class:

| Class | Image Count |
| :--- | :--- |
| Meningioma T1C+ | 977 |
| Other T1C+ | 756 |
| Meningioma T1 | 636 |
| Schwannoma T1C+ | 564 |
| Glioma T1C+ | 549 |
| ... | ... |
| Hemangiopericytoma T2 | 118 |

> **Observation:** The dataset exhibits significant class imbalance.

### 3. Distribution Visualization
A detailed bar plot showing the number of images per class is saved at:
`reports/images/information_data/number_of_images_per_class_dark.png`

<img width="1400" height="800" alt="Image" src="https://github.com/user-attachments/assets/5183b368-4a0e-465f-8c5d-cc01a4b454d3" />

### 4. Imbalance Assessment
*   **Maximum images in a class:** 977
*   **Minimum images in a class:** 118
*   **Imbalance Ratio:** 8.28
*   **Implication:** Strategies to handle imbalance (e.g., oversampling, class weighting) are required during model training.

### 5. Image Dimensions
*   **Analysis Sample:** 600 images (20 per class).
*   **Result:** All images have a uniform size of **512×512 pixels**.
*   The dimension distribution plot is saved at:
`reports/images/information_data/image_dimension_distribution.png`

### 6. Sample Images
The notebook displays 6 sample images representing the first 6 classes in grayscale.
Output saved at: `reports/images/information_data/sample_mri_images.png`

<img width="1500" height="1000" alt="Image" src="https://github.com/user-attachments/assets/da888d06-683e-47a5-8cc2-a7ccfe4909f6" />

## Metadata from DATA.json
The `DATA.json` file located in the raw data directory contains supplementary information for each image, such as detailed diagnosis, lesion location, and patient data. The notebook extracts and previews the first 10 keys for structure validation.

---

## Conclusions & Recommendations

### Advantages
*   **Uniform Image Size:** The 512×512 resolution is consistent across the set, facilitating Deep Learning model development without the need for complex resizing that might distort features.
*   **Structured Data:** The directory layout is clear, making data loading and preprocessing straightforward.

### Challenges
*   **Severe Class Imbalance:** An imbalance ratio of 8.28 may lead to model bias toward majority classes, potentially reducing accuracy for rare tumor types.

### Proposed Solutions
1.  **Loss Function:** Implement **Class Weights** to penalize errors in minority classes more heavily.
2.  **Augmentation:** Apply more aggressive data augmentation specifically for underrepresented classes.
3.  **Sampling:** Consider **Oversampling** (e.g., SMOTE on features) or strategic **Undersampling**.
4.  **Multi-level Classification:** Explore multi-task learning (e.g., separate branches for tumor type and pulse sequence) to reduce complexity.

### Future Work
*   Leverage `DATA.json` to extract additional features or conduct spatial analysis of the lesions.
*   Develop a standardized image preprocessing pipeline (normalization, noise reduction).

---

## Execution Guide
1.  Ensure the data is structured as follows:
    ```text
    data/
    └── raw/
        └── brain_data/
            ├── Astrocytoma T1/
            ├── ...
            └── Normal T2/
