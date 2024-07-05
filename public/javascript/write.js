window.onload = async () => {
  const userData = await loadHeader();
  try {
    const currentUrl = window.location.href;
    const postId = currentUrl.split("/").pop();
    
    if(postId === "new") {
      renderWrite(userData);
    } else {
      const jsonData = await fetchPostData(postId);
      renderUpdate(userData, jsonData);
    }
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
        <div class="header-left">
            <a href="javascript:history.back()">
            <p class="line-1"></p>
            <p class="line-2"></p>
            </a>
        </div>
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

      return data;
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
  
async function fetchPostData(postId) {
  let apiBaseUrl = localStorage.getItem("API_BASE_URL");
  const response = await fetch(`${apiBaseUrl}/posts/${postId}`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${localStorage.getItem('jwt')}`,
      "Content-Type": "application/json"
    },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("게시물 불러오기 실패");
  }

  if (response.status === 200) {
    return response.json();
  }

  throw new Error("Unexpected response status: " + response.status);
}

function renderWrite(data) {
  const writePost = document.getElementById("write-post");
  const div = document.createElement("div");
  div.innerHTML = `
        <input type="hidden" name="userid" value=${data.id}>
        <h3 style="text-align: center">게시글 작성</h3>
        <p>제목*</p>
        <input
          id="subject"
          type="text"
          name="subject"
          placeholder="제목을 입력해주세요.(최대 26글자)"
          class="form-control2"
          maxlength="26"
        />
        <p class="mtp30">내용*</p>
        <textarea
          id="content"
          name="content"
          class="form-control2-textarea"
          placeholder="내용을 입력해주세요"
        ></textarea>
        <p class="helper" id="helper-text">*제목 내용을 모두 작성해주세요.</p>
        <p>이미지*</p>
        <input type="file" id="imgFile" name="imgFile" style="margin-bottom: 40px" />
        <button
          class="send-btn mtp30"
          style="width: 70%; margin-left: 10%"
          id="send-btn"
        >
          <p>완료</p>
        </button>
      `;
    writePost.appendChild(div);
    document.getElementById("content").addEventListener("input", () => {
        const context = document.getElementById("content").value;
        if (context == "") {
          document.getElementById("send-btn").style.backgroundColor = "#aca0eb";
          document.getElementById("helper-text").textContent =
            "제목 내용을 모두 작성해주세요.";
        } else {
          document.getElementById("send-btn").style.backgroundColor = "#7F6AEE";
          document.getElementById("helper-text").textContent = "";
        }
      });
      
      document.getElementById("bbs_Form").addEventListener("submit", (event) => {
        event.preventDefault(); // form의 자동 제출을 막음
        board_sendit(); // fetch 요청 시작
      });
}

function renderUpdate(data, postData) {
  let apiBaseUrl = localStorage.getItem("API_BASE_URL");
  const writePost = document.getElementById("write-post");
  const div = document.createElement("div");
  const postId = postData.id;
  div.innerHTML = `
        <input type="hidden" name="userid" value=${data.id}>
        <input type="hidden" name="filePath" value=${postData.filePath}>
        <h3 style="text-align: center">게시글 작성</h3>
        <p>제목*</p>
        <input
          id="subject"
          type="text"
          name="subject"
          value="${postData.title}"
          placeholder="제목을 입력해주세요.(최대 26글자)"
          class="form-control2"
          maxlength="26"
        />
        <p class="mtp30">내용*</p>
        <textarea
          id="content"
          name="content"
          class="form-control2-textarea"
          placeholder="내용을 입력해주세요"
          
        >${postData.content}</textarea>
        <p class="helper" id="helper-text">*제목 내용을 모두 작성해주세요.</p>
        <p>이미지*</p>
        <input type="file" id="imgFile" name="imgFile" style="margin-bottom: 40px" />
        <div>
          <img src="${apiBaseUrl}/webapp/${postData.filePath}" style=width:100%>
        </div>
        <button
          class="send-btn mtp30"
          style="width: 70%; margin-left: 10%"
          id="send-btn"
        >
          <p>완료</p>
        </button>
      `;
    writePost.appendChild(div);
    document.getElementById("content").addEventListener("input", () => {
        const context = document.getElementById("content").value;
        if (context == "") {
          document.getElementById("send-btn").style.backgroundColor = "#aca0eb";
          document.getElementById("helper-text").textContent =
            "제목 내용을 모두 작성해주세요.";
        } else {
          document.getElementById("send-btn").style.backgroundColor = "#7F6AEE";
          document.getElementById("helper-text").textContent = "";
        }
      });
      document.getElementById("bbs_Form").addEventListener("submit", (event) => {
        event.preventDefault(); // form의 자동 제출을 막음
        update_sendit(postId); // fetch 요청 시작
      });
}





  function checkContentarea() {
    const subject = document.getElementById("subject").value;
    const content = document.getElementById("content").value;
    if (subject.trim() !== "" && content.trim() !== "") {
      document.getElementById("send-btn").style.backgroundColor = "#7F6AEE";
    } else {
      document.getElementById("send-btn").style.backgroundColor = "#aca0eb";
    }
  }

  


const board_sendit = async () => {
    let form = document.getElementById("bbs_Form");
    const title = form.subject.value;
    const content = form.content.value;
    const userId = form.userid.value;
    let apiBaseUrl = localStorage.getItem("API_BASE_URL");
    document.getElementById("send-btn").style.backgroundColor = "#7F6AEE";
    try {
        const file = document.getElementById("imgFile").files[0];
        const formData = new FormData();
        formData.append("file", file);
        const imgResponse = await fetch(`${apiBaseUrl}/upload/attach-file`, {
            method: "POST",
            body: formData,
        });
        
        if(!imgResponse.ok) {
            if(imgResponse.status === 403) {
              alert("파일을 등록해주세요.");
            }
            throw new Error("이미지 업로드 실패");
        }
        if(imgResponse.status === 500) {
            throw new Error("이미지 업로드 실패");
        }

        let filePath;
        if(imgResponse.status === 201) {
            const imgPath = await imgResponse.text();
            filePath = imgPath;
        }

        const response = await fetch(`${apiBaseUrl}/posts` , {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${localStorage.getItem('jwt')}`,
              "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({ title, content, userId, filePath }),
        });
        if(response.status === 500) {
            throw new Error("글쓰기 실패");
        }
        if(response.status === 401) {
            alert("수정 권한이 없습니다");
        }
        if(!response.ok) {
            throw new Error("글쓰기 실패");
        }
        if(response.status === 201) {
            alert("글쓰기 완료");
            window.location.href = "/posts";
        }
    } catch(e) {
        console.error(e);
    }
};

