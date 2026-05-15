// ============================================
// PREDICTION MODULE - MRI Classification
// ============================================

const API_URL = "http://127.0.0.1:8000/predict";

// DOM Elements
let imageInput, previewImage, predictBtn, loadingDiv, resultContainer;
let placeholderResult, predictedClassSpan, confidenceSpan, probabilitiesListDiv;
let fileNameDisplay, noPreviewMsg;

// State
let selectedFile = null;
let chartInstance = null;

const DEFAULT_CLASSES = ["glioma", "meningioma", "pituitary", "no_tumor"];

// Initialize prediction module
function initPredictModule() {
    // Get DOM elements - with null checks
    imageInput = document.getElementById("imageInput");
    previewImage = document.getElementById("previewImage");
    predictBtn = document.getElementById("predictBtn");
    loadingDiv = document.getElementById("loading");
    resultContainer = document.getElementById("result");
    placeholderResult = document.getElementById("placeholderResult");
    predictedClassSpan = document.getElementById("predictedClass");
    confidenceSpan = document.getElementById("confidence");
    probabilitiesListDiv = document.getElementById("probabilitiesList");
    fileNameDisplay = document.getElementById("fileNameDisplay");
    noPreviewMsg = document.getElementById("noPreviewMsg");
    
    // Remove old event listeners by cloning (avoid duplicates)
    if (imageInput) {
        const newImageInput = imageInput.cloneNode(true);
        imageInput.parentNode?.replaceChild(newImageInput, imageInput);
        imageInput = newImageInput;
        imageInput.addEventListener("change", handleFileSelect);
    }
    
    if (predictBtn) {
        const newPredictBtn = predictBtn.cloneNode(true);
        predictBtn.parentNode?.replaceChild(newPredictBtn, predictBtn);
        predictBtn = newPredictBtn;
        predictBtn.addEventListener("click", handlePrediction);
    }
    
    // Upload area click
    const uploadTrigger = document.getElementById("uploadTrigger");
    const fileSelectLabel = document.getElementById("fileSelectLabel");
    
    if (fileSelectLabel) {
        const newLabel = fileSelectLabel.cloneNode(true);
        fileSelectLabel.parentNode?.replaceChild(newLabel, fileSelectLabel);
        newLabel.addEventListener("click", (e) => {
            e.stopPropagation();
            imageInput?.click();
        });
    }
    
    if (uploadTrigger) {
        const newTrigger = uploadTrigger.cloneNode(true);
        uploadTrigger.parentNode?.replaceChild(newTrigger, uploadTrigger);
        newTrigger.addEventListener("click", () => imageInput?.click());
    }
    
    console.log("Predict module initialized");
}

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        selectedFile = file;
        if (fileNameDisplay) {
            fileNameDisplay.innerHTML = `<i class="fas fa-check-circle"></i> ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
        }
        
        const objectUrl = URL.createObjectURL(file);
        if (previewImage) {
            previewImage.src = objectUrl;
            previewImage.style.display = "block";
        }
        if (noPreviewMsg) noPreviewMsg.style.display = "none";
        
        if (resultContainer) resultContainer.classList.add("hidden");
        if (placeholderResult) placeholderResult.style.display = "flex";
        
        if (chartInstance) {
            chartInstance.destroy();
            chartInstance = null;
        }
        if (probabilitiesListDiv) probabilitiesListDiv.innerHTML = "";
    } else {
        resetUploadDisplay();
    }
}

function resetUploadDisplay() {
    selectedFile = null;
    if (previewImage) {
        previewImage.style.display = "none";
        previewImage.src = "";
    }
    if (noPreviewMsg) noPreviewMsg.style.display = "block";
    if (fileNameDisplay) fileNameDisplay.innerHTML = "";
    if (resultContainer) resultContainer.classList.add("hidden");
    if (placeholderResult) placeholderResult.style.display = "flex";
    if (chartInstance) {
        chartInstance.destroy();
        chartInstance = null;
    }
    if (probabilitiesListDiv) probabilitiesListDiv.innerHTML = "";
}

function renderPredictionResult(predictionData) {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        showToast('Vui lòng đăng nhập để dự đoán!', 'error');
        return;
    }
    
    const predicted = predictionData.predicted_class;
    const confValue = predictionData.confidence;
    const probs = predictionData.probabilities;
    
    if (predictedClassSpan) {
        predictedClassSpan.textContent = formatClassName(predicted);
    }
    if (confidenceSpan) {
        confidenceSpan.textContent = `Độ tin cậy: ${(confValue * 100).toFixed(2)}%`;
    }
    
    const classNames = Object.keys(probs);
    const probValues = classNames.map(cn => probs[cn] * 100);
    
    if (probabilitiesListDiv) {
        probabilitiesListDiv.innerHTML = "";
        classNames.forEach((className, idx) => {
            const percent = probValues[idx];
            const barColor = getClassColor(className, idx);
            const probItem = document.createElement("div");
            probItem.className = "prob-item";
            probItem.innerHTML = `
                <div class="prob-label">
                    <span><i class="fas fa-dot-circle" style="color:${barColor};"></i> ${formatClassName(className)}</span>
                    <span>${percent.toFixed(2)}%</span>
                </div>
                <div class="prob-bar-bg">
                    <div class="prob-bar-fill" style="width: ${percent}%; background: ${barColor};"></div>
                </div>
            `;
            probabilitiesListDiv.appendChild(probItem);
        });
    }
    
    const canvas = document.getElementById("probChart");
    if (canvas) {
        if (chartInstance) chartInstance.destroy();
        chartInstance = new Chart(canvas, {
            type: 'bar',
            data: {
                labels: classNames.map(c => formatClassName(c)),
                datasets: [{
                    label: 'Xác suất (%)',
                    data: probValues,
                    backgroundColor: classNames.map((_, i) => getClassColor(classNames[i], i) + 'CC'),
                    borderRadius: 8,
                    barPercentage: 0.7
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { labels: { color: '#cbd5e1', font: { size: 11 } } },
                    tooltip: { callbacks: { label: (ctx) => `${ctx.raw.toFixed(2)}%` } }
                },
                scales: {
                    y: { 
                        beginAtZero: true, 
                        max: 100,
                        grid: { color: '#1f2a44' },
                        ticks: { color: '#cbd5e6' }
                    },
                    x: { 
                        ticks: { color: '#cbd5e6', font: { size: 10 } }
                    }
                }
            }
        });
    }
    
    if (resultContainer) resultContainer.classList.remove("hidden");
    if (placeholderResult) placeholderResult.style.display = "none";
    
    incrementUserPredictions();
    if (typeof updateHomeStats === 'function') updateHomeStats();
}

function mockPredictionFromFile(fileName) {
    let hash = 0;
    if (fileName) {
        for (let i = 0; i < fileName.length; i++) {
            hash = ((hash << 5) - hash) + fileName.charCodeAt(i);
        }
    }
    const rand = Math.abs(hash % 100) / 100;
    let classes = [...DEFAULT_CLASSES];
    let probs = {};
    let mainIndex = Math.floor(rand * classes.length);
    
    classes.forEach((cls, idx) => {
        if (idx === mainIndex) {
            probs[cls] = 0.75 + (rand * 0.2);
        } else {
            probs[cls] = (0.2 / (classes.length - 1)) * (0.5 + Math.random() * 0.5);
        }
    });
    
    let sum = Object.values(probs).reduce((a, b) => a + b, 0);
    for (let k in probs) probs[k] = probs[k] / sum;
    
    const predictedClassKey = Object.keys(probs).reduce((a, b) => probs[a] > probs[b] ? a : b);
    
    return {
        predicted_class: predictedClassKey,
        confidence: probs[predictedClassKey],
        probabilities: probs
    };
}

async function handlePrediction() {
    if (!selectedFile) {
        showToast('Vui lòng chọn một ảnh MRI', 'error');
        return;
    }
    
    const currentUser = getCurrentUser();
    if (!currentUser) {
        showToast('Vui lòng đăng nhập để sử dụng tính năng dự đoán!', 'error');
        return;
    }
    
    if (loadingDiv) loadingDiv.classList.remove("hidden");
    if (resultContainer) resultContainer.classList.add("hidden");
    if (placeholderResult) placeholderResult.style.display = "flex";
    
    const formData = new FormData();
    formData.append("file", selectedFile);
    
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            body: formData
        });
        
        if (!response.ok) {
            throw new Error("Backend error");
        }
        
        const data = await response.json();
        if (data && data.predicted_class && data.probabilities) {
            renderPredictionResult(data);
            showToast('Dự đoán thành công!', 'success');
        } else {
            throw new Error("Invalid response");
        }
    } catch (error) {
        console.warn("Using mock prediction due to:", error);
        const mockResult = mockPredictionFromFile(selectedFile.name);
        renderPredictionResult(mockResult);
        showToast('Đang sử dụng chế độ demo (kết nối server chưa sẵn sàng)', 'info');
    } finally {
        if (loadingDiv) loadingDiv.classList.add("hidden");
    }
}