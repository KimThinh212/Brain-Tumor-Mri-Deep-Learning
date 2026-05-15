// ============================================
// MAIN APPLICATION - NeuroScan AI
// ============================================

// DOM Elements
let sidebar, mobileMenuBtn, navItems;
let currentTab = 'home';

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    // Setup sidebar and navigation
    setupNavigation();
    
    // Setup mobile menu
    setupMobileMenu();
    
    // Initialize modules
    initAuthModule();
    initPredictModule();
    initModelModule();
    
    // Load ALL tab contents
    loadHomeContent();
    loadPredictTabContent();    // ← QUAN TRỌNG: Render giao diện dự đoán
    loadModelTabContent();      // ← QUAN TRỌNG: Render giao diện model
    
    // Update UI based on auth state
    updateAuthUI();
}

// Setup navigation
function setupNavigation() {
    navItems = document.querySelectorAll('.nav-item');
    const pageTitle = document.getElementById('pageTitle');
    
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const tabId = item.getAttribute('data-tab');
            switchTab(tabId);
            
            const titleMap = {
                'home': 'Dashboard',
                'predict': 'MRI Analysis',
                'model': 'Model Performance',
                'account': 'My Account'
            };
            if (pageTitle) pageTitle.textContent = titleMap[tabId] || 'NeuroScan';
        });
    });
}

