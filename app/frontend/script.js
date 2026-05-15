// Configuration
const API_URL = "http://127.0.0.1:8000/predict";

// DOM elements
const imageInput = document.getElementById("imageInput");
const previewImage = document.getElementById("previewImage");
const predictBtn = document.getElementById("predictBtn");
const loadingDiv = document.getElementById("loading");
const resultContainer = document.getElementById("result");
const placeholderDiv = document.getElementById("placeholderResult");
const predictedClassSpan = document.getElementById("predictedClass");
const confidenceSpan = document.getElementById("confidence");
const probabilitiesListDiv = document.getElementById("probabilitiesList");
const fileNameDisplay = document.getElementById("fileNameDisplay");
const noPreviewMsg = document.getElementById("noPreviewMsg");

let selectedFile = null;
let chartInstance = null;

// Default class names and colors
const DEFAULT_CLASSES = ["glioma", "meningioma", "pituitary", "no_tumor"];
const CLASS_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

// Helper: reset upload display
function resetUploadDisplay() {
    selectedFile = null;
    previewImage.style.display = "none";
    if (noPreviewMsg) noPreviewMsg.style.display = "block";
    fileNameDisplay.innerHTML = "";
    previewImage.src = "";
    resultContainer.classList.add("hidden");
    placeholderDiv.style.display = "flex";
    if (chartInstance) {
        chartInstance.destroy();
        chartInstance = null;
    }
    probabilitiesListDiv.innerHTML = "";
}

