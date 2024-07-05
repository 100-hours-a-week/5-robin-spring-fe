const getConfig = async () => {
  try {
    const response = await fetch("/config", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const config = await response.json();
    localStorage.setItem("API_BASE_URL", config.BACKEND_IP);
    return config.BACKEND_IP;
  } catch (error) {
    console.error("Error fetching config:", error);
  }
};

const login_sendit = async () => {
  const apiBaseUrl = await getConfig();
    const email = document.getElementById("email").value;
    const pwd = document.getElementById("password").value;
    //const pattern = /^[A-Za-z0-9_\.\-]+@[A-Za-z0-9\-]+\.[A-za-z0-9\-]+/;
    if (!checkEmail(email)) {
    alert("올바른 이메일 주소 형식을 입력해주세요. (예: example@example.com)");
    return false;
    }
    if (pwd.length < 7 || pwd == null || !checkPwd(pwd)) {
    alert("입력하신 계정정보가 정확하지 않았습니다.");
    return false;
    }

    try {
        const response = await fetch(`${apiBaseUrl}/users/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({ email, pwd }),
        });
        if(!response.ok) {
            if (response.status === 401) {
                document.getElementById("helper-text").textContent = "비밀번호가 다릅니다.";
            }
            document.getElementById("helper-text").textContent = "비밀번호가 다릅니다.";
            throw new Error("Network response was not ok");
        }
        if (response.status === 200) {
            const data = await response.json();
            localStorage.setItem('jwt', data.token);
            localStorage.setItem('refreshToken', data.refreshToken);
            localStorage.setItem("API_BASE_URL", apiBaseUrl);
            window.location.href = "/posts";
        }
        const data = await response.json();
    } catch (e) {
        console.error("There has been a problem with your fetch operation:", e);
    }
};

function checkEmail(email) {
  const pattern = /^[A-Za-z\.\-]+@[A-Za-z\-]+\.[A-za-z\-]+/;
  if (email.length < 7 || email == null || !pattern.test(email)) {
    return false;
  } else {
    return true;
  }
}
function checkPwd(pwd) {
  const pattern =
    /^(?=.*[A-Z])(?=.*[a-z])(?=.*[!@#$%^*+=-])(?=.*[0-9]).{8,20}$/;
  if (!pattern.test(pwd)) {
    return false;
  } else {
    return true;
  }
}

const pattern = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[!@#$%^*+=-])(?=.*[0-9]).{8,20}$/;
document.getElementById("password").addEventListener("input", () => {
  const pwdc = document.getElementById("password");
  const pwdHelper = document.getElementById("helper-text");
  if (pwdc.value == "") {
    pwdHelper.textContent = "*비밀번호를 입력해주세요.";
    document.getElementById("login-btn").style.backgroundColor = "#aca0eb";
  } else if (!pattern.test(pwdc.value)) {
    pwdHelper.textContent =
      "*비밀번호는 8자 이상, 20자 이하이며, 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 합니다.";
    document.getElementById("login-btn").style.backgroundColor = "#aca0eb";
  } else {
    pwdHelper.textContent =
      "";
    document.getElementById("login-btn").style.backgroundColor = "#7F6AEE";
  }
});



