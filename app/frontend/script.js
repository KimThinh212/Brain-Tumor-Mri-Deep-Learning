const API_URL = "http://127.0.0.1:8000/predict";

const imageInput = document.getElementById("imageInput");
const previewImage = document.getElementById("previewImage");
const predictBtn = document.getElementById("predictBtn");
const loading = document.getElementById("loading");
const resultBox = document.getElementById("result");
const predictedClass = document.getElementById("predictedClass");
const confidence = document.getElementById("confidence");
const probabilitiesBox = document.getElementById("probabilities");

let selectedFile = null;

imageInput.addEventListener("change", function () {
    selectedFile = this.files[0];

    if (selectedFile) {
        const imageUrl = URL.createObjectURL(selectedFile);
        previewImage.src = imageUrl;
        previewImage.style.display = "block";
        resultBox.classList.add("hidden");
    }
});

predictBtn.addEventListener("click", async function () {
    if (!selectedFile) {
        alert("Vui lòng chọn một ảnh MRI trước.");
        return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    loading.classList.remove("hidden");
    resultBox.classList.add("hidden");

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            body: formData
        });

        if (!response.ok) {
            throw new Error("Dự đoán thất bại.");
        }

        const data = await response.json();

        predictedClass.textContent = data.predicted_class;
        confidence.textContent = `${(data.confidence * 100).toFixed(2)}%`;

        probabilitiesBox.innerHTML = "";

        Object.entries(data.probabilities).forEach(([className, prob]) => {
            const percent = (prob * 100).toFixed(2);

            const item = document.createElement("div");
            item.className = "prob-item";

            item.innerHTML = `
                <div class="prob-label">
                    <span>${className}</span>
                    <span>${percent}%</span>
                </div>
                <div class="prob-bar">
                    <div class="prob-fill" style="width: ${percent}%"></div>
                </div>
            `;

            probabilitiesBox.appendChild(item);
        });

        resultBox.classList.remove("hidden");

    } catch (error) {
        alert(error.message);
    } finally {
        loading.classList.add("hidden");
    }
});