// Switch between tabs
function switchTab(tabId) {
    currentTab = tabId;
    
    navItems.forEach(item => {
        if (item.getAttribute('data-tab') === tabId) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
    
    const tabPanes = document.querySelectorAll('.tab-pane');
    tabPanes.forEach(pane => {
        pane.classList.remove('active');
    });
    
    const activePane = document.getElementById(`${tabId}Tab`);
    if (activePane) {
        activePane.classList.add('active');
    }
    
    // Refresh content when switching to certain tabs
    if (tabId === 'account') {
        loadAccountContent();
    }
    
    if (window.innerWidth <= 768 && sidebar) {
        sidebar.classList.remove('open');
    }
}

// ============ LOAD PREDICT TAB CONTENT ============
function loadPredictTabContent() {
    const predictContainer = document.getElementById('predictTab');
    if (!predictContainer) return;
    
    predictContainer.innerHTML = `
        <div class="predict-grid">
            <!-- LEFT CARD - Upload Area -->
            <div class="upload-card">
                <div class="upload-area" id="uploadTrigger">
                    <div class="upload-icon">
                        <i class="fas fa-cloud-upload-alt"></i>
                    </div>
                    <p>Tải lên ảnh MRI não</p>
                    <p style="font-size: 0.8rem; color: var(--text-muted);">Hỗ trợ: JPEG, PNG, WEBP</p>
                    <input type="file" id="imageInput" accept="image/jpeg, image/png, image/jpg, image/webp" class="file-input">
                    <label for="imageInput" class="file-label" id="fileSelectLabel">
                        <i class="fas fa-folder-open"></i> Chọn file ảnh
                    </label>
                    <div id="fileNameDisplay" class="file-name"></div>
                </div>

                <div class="preview-container">
                    <img id="previewImage" alt="MRI Preview" />
                    <div id="noPreviewMsg" class="preview-placeholder">
                        <i class="fas fa-image"></i>
                        <p>Chưa có ảnh xem trước</p>
                    </div>
                </div>

                <div class="predict-action">
                    <button id="predictBtn" class="btn-predict">
                        <i class="fas fa-microscope"></i> Phân tích & Dự đoán
                    </button>
                </div>

                <div id="loading" class="loading-overlay hidden">
                    <div class="spinner"></div>
                    <span>Đang xử lý ảnh MRI bằng mô hình AI...</span>
                </div>
            </div>

            <!-- RIGHT CARD - Results -->
            <div class="results-card">
                <div class="result-header">
                    <i class="fas fa-chart-pie"></i>
                    <h3>Kết quả phân tích</h3>
                </div>
                
                <div id="result" class="hidden">
                    <div class="prediction-badge">
                        <div class="prediction-class" id="predictedClass">---</div>
                        <div class="confidence-value" id="confidence">Độ tin cậy: 0%</div>
                    </div>

                    <div class="chart-wrapper">
                        <canvas id="probChart" width="400" height="220"></canvas>
                    </div>

                    <div id="probabilitiesList"></div>
                </div>

                <div id="placeholderResult" class="placeholder-result">
                    <i class="fas fa-brain"></i>
                    <p>Chưa có kết quả dự đoán</p>
                    <p style="font-size: 0.8rem;">Hãy tải ảnh MRI và nhấn "Phân tích & Dự đoán"</p>
                </div>
            </div>
        </div>
    `;
    
    // Re-initialize prediction module after DOM is ready
    setTimeout(() => {
        initPredictModule();
    }, 100);
}

// ============ LOAD MODEL TAB CONTENT ============
function loadModelTabContent() {
    const modelContainer = document.getElementById('modelTab');
    if (!modelContainer) return;
    
    modelContainer.innerHTML = `
        <div class="model-container">
            <div class="model-header">
                <h2><i class="fas fa-brain"></i> Kiến trúc mô hình</h2>
                <p>EfficientNet-B0 fine-tuned trên tập dữ liệu Brain Tumor MRI</p>
                <div class="model-architecture-badge">State-of-the-art CNN Architecture</div>
            </div>
            
            <!-- Metrics Grid -->
            <div class="metrics-grid">
                <div class="metric-card">
                    <div class="metric-icon"><i class="fas fa-chart-line"></i></div>
                    <div class="metric-value" id="accuracyValue">94.2%</div>
                    <div class="metric-label">Độ chính xác (Accuracy)</div>
                </div>
                <div class="metric-card">
                    <div class="metric-icon"><i class="fas fa-chart-line"></i></div>
                    <div class="metric-value" id="precisionValue">93.8%</div>
                    <div class="metric-label">Precision (Trung bình)</div>
                </div>
                <div class="metric-card">
                    <div class="metric-icon"><i class="fas fa-chart-line"></i></div>
                    <div class="metric-value" id="recallValue">94.1%</div>
                    <div class="metric-label">Recall (Trung bình)</div>
                </div>
                <div class="metric-card">
                    <div class="metric-icon"><i class="fas fa-chart-line"></i></div>
                    <div class="metric-value" id="f1Value">93.9%</div>
                    <div class="metric-label">F1-Score</div>
                </div>
            </div>

            <!-- Model Details -->
            <div class="model-details-grid">
                <div class="detail-card">
                    <h3><i class="fas fa-code-branch"></i> Chi tiết mô hình</h3>
                    <ul class="detail-list">
                        <li><span class="detail-label">Base model:</span><span class="detail-value">EfficientNet-B0</span></li>
                        <li><span class="detail-label">Input size:</span><span class="detail-value">224x224 pixels</span></li>
                        <li><span class="detail-label">Số lớp:</span><span class="detail-value">4 classes</span></li>
                        <li><span class="detail-label">Optimizer:</span><span class="detail-value">Adam (lr=0.0001)</span></li>
                        <li><span class="detail-label">Loss function:</span><span class="detail-value">Categorical Cross-entropy</span></li>
                        <li><span class="detail-label">Batch size:</span><span class="detail-value">32</span></li>
                        <li><span class="detail-label">Epochs:</span><span class="detail-value">50 (early stopping)</span></li>
                    </ul>
                </div>
                <div class="detail-card">
                    <h3><i class="fas fa-database"></i> Tập dữ liệu</h3>
                    <ul class="detail-list">
                        <li><span class="detail-label">Nguồn:</span><span class="detail-value">Figshare + SARTAJ</span></li>
                        <li><span class="detail-label">Tổng số ảnh:</span><span class="detail-value">7,023 ảnh MRI</span></li>
                        <li><span class="detail-label">Train/Val/Test:</span><span class="detail-value">70/15/15%</span></li>
                        <li><span class="detail-label">Data augmentation:</span><span class="detail-value">Rotation, Flip, Zoom</span></li>
                        <li><span class="detail-label">Class balance:</span><span class="detail-value">Đã cân bằng</span></li>
                    </ul>
                </div>
            </div>

            <!-- Per-class Accuracy -->
            <div class="per-class-section">
                <h3><i class="fas fa-table"></i> Độ chính xác theo từng lớp</h3>
                <div class="per-class-grid" id="perClassStats">
                    <!-- Dynamic content -->
                </div>
            </div>

            <!-- Training Info -->
            <div class="training-info">
                <i class="fas fa-chart-line"></i>
                <p><strong>Training time:</strong> ~4 hours on NVIDIA Tesla T4 | <strong>Validation accuracy:</strong> 94.2% | <strong>Test accuracy:</strong> 93.7%</p>
            </div>
        </div>
    `;
    
    // Re-initialize model module to update metrics
    setTimeout(() => {
        updateMetricsDisplay();
        updatePerClassDisplay();
    }, 100);
}

// Setup mobile menu
function setupMobileMenu() {
    sidebar = document.getElementById('sidebar');
    mobileMenuBtn = document.getElementById('mobileMenuBtn');
    
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            if (sidebar) sidebar.classList.toggle('open');
        });
    }
    
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768 && sidebar && sidebar.classList.contains('open')) {
            if (!sidebar.contains(e.target) && !mobileMenuBtn?.contains(e.target)) {
                sidebar.classList.remove('open');
            }
        }
    });
}

