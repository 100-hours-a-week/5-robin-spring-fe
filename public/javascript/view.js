window.onload = async () => {
    await loadHeader();
    try {
        const currentUrl = window.location.href;
        const postId = currentUrl.split("/").pop();
        const jsonData = await fetchPostData(postId);
        const commentJsonData = await fetchCommentData(postId);
        
        renderViewPost(jsonData);
        renderComments(commentJsonData);
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

async function fetchCommentData(postId) {
  let apiBaseUrl = localStorage.getItem("API_BASE_URL");
    const response = await fetch(`${apiBaseUrl}/posts/${postId}/comments`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${localStorage.getItem('jwt')}`,
        "Content-Type": "application/json"
      },
      credentials: "include",
    });
  
    if (!response.ok) {
      throw new Error("댓글 불러오기 실패");
    }
  
    if (response.status === 200) {
      return response.json();
    }
  
    throw new Error("Unexpected response status: " + response.status);
  }


function renderViewPost(jsonData) {
  let apiBaseUrl = localStorage.getItem("API_BASE_URL");
    const viewPost = document.getElementById("view-post");
    const div = document.createElement("div");
    const formattedDateStr = formatDate(jsonData.createAt);
    div.innerHTML = `
        <h3>${jsonData.title}</h3>
        <div class="view-writer">
            <div class="view-writer sub">
            <img
                src="${apiBaseUrl}/webapp/${jsonData.user.profilePath}"
                class="header-right"
            />
            <h4 class="mlp10">${jsonData.user.nickname}</h4>
            <p class="mlp30">${formattedDateStr}</p>
            </div>
            <div class="view-writer sub">
            <form action="/posts/${jsonData.id}" method="post">
                <button class="edit-btn" style="margin-right: 10px" id="edit-btn">수정</button>
            </form>
            <button class="edit-btn" id="bbs" onclick="modalView('bbs')">삭제</button>
            <div class="modal hidden" id="modal_bbs">
                <div class="modal_overlay"></div>
                <div class="modal_content">
                <h2>게시글을 삭제하시겠습니까?</h2>
                <h4>삭제한 내용은 복구할 수 없습니다.</h4>
                <button style="background-color: black; width: 100px; height: 50px; border-radius: 10px; border: 0"><p style="color: white;">취소</p></button>
                <button style="background-color: #aca0eb; width: 100px; height: 50px; border-radius: 10px; border: 0" onclick="deletePost(${jsonData.id}, ${jsonData.user.id})">확인</button>
                </div>
            </div>
            </div>
        </div>
        </div>
        <hr class="board-line" />
        <div class="board-cont">
        <img
            src="${apiBaseUrl}/webapp/${jsonData.filePath}"
            class="view-file"
        />
        <p>
            ${jsonData.content}
        </p>
        <div style="display: flex; justify-content: center">
            <button class="view-container-btn"><span id="cutNum">${jsonData.hits}</span><br />조회수</button>
            <button class="view-container-btn"><span id="cutNum">${jsonData.comments}</span><br />댓글</button>
        </div>
        `;
        viewPost.appendChild(div);
}

function renderComments(jsonData) {
  let apiBaseUrl = localStorage.getItem("API_BASE_URL");
    const commentPost = document.getElementById("view-comment");
    jsonData.forEach(comment => {
        const div = document.createElement("div");
        const formattedDateStr = formatDate(comment.createAt);
        div.innerHTML = `
            <div class="view-writer">
            <div style="display: flex; flex-direction: column">
                <div class="view-writer sub">
                <img
                    src="${apiBaseUrl}/webapp/${comment.user.profilePath}"
                    class="header-right"
                />
                <h4 style="margin-left: 10px">${comment.user.nickname}</h4>
                <p style="margin-left: 30px">${formattedDateStr}</p>
                </div>
                <div>${comment.content}</div>
            </div>
            <div class="view-writer sub">
                <button class="edit-btn" style="margin-right: 10px" onclick="changeEdit(${comment.id}, '${escapeContent(comment.content)}')">수정</button>
                <button
                class="edit-btn"
                id="comment-del_${comment.id}"
                onclick="modalView('comment-del_${comment.id}')"
                >
                삭제
                </button>
                <div class="modal hidden" id="modal_comment-del_${comment.id}">
                <div class="modal_overlay"></div>
                <div class="modal_content">
                    <h2>댓글을 삭제하시겠습니까?</h2>
                    <h4>삭제한 내용은 복구할 수 없습니다.</h4>
                    <button
                    style="
                        background-color: black;
                        width: 100px;
                        height: 50px;
                        border-radius: 10px;
                        border: 0;
                    "
                    >
                    <p style="color: white">취소</p>
                    </button>
                    <button
                    style="
                        background-color: #aca0eb;
                        width: 100px;
                        height: 50px;
                        border-radius: 10px;
                        border: 0;
                    "
                    onclick="deleteComment(${comment.id})"
                    >
                    확인
                    </button>
                </div>
                </div>
            </div>
            </div>
            `;
        commentPost.appendChild(div);
    });
}



function escapeContent(content) {
  return content.replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');
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

const send_comment = async () => {
  let apiBaseUrl = localStorage.getItem("API_BASE_URL");
    const currentUrl = window.location.href;
    const post_id = currentUrl.split("/").pop();
    const content = document.getElementById("textarea-input").value;
    //const formDataString = `post_id=${post_id}&content=${encodeURIComponent(document.getElementById("textarea-input").value)}`;
    try {
        const response = await fetch(`${apiBaseUrl}/posts/${post_id}/comments`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem('jwt')}`,
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({ content }),
        });
        if(!response.ok) {
            throw new Error("댓글 등록 오류");
        }
        if(response.status === 201) {
            alert("댓글 등록 완료");
            window.location.reload();
        }
    } catch(e) {
        console.error(e);
    }
}

