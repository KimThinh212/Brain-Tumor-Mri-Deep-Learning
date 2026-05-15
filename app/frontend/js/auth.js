// ============================================
// AUTHENTICATION MODULE
// ============================================

// User data storage key
const STORAGE_KEY = 'neuroscan_users';
const CURRENT_USER_KEY = 'neuroscan_current_user';

// Load users from localStorage
function loadUsers() {
    const users = localStorage.getItem(STORAGE_KEY);
    if (!users) {
        // Create default users
        const defaultUsers = {
            'admin': { 
                password: 'admin123', 
                joined: '2025-01-01', 
                predictions: 0,
                role: 'admin'
            },
            'doctor': { 
                password: 'doctor123', 
                joined: '2025-01-15', 
                predictions: 0,
                role: 'doctor'
            },
            'guest': { 
                password: 'guest123', 
                joined: '2025-02-01', 
                predictions: 0,
                role: 'guest'
            }
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultUsers));
        return defaultUsers;
    }
    return JSON.parse(users);
}

// Save users to localStorage
function saveUsers(users) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

// Get current logged in user
function getCurrentUser() {
    const userJson = localStorage.getItem(CURRENT_USER_KEY);
    if (userJson) {
        return JSON.parse(userJson);
    }
    return null;
}

// Set current user
function setCurrentUser(username) {
    if (username) {
        const users = loadUsers();
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify({
            username: username,
            role: users[username]?.role || 'user',
            predictions: users[username]?.predictions || 0
        }));
    } else {
        localStorage.removeItem(CURRENT_USER_KEY);
    }
}

// Login function
function login(username, password) {
    const users = loadUsers();
    
    if (users[username] && users[username].password === password) {
        setCurrentUser(username);
        return { success: true, user: username };
    }
    return { success: false, message: 'Sai tên đăng nhập hoặc mật khẩu' };
}

// Register function
function register(username, password, confirmPassword) {
    // Validation
    if (!username || !password) {
        return { success: false, message: 'Vui lòng nhập đầy đủ thông tin' };
    }
    
    if (password !== confirmPassword) {
        return { success: false, message: 'Mật khẩu xác nhận không khớp' };
    }
    
    if (password.length < 4) {
        return { success: false, message: 'Mật khẩu phải có ít nhất 4 ký tự' };
    }
    
    const users = loadUsers();
    
    if (users[username]) {
        return { success: false, message: 'Tên đăng nhập đã tồn tại' };
    }
    
    users[username] = {
        password: password,
        joined: getCurrentDate(),
        predictions: 0,
        role: 'user'
    };
    
    saveUsers(users);
    return { success: true, message: 'Đăng ký thành công!' };
}

// Logout function
function logout() {
    setCurrentUser(null);
}

// Update user prediction count
function incrementUserPredictions() {
    const currentUser = getCurrentUser();
    if (currentUser) {
        const users = loadUsers();
        if (users[currentUser.username]) {
            users[currentUser.username].predictions = (users[currentUser.username].predictions || 0) + 1;
            saveUsers(users);
            // Update current user cache
            setCurrentUser(currentUser.username);
        }
    }
}

// Get total predictions across all users
function getTotalPredictions() {
    const users = loadUsers();
    let total = 0;
    Object.values(users).forEach(user => {
        total += (user.predictions || 0);
    });
    return total;
}