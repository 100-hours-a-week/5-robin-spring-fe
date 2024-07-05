window.onload = async () => {
  await loadHeader();
};

async function loadHeader() {
  try {
    let apiBaseUrl = localStorage.getItem("API_BASE_URL");
    const headResponse = await fetch(`${apiBaseUrl}/header`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${localStorage.getItem('jwt')}`,
        "Content-Type": "application/json"
      },
      credentials: "include",
    });

    if (headResponse.status === 401) {
      await refreshAccessToken();
      // 토큰 갱신 후 다시 헤더 요청 시도
      await loadHeader();
      return;
    }

    if (!headResponse.ok) {
      throw new Error("헤더 불러오기 실패");
    }

    if (headResponse.status === 200) {

      const data = await headResponse.json();
      
      const decodedProfilePath = decodeURIComponent(data.profile_path);
      const headerList = document.getElementById("header");
      const div = document.createElement("article");
      div.classList.add("header");
      div.innerHTML = `
        <div style="width: 70px; height: 100%"></div>
        <span>아무 말 대잔치</span>
        <div class="header-right-overlay">
          <span class="mtp10">
            <img id="profileImage" src="${apiBaseUrl}/webapp/${decodedProfilePath}" class="header-right" />
          </span>
          <div class="header-right-board">
            <p><a href="/users/${data.id}">회원정보수정</a></p>
            <p><a href="/users/${data.id}/password">비밀번호수정</a></p>
            <p><a href="/">로그아웃</a></p>
          </div>
        </div>
      `;
      headerList.appendChild(div);

    }
  } catch (error) {
    console.error("헤더 로드 중 오류 발생:", error);
  }
}

async function refreshAccessToken() {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) {
    throw new Error("리프레시 토큰이 없습니다.");
  }
  let apiBaseUrl = localStorage.getItem("API_BASE_URL");
  const refreshResponse = await fetch(`${apiBaseUrl}/api/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ refreshToken })
  });

  if (!refreshResponse.ok) {
    throw new Error("토큰 갱신 실패");
  }

  const data = await refreshResponse.json();
  localStorage.setItem('jwt', data.accessToken);
}

const edit_send = async () => {
  let apiBaseUrl = localStorage.getItem("API_BASE_URL");
    const currentUrl = window.location.href;
    const userId = currentUrl.split("/").pop();
    const form = document.getElementById("edit_Form");
    const pwd = form.password.value;
    try {
        const response = await fetch(`${apiBaseUrl}/users/${userId}/password`, {
            method: "PATCH",
            headers: {
              "Authorization": `Bearer ${localStorage.getItem('jwt')}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ pwd }),
        });
        if(!response.ok) {
            throw new Error("비밀번호 수정 오류");
        }
        if(response.status === 200) {
            alert("수정완료");
            window.location.href = "/";
        }
    } catch(e) {
        console.log(e);
    }
}


document.getElementById("password").addEventListener("input", () => {
  const evalue = document.getElementById("password");
  const pattern =
    /^(?=.*[A-Z])(?=.*[a-z])(?=.*[!@#$%^*+=-])(?=.*[0-9]).{8,20}$/;
  const h_pwd = document.getElementById("helper_pwd");
  if (evalue.value === "") {
    h_pwd.textContent = "비밀번호를 입력해주세요";
  } else if (!pattern.test(evalue.value)) {
    h_pwd.textContent =
      "비밀번호는 8자 이상, 20자 이하이며, 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 합니다.";
  } else {
    h_pwd.textContent = "사용가능한 비밀번호입니다.";
  }
});
document.getElementById("password_chk").addEventListener("input", () => {
  const evalue = document.getElementById("password_chk");
  const h_pwd = document.getElementById("helper_pwd_chk");
  const evalue_chk = document.getElementById("password");
  if (evalue.value === "") {
    h_pwd.textContent = "비밀번호를 입력해주세요";
    document.getElementById("member-btn").style.backgroundColor = "#aca0eb";
  } else if (evalue.value != evalue_chk.value) {
    h_pwd.textContent = "비밀번호가 다릅니다.";
    document.getElementById("member-btn").style.backgroundColor = "#aca0eb";
  } else {
    h_pwd.textContent = "사용가능한 비밀번호입니다.";
    document.getElementById("member-btn").style.backgroundColor = "#7F6AEE";
  }
});
