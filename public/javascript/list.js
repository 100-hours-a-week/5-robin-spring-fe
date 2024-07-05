window.onload = async () => {
  await loadHeader();
  try {
    const jsonData = await fetchPostData();
    
    renderPostList(jsonData);
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
            <p><a href="#" onclick="logout_user()">로그아웃</a></p>
          </div>
        </div>
      `;
      headerList.appendChild(div);

    }
  } catch (error) {
    console.error("헤더 로드 중 오류 발생:", error);
  }
}

async function logout_user() {
  let apiBaseUrl = localStorage.getItem("API_BASE_URL");
  
  const response = await fetch(`${apiBaseUrl}/users/logout`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${localStorage.getItem('jwt')}`,
      "Content-Type": "application/json"
    },
    credentials: "include",
    body: "user",
  });

  if (!response.ok) {
    throw new Error("로그아웃 실패");
  }

  if (response.status === 200) {
    alert("로그아웃 성공");
    window.location.href = "/";
  }

  throw new Error("Unexpected response status: " + response.status);
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
  let apiBaseUrl = localStorage.getItem("API_BASE_URL");
  const response = await fetch(`${apiBaseUrl}/posts`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${localStorage.getItem('jwt')}`,
      "Content-Type": "application/json"
    },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("목록 불러오기 실패");
  }

  if (response.status === 200) {
    return response.json();
  }

  throw new Error("Unexpected response status: " + response.status);
}


function cutSubject() {
  const sub = document.getElementById("list-subject");
  const element = document.querySelectorAll("#list-subject");
  for (let i = 0; i < element.length; i++) {
    if (element[i].textContent.length > 26) {
      element[i].textContent = element[i].textContent.slice(0, 26) + "...";
    }
  }
}

function cutNum() {
  //const element = document.getElementById('cutNum');
  const element = document.querySelectorAll("#cutNum");
  for (let i = 0; i < element.length; i++) {
    
    const num = parseInt(element[i].textContent);
    if (num >= 1000) {
      let digit = num / 1000;
      element[i].textContent = digit + "k";
    }
  }
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const seconds = String(date.getUTCSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

async function renderPostList(data) {
  const postList = document.getElementById("post-list");
  let apiBaseUrl = localStorage.getItem("API_BASE_URL");
    if (!apiBaseUrl) {
      apiBaseUrl = await getConfig();
    }
  data.forEach(post => {
    const formattedDateStr = formatDate(post.createAt);
    const div = document.createElement("div");
    div.classList.add("content");
    div.innerHTML = `
      <a href="/posts/${post.id}">
        <h4 id="list-subject">${post.title}</h4>
      </a>
      <div class="date">
        <p>좋아요 <span id="cutNum">${post.likes}</span> 댓글 <span id="cutNum">${post.comments}</span> 조회수 <span id="cutNum">${post.hits}</span></p>
        <p>${formattedDateStr}</p>
      </div>
      <hr class="line">
      <div style="display: flex; align-items: center;">
        <img src="${apiBaseUrl}/webapp/${post.user.profilePath}" class="header-right">
        <span style="align-items: center; margin-left: 10px">${post.user.nickname}</span>
      </div>
    `;
    postList.appendChild(div);
  });

  cutSubject();
  cutNum();
}

function decodeFileName(encodedFileName) {
  return decodeURIComponent(encodedFileName);
}