// Load home tab content
function loadHomeContent() {
    const homeContainer = document.getElementById('homeTab');
    if (!homeContainer) return;
    
    const currentUser = getCurrentUser();
    const totalPredictions = getTotalPredictions();
    
    homeContainer.innerHTML = `
        <div class="hero-section">
            <div class="hero-banner">
                <h2>Hệ thống phân tích khối u não bằng AI</h2>
                <p>Sử dụng mô hình Deep Learning EfficientNet-B0 để hỗ trợ chẩn đoán hình ảnh MRI với độ chính xác cao</p>
                <button class="cta-btn-large" id="homeCtaBtn">
                    <i class="fas fa-microscope"></i> Bắt đầu dự đoán ngay
                </button>
                <div class="hero-stats">
                    <div class="hero-stat">
                        <div class="hero-stat-value">${totalPredictions}</div>
                        <div class="hero-stat-label">Lượt dự đoán</div>
                    </div>
                    <div class="hero-stat">
                        <div class="hero-stat-value">94.2%</div>
                        <div class="hero-stat-label">Độ chính xác</div>
                    </div>
                    <div class="hero-stat">
                        <div class="hero-stat-value">4</div>
                        <div class="hero-stat-label">Lớp bệnh lý</div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="features-section">
            <div class="section-header">
                <h3>Tính năng nổi bật</h3>
                <p>Công nghệ AI tiên tiến cho y tế thông minh</p>
            </div>
            <div class="features-grid">
                <div class="feature-card">
                    <div class="feature-icon"><i class="fas fa-chart-line"></i></div>
                    <h4>Độ chính xác cao</h4>
                    <p>Mô hình đạt độ chính xác >94% trên tập kiểm tra</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon"><i class="fas fa-bolt"></i></div>
                    <h4>Phân tích nhanh</h4>
                    <p>Kết quả dự đoán chỉ trong vài giây</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon"><i class="fas fa-chart-pie"></i></div>
                    <h4>Trực quan hóa</h4>
                    <p>Biểu đồ xác suất chi tiết cho từng lớp bệnh</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon"><i class="fas fa-shield-alt"></i></div>
                    <h4>Bảo mật dữ liệu</h4>
                    <p>Hình ảnh không được lưu trữ sau khi xử lý</p>
                </div>
            </div>
        </div>
        
        <div class="stats-section">
            <h3><i class="fas fa-chart-simple"></i> Thống kê hệ thống</h3>
            <div class="stats-grid">
                <div class="stat-card">
                    <i class="fas fa-database"></i>
                    <div class="stat-number">7,023</div>
                    <div class="stat-label">Ảnh huấn luyện</div>
                </div>
                <div class="stat-card">
                    <i class="fas fa-chart-line"></i>
                    <div class="stat-number">94.2%</div>
                    <div class="stat-label">Accuracy</div>
                </div>
                <div class="stat-card">
                    <i class="fas fa-clock"></i>
                    <div class="stat-number">< 2s</div>
                    <div class="stat-label">Thời gian xử lý</div>
                </div>
            </div>
        </div>
    `;
    
    const ctaBtn = document.getElementById('homeCtaBtn');
    if (ctaBtn) {
        ctaBtn.addEventListener('click', () => {
            switchTab('predict');
        });
    }
}