const edit_comment = async (comment_id) => {
  let apiBaseUrl = localStorage.getItem("API_BASE_URL");
    const currentUrl = window.location.href;
    const post_id = currentUrl.split("/").pop();
    const content = document.getElementById("textarea-input").value;
    try {
        const response = await fetch(`${apiBaseUrl}/posts/${post_id}/comments/${comment_id}`, {
            method: "PATCH",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem('jwt')}`,
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({ content }),
        });
        if(response.status === 401 || response.status === 403) {
            alert("댓글 수정 권한 없음");
        }
        if(!response.ok) {
            throw new Error("댓글 수정 오류");
        }
        if(response.status === 200) {
            alert("댓글 수정 완료");
            window.location.reload();
        }
    } catch(e) {
        console.error(e);
    }
}

function changeEdit(comment_id, content) {
  document.getElementById("comment-btn").style.display = "none"; // 댓글 등록 버튼 숨기기
  const editButton = document.getElementById("edit-comment-btn");
  editButton.style.display = "block"; // 버튼을 보이게 만듭니다.
  document.getElementById("textarea-input").value = content;
  editButton.onclick = edit_comment.bind(null, comment_id);
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

const deletePost = async (post_id, user_id) => {
    try {
      let apiBaseUrl = localStorage.getItem("API_BASE_URL");
        const response = await fetch(`${apiBaseUrl}/posts/${post_id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem('jwt')}`,
                "Content-Type": "application/json"
            },
            credentials: "include",//여기토큰추가
          });

        if(response.status === 403) {
            alert("삭제 권한 없음");
        }
        if(!response.ok) {
            throw new Error("게시물 삭제 오류");
        }
        if(response.status === 200) {
            alert("게시글 삭제 완료");
            window.location.href = "/posts";
        }
    } catch(e) {
        console.error(e);
    }
}

const deleteComment = async (comment_id) => {
    const currentUrl = window.location.href;
    const post_id = currentUrl.split("/").pop();
    let apiBaseUrl = localStorage.getItem("API_BASE_URL");
    try {
        const response = await fetch(`${apiBaseUrl}/posts/${post_id}/comments/${comment_id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem('jwt')}`,
                "Content-Type": "application/json"
            },
            credentials: "include",
          });
        if(response.status === 403) {
            alert("댓글 삭제 권한 없음");
        }
        if(!response.ok) {
            throw new Error("댓글 삭제 오류");
        }
        if(response.status === 200) {
            alert("댓글 삭제 완료");
            window.location.reload();
        }
    } catch(e) {
        console.error(e);
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