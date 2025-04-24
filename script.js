document.addEventListener("DOMContentLoaded", function () {
    // Hiển thị trạng thái đăng nhập để debug
    console.log("Kiểm tra đăng nhập...");
    console.log("Cookie wp_token:", getCookie("wp_token"));
    console.log("isLoggedIn() trả về:", isLoggedIn());

    // Kiểm tra nếu đây không phải là trang đăng nhập
    if (!window.location.href.includes("/signin/")) {
        // Kiểm tra đăng nhập
        if (!isLoggedIn()) {
            // Lưu lại URL hiện tại để điều hướng trở lại sau khi đăng nhập
            localStorage.setItem("redirectAfterLogin", window.location.href);
            window.location.href = "/signin/";
        } else {
            // Đã đăng nhập, hiển thị thông tin người dùng
            displayUserInfo();

            // Kiểm tra nếu có URL chuyển hướng sau đăng nhập
            const redirectUrl = localStorage.getItem("redirectAfterLogin");
            if (redirectUrl && window.location.pathname === "/") {
                localStorage.removeItem("redirectAfterLogin");
                window.location.href = redirectUrl;
            }
        }
    } else {
        // Nếu đang ở trang đăng nhập nhưng đã đăng nhập rồi
        if (isLoggedIn()) {
            window.location.href = "../";
        }
    }
});

// Hàm hiển thị thông tin người dùng với thêm nút debug
function displayUserInfo() {
    const username = getCookie("username");

    // Tạo phần tử hiển thị thông tin người dùng
    if (username && !document.getElementById("userInfo")) {
        const userInfoDiv = document.createElement("div");
        userInfoDiv.id = "userInfo";
        userInfoDiv.className = "user-info";

        userInfoDiv.innerHTML = `
            <span>Xin chào, <span style="text-transform: uppercase">${username}</span></span>
            <button id="debugBtn" class="debug-btn">Debug</button>
            <button id="logoutBtn" class="logout-btn">Đăng xuất</button>
        `;

        document.body.insertBefore(userInfoDiv, document.body.firstChild);

        // Thêm sự kiện đăng xuất
        document.getElementById("logoutBtn").addEventListener("click", function () {
            logout();
        });

        // Thêm sự kiện hiển thị debug
        document.getElementById("debugBtn").addEventListener("click", function () {
            toggleDebugPanel();
        });
    }
}

// Hàm để hiển thị hoặc ẩn panel debug
function toggleDebugPanel() {
    let debugPanel = document.getElementById("debugPanel");

    if (debugPanel) {
        // Nếu panel đã tồn tại, ẩn/hiện nó
        if (debugPanel.style.display === "none") {
            debugPanel.style.display = "block";
        } else {
            debugPanel.style.display = "none";
        }
    } else {
        // Tạo panel debug mới
        debugPanel = document.createElement("div");
        debugPanel.id = "debugPanel";
        debugPanel.style.position = "fixed";
        debugPanel.style.bottom = "10px";
        debugPanel.style.right = "10px";
        debugPanel.style.backgroundColor = "rgba(0,0,0,0.7)";
        debugPanel.style.color = "white";
        debugPanel.style.padding = "10px";
        debugPanel.style.borderRadius = "5px";
        debugPanel.style.fontSize = "12px";
        debugPanel.style.maxWidth = "400px";
        debugPanel.style.zIndex = "9999";
        debugPanel.style.maxHeight = "80vh";
        debugPanel.style.overflowY = "auto";

        updateDebugInfo(debugPanel);

        // Thêm nút đóng panel
        const closeBtn = document.createElement("button");
        closeBtn.textContent = "Đóng";
        closeBtn.style.marginTop = "10px";
        closeBtn.style.marginRight = "5px";
        closeBtn.addEventListener("click", function () {
            debugPanel.style.display = "none";
        });
        debugPanel.appendChild(closeBtn);

        // Thêm nút làm mới thông tin
        const refreshBtn = document.createElement("button");
        refreshBtn.textContent = "Làm mới";
        refreshBtn.style.marginTop = "10px";
        refreshBtn.addEventListener("click", function () {
            updateDebugInfo(debugPanel);
        });
        debugPanel.appendChild(refreshBtn);

        // Thêm nút xóa cookies
        const clearCookiesBtn = document.createElement("button");
        clearCookiesBtn.textContent = "Xóa cookies";
        clearCookiesBtn.style.marginTop = "10px";
        clearCookiesBtn.style.marginLeft = "5px";
        clearCookiesBtn.addEventListener("click", function () {
            document.cookie.split(";").forEach(function (c) {
                document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/");
            });
            alert("Đã xóa tất cả cookie!");
            updateDebugInfo(debugPanel);
        });
        debugPanel.appendChild(clearCookiesBtn);

        document.body.appendChild(debugPanel);
    }
}

// Hàm cập nhật thông tin debug
function updateDebugInfo(panel) {
    // Hiển thị tất cả cookies
    // const allCookies = document.cookie
    //     .split("; ")
    //     .map((cookie) => {
    //         const [name, value] = cookie.split("=");
    //         return `${name}: ${value}`;
    //     })
    //     .join("<br>");

    const contentDiv = document.createElement("div");
    contentDiv.innerHTML = `
        <h4>Debug Auth</h4>
        <p><strong>URL:</strong> ${window.location.href}</p>
        <p><strong>isLoggedIn():</strong> ${isLoggedIn()}</p>
        <p><strong>wp_token:</strong> ${getCookie("wp_token") ? "Tồn tại" : "Không tồn tại"}</p>
        <p><strong>username:</strong> ${getCookie("username")}</p>
    `;

    // Xóa nội dung cũ (trừ các nút)
    const buttons = panel.querySelectorAll("button");
    panel.innerHTML = "";
    contentDiv.style.marginBottom = "10px";
    panel.appendChild(contentDiv);

    // Thêm lại các nút
    buttons.forEach((button) => panel.appendChild(button));
}

// Hàm kiểm tra đã đăng nhập chưa - cải thiện
function isLoggedIn() {
    const token = getCookie("wp_token");
    return token !== "" && token !== undefined && token !== null;
}

// Hàm lấy giá trị cookie
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
        return parts.pop().split(";").shift();
    }
    return "";
}

// Hàm đăng xuất
function logout() {
    // Xóa cookies
    document.cookie = "wp_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "username=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

    // Chuyển hướng về trang đăng nhập
    window.location.href = "/signin/";
}

// Thêm CSS cho nút debug và logout
const style = document.createElement("style");
style.textContent = `
    .user-info {
        position: fixed;
        top: 0;
        right: 0;
        background-color: #333;
        color: white;
        padding: 10px 15px;
        display: flex;
        align-items: center;
        gap: 15px;
        z-index: 1000;
    }

    .logout-btn {
        background-color: #f44336;
        color: white;
        border: none;
        padding: 5px 10px;
        border-radius: 3px;
        cursor: pointer;
    }

    .debug-btn {
        background-color: #2196F3;
        color: white;
        border: none;
        padding: 5px 10px;
        border-radius: 3px;
        cursor: pointer;
    }

    .logout-btn:hover {
        background-color: #d32f2f;
    }

    .debug-btn:hover {
        background-color: #0b7dda;
    }
`;
document.head.appendChild(style);