// File input change handler
imageInput.addEventListener("change", function(e) {
    const file = e.target.files[0];
    if (file) {
        selectedFile = file;
        fileNameDisplay.innerHTML = `<i class="fas fa-check-circle" style="color:#10b981"></i> ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
        const objectUrl = URL.createObjectURL(file);
        previewImage.src = objectUrl;
        previewImage.style.display = "block";
        if (noPreviewMsg) noPreviewMsg.style.display = "none";
        // reset result when new image selected
        resultContainer.classList.add("hidden");
        placeholderDiv.style.display = "flex";
        if (chartInstance) {
            chartInstance.destroy();
            chartInstance = null;
        }
        probabilitiesListDiv.innerHTML = "";
    } else {
        resetUploadDisplay();
    }
});

// Render prediction result with chart
function renderPredictionResult(predictionData) {
    const predicted = predictionData.predicted_class;
    const confValue = predictionData.confidence;
    const probs = predictionData.probabilities;

    predictedClassSpan.textContent = predicted.toUpperCase().replace(/_/g, " ");
    confidenceSpan.textContent = `${(confValue * 100).toFixed(2)}%`;

    const classNames = Object.keys(probs);
    const probValues = classNames.map(cn => probs[cn] * 100);

    // Build probability list
    probabilitiesListDiv.innerHTML = "";
    classNames.forEach((className, idx) => {
        const percent = probValues[idx];
        const colorIdx = idx % CLASS_COLORS.length;
        const barColor = CLASS_COLORS[colorIdx];
        const probItem = document.createElement("div");
        probItem.className = "prob-bar-item";
        probItem.innerHTML = `
            <div class="prob-header">
                <span><i class="fas fa-dot-circle" style="color:${barColor}; font-size: 10px;"></i> ${className.replace(/_/g, ' ').toUpperCase()}</span>
                <span style="font-weight:500;">${percent.toFixed(2)}%</span>
            </div>
            <div class="prob-bar-bg">
                <div class="prob-bar-fill" style="width: ${percent}%; background: ${barColor};"></div>
            </div>
        `;
        probabilitiesListDiv.appendChild(probItem);
    });

    // Create or update Chart.js bar chart
    const canvas = document.getElementById("probChart");
    if (chartInstance) {
        chartInstance.destroy();
    }
    const ctx = canvas.getContext("2d");
    chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: classNames.map(c => c.replace(/_/g, ' ').toUpperCase()),
            datasets: [{
                label: 'Xác suất (%)',
                data: probValues,
                backgroundColor: classNames.map((_, i) => CLASS_COLORS[i % CLASS_COLORS.length] + 'CC'),
                borderRadius: 10,
                barPercentage: 0.65,
                categoryPercentage: 0.8,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { labels: { color: '#cbd5e1', font: { size: 11 } }, position: 'top' },
                tooltip: { callbacks: { label: (ctx) => `${ctx.raw.toFixed(2)}%` } }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    grid: { color: '#1f2a44' },
                    title: { display: true, text: 'Xác suất (%)', color: '#94a3b8' },
                    ticks: { color: '#cbd5e6' }
                },
                x: {
                    ticks: { color: '#cbd5e6', font: { size: 10 }, rotation: 20 },
                    grid: { display: false }
                }
            }
        }
    });

    resultContainer.classList.remove("hidden");
    placeholderDiv.style.display = "none";
}

// Mock prediction for demo/fallback when backend is unavailable
function mockPredictionFromFile(fileName) {
    let hash = 0;
    if (fileName) {
        for (let i = 0; i < fileName.length; i++) hash = ((hash << 5) - hash) + fileName.charCodeAt(i);
    } else {
        hash = Date.now();
    }
    const rand = Math.abs(hash % 100) / 100;
    let classes = [...DEFAULT_CLASSES];
    let probs = {};
    let mainIndex = Math.floor(rand * classes.length);
    classes.forEach((cls, idx) => {
        if (idx === mainIndex) probs[cls] = 0.75 + (rand * 0.2);
        else probs[cls] = (0.2 / (classes.length - 1)) * (0.5 + Math.random() * 0.5);
    });
    let sum = Object.values(probs).reduce((a, b) => a + b, 0);
    for (let k in probs) probs[k] = probs[k] / sum;
    const predictedClassKey = Object.keys(probs).reduce((a, b) => probs[a] > probs[b] ? a : b);
    const confidenceVal = probs[predictedClassKey];
    return {
        predicted_class: predictedClassKey,
        confidence: confidenceVal,
        probabilities: probs
    };
}

// Show toast notification
function showToast(message, isWarning = true) {
    const toast = document.createElement('div');
    toast.innerHTML = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 20px;
        background: #2c2f36;
        color: #facc15;
        padding: 10px 18px;
        border-radius: 40px;
        font-size: 0.75rem;
        z-index: 999;
        border-left: 3px solid #facc15;
        max-width: 320px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    `;
    document.body.appendChild(toast);
    setTimeout(() => { toast.remove(); }, 5000);
}

// Main prediction handler
async function handlePrediction() {
    if (!selectedFile) {
        alert("Vui lòng chọn một ảnh MRI trước.");
        return;
    }

    loadingDiv.classList.remove("hidden");
    resultContainer.classList.add("hidden");
    placeholderDiv.style.display = "flex";

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            body: formData
        });

        if (!response.ok) {
            console.warn("Backend error, using demo mode");
            throw new Error(`Server responded ${response.status}`);
        }

        const data = await response.json();
        if (data && data.predicted_class && data.probabilities && typeof data.confidence !== "undefined") {
            renderPredictionResult(data);
        } else {
            throw new Error("Invalid API response structure");
        }
    } catch (error) {
        console.error("Prediction API error:", error);
        const mockResult = mockPredictionFromFile(selectedFile.name);
        renderPredictionResult(mockResult);
        showToast("⚠️ Kết nối server AI chưa sẵn sàng. Hiển thị mô phỏng minh họa (demo). Vui lòng chạy backend FastAPI để có dự đoán thực tế.");
    } finally {
        loadingDiv.classList.add("hidden");
    }
}

// Event listeners
predictBtn.addEventListener("click", handlePrediction);

// Upload area click triggers
document.getElementById("fileSelectLabel")?.addEventListener("click", (e) => {
    e.stopPropagation();
    imageInput.click();
});
document.getElementById("uploadTrigger")?.addEventListener("click", () => {
    imageInput.click();
});

// Initial reset
resetUploadDisplay();