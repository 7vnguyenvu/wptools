const BASE_URL = "https://7vnguyenvu.github.io/wptools";

document.addEventListener("DOMContentLoaded", function () {
    // Kiểm tra nếu người dùng đã đăng nhập, chuyển hướng về trang chính
    if (isLoggedIn()) {
        window.location.href = `${BASE_URL}/`;
    }

    const loginForm = document.getElementById("loginForm");
    const errorMessage = document.getElementById("errorMessage");

    loginForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        // Gửi yêu cầu xác thực đến WordPress REST API
        authenticateWithWordPress(username, password);
    });

    // Hàm xác thực với WordPress
    function authenticateWithWordPress(username, password) {
        // Hiển thị trạng thái đang xử lý
        errorMessage.textContent = "Đang xác thực...";
        errorMessage.style.display = "block";
        errorMessage.style.color = "#333";

        // URL của WordPress API - thay thế bằng URL thực của WordPress site của bạn
        const wpApiUrl = "https://lenart.vn/wp-json/jwt-auth/v1/token";

        fetch(wpApiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                username: username,
                password: password,
            }),
        })
            .then((response) => response.json())
            // Thêm vào login.js trong phần xử lý đăng nhập thành công
            .then((data) => {
                if (data.token) {
                    // Đăng nhập thành công, lưu token
                    setLoginSession(username, data.token);

                    // Chuyển hướng về trang chính hoặc trang đã lưu trước đó
                    const redirectUrl = localStorage.getItem("redirectAfterLogin");
                    if (redirectUrl) {
                        localStorage.removeItem("redirectAfterLogin");
                        window.location.href = redirectUrl;
                    } else {
                        window.location.href = `${BASE_URL}/`;
                    }
                } else {
                    // Hiển thị thông báo lỗi
                    errorMessage.textContent = "Tên đăng nhập hoặc mật khẩu không đúng!";
                    errorMessage.style.color = "red";
                    errorMessage.style.display = "block";
                }
            })
            .catch((error) => {
                errorMessage.textContent = "Lỗi kết nối đến máy chủ. Vui lòng thử lại sau.";
                errorMessage.style.color = "red";
                errorMessage.style.display = "block";
                console.error("Error:", error);
            });
    }
});

// Hàm kiểm tra đã đăng nhập chưa
function isLoggedIn() {
    return getCookie("wp_token") !== "";
}

// Tạo session đăng nhập (cookie với thời hạn 5 giờ)
function setLoginSession(username, token) {
    const expiryTime = new Date();
    expiryTime.setTime(expiryTime.getTime() + 5 * 60 * 60 * 1000); // 5 giờ

    // Thêm thông báo để debug
    console.log("Đang lưu token:", token);
    console.log("Thời hạn:", expiryTime.toUTCString());

    // Đảm bảo path là "/" để cookie khả dụng cho toàn bộ trang web
    document.cookie = `wp_token=${token}; expires=${expiryTime.toUTCString()}; path=/; SameSite=Lax`;
    document.cookie = `username=${username}; expires=${expiryTime.toUTCString()}; path=/; SameSite=Lax`;

    // Kiểm tra ngay sau khi lưu
    setTimeout(() => {
        console.log("Cookie wp_token sau khi lưu:", getCookie("wp_token"));
        console.log("Cookie username sau khi lưu:", getCookie("username"));
    }, 100);
}

// Hàm lấy giá trị cookie
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
    return "";
}
