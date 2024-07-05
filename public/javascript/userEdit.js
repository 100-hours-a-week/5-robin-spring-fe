window.onload = async () => {
  await loadHeader();
  try {
    const jsonData = await fetchPostData();
    renderViewUser(jsonData);
  } catch (e) {
    console.error(e);
  }
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

async function fetchPostData() {
  const currentUrl = window.location.href;
  const userId = currentUrl.split("/").pop();
  let apiBaseUrl = localStorage.getItem("API_BASE_URL");
  const response = await fetch(`${apiBaseUrl}/users/${userId}`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${localStorage.getItem('jwt')}`,
      "Content-Type": "application/json"
    },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("사용자 정보 불러오기 실패");
  }

  if (response.status === 200) {
    return response.json();
  }

  throw new Error("Unexpected response status: " + response.status);
}

function renderViewUser(jsonData) {
  let apiBaseUrl = localStorage.getItem("API_BASE_URL");
  const userEmailElement = document.getElementById("userEmail");
  const userNickname = document.getElementById("nickname");
  const noprofile = document.getElementById("noprofile_img");
  const email = document.getElementById("email");
  const user_id = document.getElementById("user_id");
  const profilePath = document.getElementById("profilePath");
  userEmailElement.textContent = jsonData.email;
  email.value = jsonData.email;
  userNickname.value = jsonData.nickname;
  noprofile.src = apiBaseUrl+"/webapp/" + jsonData.profilePath;
  user_id.value = jsonData.id;
  profilePath.value = jsonData.profilePath;
}

function imgInput() {
  document.getElementById("profile-upload-input").click();
}

function modalView(id) {
  const openButton = document.getElementById(id);
  const modal = document.querySelector("#modal_" + id);
  const overlay = modal.querySelector(".modal_overlay");
  const closeBtn = modal.querySelector("button");
  const openModal = () => {
    modal.classList.remove("hidden");
  };
  const closeModal = () => {
    modal.classList.add("hidden");
  };
  overlay.addEventListener("click", closeModal);
  closeBtn.addEventListener("click", closeModal);
  openButton.addEventListener("click", openModal);
}

function checkProfile() {
  const preview = document.getElementById("preview");
  const profile_img = document.getElementById("profile-upload-input").files[0];
  const noprofile = document.getElementById("noprofile_img");
  document.getElementById("check_img").value = "1";
  if (profile_img) {
    const reader = new FileReader();
    noprofile.style.display = "none";
    preview.style.display = "block";
    reader.onload = function (e) {
      preview.src = e.target.result;
    };
    reader.readAsDataURL(profile_img);
  }
}

document.getElementById("member_Form").addEventListener("submit", (event) => {
    event.preventDefault(); // form의 자동 제출을 막음
    member_sendit(); // fetch 요청 시작
  });

const member_sendit = async () => {
  let apiBaseUrl = localStorage.getItem("API_BASE_URL");
    let form = document.getElementById("member_Form");
    const id = form.user_id.value;
    const nickname = form.nickname.value;
    const email = form.email.value;
    const file = document.getElementById("profile-upload-input").files[0];
    const formData = new FormData();
    const check_img = document.getElementById("check_img").value;
    formData.append("file", file);
    let profilePath = form.profilePath.value;
    if(check_img == "1") {
        const imgResponse = await fetch(`${apiBaseUrl}/upload/attach-file`, {
            method: "POST",
            body: formData,
        });
        if(imgResponse.status === 201) {
            const data = await imgResponse.text();
            
            profilePath = data;
        }
    }
    const response = await fetch(`${apiBaseUrl}/users/${id}`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem('jwt')}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ id, email, nickname, profilePath }),
    });
    if(response.status === 409) {
        document.getElementById('helper-nickname').textContent = '중복되는 닉네임입니다.';
    }
    if(!response.ok) {
        throw new Error("글쓰기 실패");
    }
    if(response.status === 200) {
        let tostMessage = document.getElementById("member-btn");
        tostMessage.classList.add("toast-active");
        setTimeout(function () {
        tostMessage.classList.remove("toast-active");
        }, 1000);
    }
}

function delUser() {
  let apiBaseUrl = localStorage.getItem("API_BASE_URL");
  const userId = document.getElementById("user_id").value;
  const formDataString = `user_id=${userId}`;
  fetch(`${apiBaseUrl}/users/${userId}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${localStorage.getItem('jwt')}`,
      "Content-Type": "application/json"
    },
    body: formDataString,
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      if (response.status === 200) {
        alert("삭제완료");
      }
      window.location.href = "/";
      return response.json();
    })
    .then((data) => {
      console.log(data);
    });
}

function checkNickName(nickname) {
  //NOTE: 1:유효성 2:입력x 3:띄어쓰기 4:중복 5:11자이상 6:통과
  const pattern = /\s/g;
  if (pattern.test(nickname) && nickname.length > 10) {
    return 1;
  } else if (nickname === "") {
    return 2;
  } else if (pattern.test(nickname)) {
    return 3;
  } else if ("admin" === nickname) {
    //FIXME: 중복 닉네임
    return 4;
  } else if (nickname.length > 10) {
    return 5;
  } else {
    return 6;
  }
}

document.getElementById('nickname').addEventListener('input', () => {
  if(document.getElementById('nickname').value.trim() === "") {
    document.getElementById('helper-nickname').textContent = "*닉네임을 입력해주세요.";
  } else {
    document.getElementById('helper-nickname').textContent = "";
  }
});