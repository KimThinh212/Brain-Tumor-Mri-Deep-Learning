// ============================================
// MODEL METRICS MODULE
// ============================================

const modelMetrics = {
    accuracy: 42.49,
    precision: 46.48,
    recall: 38.59,
    f1Score: 38.88
};

// Per-class metrics from classification report (test set, 1725 samples)
const perClassMetrics = [
    { name: 'Astrocytoma T1',         f1: 25.93, support: 60  },
    { name: 'Astrocytoma T1C+',       f1: 14.63, support: 67  },
    { name: 'Astrocytoma T2',         f1: 18.52, support: 43  },
    { name: 'Ependymoma T1',          f1: 51.61, support: 48  },
    { name: 'Ependymoma T1C+',        f1: 46.32, support: 57  },
    { name: 'Ependymoma T2',          f1: 43.01, support: 54  },
    { name: 'Glioma T1',              f1: 50.83, support: 79  },
    { name: 'Glioma T1C+',            f1: 42.86, support: 83  },
    { name: 'Glioma T2',              f1: 32.52, support: 62  },
    { name: 'Hemangiopericytoma T1',  f1: 37.04, support: 28  },
    { name: 'Hemangiopericytoma T1C+',f1: 66.67, support: 47  },
    { name: 'Hemangiopericytoma T2',  f1: 41.67, support: 19  },
    { name: 'Meningioma T1',          f1: 47.27, support: 96  },
    { name: 'Meningioma T1C+',        f1: 49.55, support: 148 },
    { name: 'Meningioma T2',          f1: 14.89, support: 70  },
    { name: 'Neurocytoma T1',         f1:  0.00, support: 29  },
    { name: 'Neurocytoma T1C+',       f1: 30.77, support: 39  },
    { name: 'Neurocytoma T2',         f1: 47.27, support: 27  },
    { name: 'Normal T1',              f1: 58.00, support: 63  },
    { name: 'Normal T1C+',            f1: 72.97, support: 41  },
    { name: 'Normal T2',              f1: 61.16, support: 58  },
    { name: 'Oligodendroglioma T1',   f1:  8.89, support: 34  },
    { name: 'Oligodendroglioma T1C+', f1: 29.79, support: 30  },
    { name: 'Oligodendroglioma T2',   f1: 23.08, support: 22  },
    { name: 'Other T1',               f1: 30.77, support: 63  },
    { name: 'Other T1C+',             f1: 36.14, support: 114 },
    { name: 'Other T2',               f1: 27.91, support: 56  },
    { name: 'Schwannoma T1',          f1: 47.14, support: 55  },
    { name: 'Schwannoma T1C+',        f1: 63.64, support: 86  },
    { name: 'Schwannoma T2',          f1: 45.57, support: 47  }
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
            <div class="class-accuracy">${cls.f1.toFixed(2)}%</div>
            <div class="class-support">F1-Score | Mẫu test: ${cls.support}</div>
        </div>
    `).join('');
}

// Export to global
window.initModelModule = initModelModule;
window.updateMetricsDisplay = updateMetricsDisplay;
window.updatePerClassDisplay = updatePerClassDisplay;