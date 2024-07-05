

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
//NOTE: 프로필 사진 미리보기
function checkProfile() {
  const preview = document.getElementById("preview");
  const profile_img = document.getElementById("profile-upload-input").files[0];
  const noprofile = document.getElementById("noprofile_img");
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
    console.log(element[i].textContent);
    const num = parseInt(element[i].textContent);
    if (num >= 1000) {
      let digit = num / 1000;
      element[i].textContent = digit + "k";
    }
  }
}
function checkTextarea() {
  const comment = document.getElementById("textarea-input").value;
  if (comment.trim() !== "") {
    document.getElementById("comment-btn").style.backgroundColor = "#7F6AEE";
  } else {
    document.getElementById("comment-btn").style.backgroundColor = "#aca0eb";
  }
}
document
  .getElementById("textarea-input")
  .addEventListener("input", checkTextarea);

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