const update_sendit = async (postId) => {
  let form = document.getElementById("bbs_Form");
  const title = form.subject.value;
  const content = form.content.value;
  const userId = form.userid.value;
  let filePath = form.filePath.value;
  let apiBaseUrl = localStorage.getItem("API_BASE_URL");
  document.getElementById("send-btn").style.backgroundColor = "#7F6AEE";
  try {
      const file = document.getElementById("imgFile").files[0];
      if(file != null) {
        const formData = new FormData();
        formData.append("file", file);
        const imgResponse = await fetch(`${apiBaseUrl}/upload/attach-file`, {
            method: "POST",
            body: formData,
        });
        if(!imgResponse.ok) {
            throw new Error("이미지 업로드 실패");
        }
        if(imgResponse.status === 500) {
            throw new Error("이미지 업로드 실패");
        }
        if(imgResponse.status === 201) {
            const imgPath = await imgResponse.text();
            filePath = imgPath;
        }
      }
      const response = await fetch(`${apiBaseUrl}/posts/${postId}` , {
          method: "PATCH",
          headers: {
            "Authorization": `Bearer ${localStorage.getItem('jwt')}`,
            "Content-Type": "application/json"
          },
          credentials: "include",
          body: JSON.stringify({ title, content, userId, filePath }),
      });
      if(response.status === 500) {
          throw new Error("글쓰기 실패");
      }
      if(response.status === 403) {
          alert("수정 권한이 없습니다");
      }
      if(!response.ok) {
          throw new Error("글쓰기 실패");
      }
      if(response.status === 200) {
          alert("게시물 수정 완료");
          window.location.href = "/posts";
      }
  } catch(e) {
      console.error(e);
  }
};