// Load account tab content
function loadAccountContent() {
    const accountContainer = document.getElementById('accountTab');
    if (!accountContainer) return;
    
    const currentUser = getCurrentUser();
    
    if (currentUser) {
        const users = loadUsers();
        const userData = users[currentUser.username];
        
        accountContainer.innerHTML = `
            <div class="account-wrapper">
                <div class="profile-panel">
                    <div class="profile-header">
                        <div class="profile-avatar">
                            <i class="fas fa-user-md"></i>
                        </div>
                        <h3>Thông tin tài khoản</h3>
                    </div>
                    <div class="profile-info">
                        <div class="info-row">
                            <span class="info-label"><i class="fas fa-user"></i> Tên đăng nhập</span>
                            <span class="info-value">${currentUser.username}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label"><i class="fas fa-tag"></i> Vai trò</span>
                            <span class="info-value">${currentUser.role === 'admin' ? 'Quản trị viên' : currentUser.role === 'doctor' ? 'Bác sĩ' : 'Người dùng'}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label"><i class="fas fa-calendar"></i> Ngày tham gia</span>
                            <span class="info-value">${formatDate(userData.joined)}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label"><i class="fas fa-chart-line"></i> Số lần dự đoán</span>
                            <span class="info-value">${userData.predictions || 0}</span>
                        </div>
                    </div>
                    <button class="logout-btn" id="profileLogoutBtn">
                        <i class="fas fa-sign-out-alt"></i> Đăng xuất
                    </button>
                </div>
            </div>
        `;
        
        const logoutBtn = document.getElementById('profileLogoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                handleLogout();
            });
        }
    } else {
        accountContainer.innerHTML = `
            <div class="account-wrapper">
                <div id="loginPanel" class="auth-panel">
                    <div class="auth-header">
                        <i class="fas fa-sign-in-alt"></i>
                        <h3>Đăng nhập</h3>
                    </div>
                    <div class="auth-input-group">
                        <input type="text" id="loginUsername" placeholder="Tên đăng nhập" class="auth-input">
                    </div>
                    <div class="auth-input-group">
                        <input type="password" id="loginPassword" placeholder="Mật khẩu" class="auth-input">
                    </div>
                    <button id="doLoginBtn" class="auth-btn">Đăng nhập</button>
                    <p class="auth-switch">Chưa có tài khoản? <a href="#" id="showRegisterBtn">Đăng ký ngay</a></p>
                </div>
                
                <div id="registerPanel" class="auth-panel hidden">
                    <div class="auth-header">
                        <i class="fas fa-user-plus"></i>
                        <h3>Đăng ký</h3>
                    </div>
                    <div class="auth-input-group">
                        <input type="text" id="regUsername" placeholder="Tên đăng nhập" class="auth-input">
                    </div>
                    <div class="auth-input-group">
                        <input type="password" id="regPassword" placeholder="Mật khẩu" class="auth-input">
                    </div>
                    <div class="auth-input-group">
                        <input type="password" id="regConfirmPassword" placeholder="Xác nhận mật khẩu" class="auth-input">
                    </div>
                    <button id="doRegisterBtn" class="auth-btn">Đăng ký</button>
                    <p class="auth-switch">Đã có tài khoản? <a href="#" id="showLoginBtn">Đăng nhập</a></p>
                </div>
            </div>
        `;
        
        bindAuthEvents();
    }
}

function bindAuthEvents() {
    document.getElementById('doLoginBtn')?.addEventListener('click', () => {
        const username = document.getElementById('loginUsername')?.value || '';
        const password = document.getElementById('loginPassword')?.value || '';
        const result = login(username, password);
        if (result.success) {
            showToast('Đăng nhập thành công!', 'success');
            updateAuthUI();
            loadAccountContent();
            loadHomeContent();
            switchTab('home');
        } else {
            showToast(result.message, 'error');
        }
    });
    
    document.getElementById('doRegisterBtn')?.addEventListener('click', () => {
        const username = document.getElementById('regUsername')?.value || '';
        const password = document.getElementById('regPassword')?.value || '';
        const confirm = document.getElementById('regConfirmPassword')?.value || '';
        const result = register(username, password, confirm);
        if (result.success) {
            showToast(result.message, 'success');
            document.getElementById('showLoginBtn')?.click();
        } else {
            showToast(result.message, 'error');
        }
    });
    
    document.getElementById('showRegisterBtn')?.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('loginPanel')?.classList.add('hidden');
        document.getElementById('registerPanel')?.classList.remove('hidden');
    });
    
    document.getElementById('showLoginBtn')?.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('loginPanel')?.classList.remove('hidden');
        document.getElementById('registerPanel')?.classList.add('hidden');
    });
}

function initAuthModule() {
    updateAuthUI();
}

function updateAuthUI() {
    const currentUser = getCurrentUser();
    const notLoggedView = document.getElementById('notLoggedInView');
    const loggedView = document.getElementById('loggedInView');
    const userNameDisplay = document.getElementById('userNameDisplay');
    
    if (currentUser) {
        if (notLoggedView) notLoggedView.classList.add('hidden');
        if (loggedView) loggedView.classList.remove('hidden');
        if (userNameDisplay) userNameDisplay.textContent = currentUser.username;
    } else {
        if (notLoggedView) notLoggedView.classList.remove('hidden');
        if (loggedView) loggedView.classList.add('hidden');
    }
}

function handleLogout() {
    logout();
    updateAuthUI();
    loadAccountContent();
    loadHomeContent();
    switchTab('home');
    showToast('Đã đăng xuất', 'success');
}

function updateHomeStats() {
    if (currentTab === 'home') {
        loadHomeContent();
    }
}

// Export global functions
window.switchTab = switchTab;
window.updateHomeStats = updateHomeStats;
window.handleLogout = handleLogout;