const signin_sendit = async () => {
  let apiBaseUrl = localStorage.getItem("API_BASE_URL");
    let form = document.getElementById("signin_Form");
    const email = form.email.value;
    const pwd = form.password.value;
    const nickname = form.nickname.value;
    //const profile_img = document.getElementById("profile").value;
    try {
        
        const file = document.getElementById("profile").files[0];
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

        let profilePath;
        if(imgResponse.status === 201) {
            const imgPath = await imgResponse.text();
            profilePath = imgPath;
        }

        const response = await fetch(`${apiBaseUrl}/users/signup` , {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, pwd, nickname, profilePath }),
        });
        if(response.status === 500) {
            throw new Error("회원가입 실패");
        }
        if(response.status === 409) {
          document.getElementById("helper_email").textContent = "중복된 이메일 입니다.";
          document.getElementById("helper_nickname").textContent = "중복된 닉네임 입니다.";       
        }
        if(!response.ok) {
            throw new Error("회원가입 실패");
        }
        if(response.status === 201) {
            alert("회원가입 완료");
            window.location.href = "/";
        }
    } catch(e) {
        console.error(e);
    }
};

document.getElementById("signin_Form").addEventListener("submit", (event) => {
    event.preventDefault(); // form의 자동 제출을 막음
    signin_sendit(); // fetch 요청 시작
  });
  


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
function checkProfile() {
  const preview = document.getElementById("preview");
  const profile_img = document.getElementById("profile").files[0];
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
document.getElementById("profile").addEventListener("change", (event) => {
  const selectedFile = event.target.files[0];
  
  if (selectedFile) {
    
    document.getElementById("helper_profile").style.display = "none";
  }
});
document.getElementById("email").addEventListener("input", () => {
  const evalue = document.getElementById("email");
  const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const h_email = document.getElementById("helper_email");
  if (evalue.value === "") {
    h_email.textContent = "이메일을 입룍해주세요";
  } else if (!pattern.test(evalue.value) || evalue.value.length < 7) {
    h_email.textContent =
      "올바른 이메일 주소 형식을 입력해주세요. (예: example@example.com)";
  } else {
    
    h_email.textContent = "";
  }
});
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
  } else if (evalue.value != evalue_chk.value) {
    h_pwd.textContent = "비밀번호가 다릅니다.";
  } else {
    
    h_pwd.textContent = "사용가능한 비밀번호입니다.";
  }
});
document.getElementById("nickname").addEventListener("input", () => {
  const evalue = document.getElementById("nickname");
  const h_pwd = document.getElementById("helper_nickname");
  const pattern = /\s/g;
  
  if (evalue.value === "") {
    h_pwd.textContent = "닉네임을 입력해주세요";
  } else if (pattern.test(evalue.value)) {
    h_pwd.textContent = "띄어쓰기를 없애주세요.";
  } else if (evalue.value.length > 10) {
    h_pwd.textContent = "닉네임은 최대 10자까지 가능합니다.";
  } else {
    
    h_pwd.textContent = "";
  }
});

function imgInput() {
    document.getElementById("profile").click();
}
