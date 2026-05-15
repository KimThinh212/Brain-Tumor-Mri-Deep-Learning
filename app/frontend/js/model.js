// ============================================
// MODEL METRICS MODULE
// ============================================

const modelMetrics = {
    accuracy: 94.2,
    precision: 93.8,
    recall: 94.1,
    f1Score: 93.9
};

const perClassMetrics = [
    { name: 'Glioma', accuracy: 94.5, support: 825 },
    { name: 'Meningioma', accuracy: 92.8, support: 785 },
    { name: 'Pituitary', accuracy: 95.2, support: 802 },
    { name: 'No Tumor', accuracy: 94.0, support: 795 }
];

function initModelModule() {
    updateMetricsDisplay();
    updatePerClassDisplay();
}

function updateMetricsDisplay() {
    const accuracyEl = document.getElementById('accuracyValue');
    const precisionEl = document.getElementById('precisionValue');
    const recallEl = document.getElementById('recallValue');
    const f1El = document.getElementById('f1Value');
    
    if (accuracyEl) accuracyEl.textContent = `${modelMetrics.accuracy}%`;
    if (precisionEl) precisionEl.textContent = `${modelMetrics.precision}%`;
    if (recallEl) recallEl.textContent = `${modelMetrics.recall}%`;
    if (f1El) f1El.textContent = `${modelMetrics.f1Score}%`;
}

function updatePerClassDisplay() {
    const container = document.getElementById('perClassStats');
    if (!container) return;
    
    container.innerHTML = perClassMetrics.map(cls => `
        <div class="class-card">
            <div class="class-name">${cls.name}</div>
            <div class="class-accuracy">${cls.accuracy}%</div>
            <div class="class-support">Số mẫu: ${cls.support}</div>
        </div>
    `).join('');
}

// Export to global
window.initModelModule = initModelModule;
window.updateMetricsDisplay = updateMetricsDisplay;
window.updatePerClassDisplay = updatePerClassDisplay;