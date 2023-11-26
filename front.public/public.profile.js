axios.defaults.withCredentials = true;
// 회원 정보 수정 필터링 함수
document.addEventListener("DOMContentLoaded", function () {
  axios
    .get("/api/checkAuth")
    .then((response) => {
      if (response.data.success) {
        // 로그인 방식에 따른 처리
        handlePasswordField(response.data.provider);
      }
    })
    .catch((error) => {
      console.error("Authentication check failed", error);
    });

  function handlePasswordField(provider) {
    const currentPasswordInput = document.getElementById("currentPassword");
    const newPasswordInput = document.getElementById("newPassword");

    if (provider !== "local") {
      // 소셜 로그인 사용자일 경우
      currentPasswordInput.disabled = true;
      newPasswordInput.disabled = true;

      // 인풋창 안에 문구 추가
      currentPasswordInput.placeholder = "소셜 로그인에선 패스워드 입력을 지원하지 않습니다.";
      newPasswordInput.placeholder = "소셜 로그인에선 패스워드 입력을 지원하지 않습니다.";
    } else {
      // 로컬 로그인 사용자일 경우
      currentPasswordInput.disabled = false;
      newPasswordInput.disabled = false;
      currentPasswordInput.placeholder = "";
      newPasswordInput.placeholder = "";
    }
  }
});

// 회원 정보 수정
document.addEventListener("DOMContentLoaded", function () {
  // 이미지 업로드 및 미리보기 로직
  let uploadedImageFile; // 업로드된 이미지 파일 저장 변수

  document.getElementById("imageUpload").addEventListener("change", function () {
    if (this.files && this.files[0]) {
      uploadedImageFile = this.files[0]; // 이미지 파일 저장
      const reader = new FileReader();
      reader.onload = function (e) {
        document.getElementById("profileImagePreview").style.backgroundImage = `url(${e.target.result})`;
      };
      reader.readAsDataURL(uploadedImageFile);
    }
  });

  // 폼 제출 로직
  document.querySelector(".profile-card form").addEventListener("submit", function (event) {
    event.preventDefault(); // 기본 제출 이벤트 방지

    // FormData 객체 생성
    let formData = new FormData();
    if (uploadedImageFile) {
      formData.append("profilePictureUrl", uploadedImageFile);
    }
    formData.append("username", document.getElementById("name").value);
    formData.append("profileDescription", document.getElementById("profileDescription").value);
    formData.append("currentPassword", document.getElementById("currentPassword").value);
    formData.append("newPassword", document.getElementById("newPassword").value);

    // 서버로 전송
    axios
      .put("http://localhost:4000/api/user/me", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => {
        alert(response.data.message);
        window.location.href = "index.html";
      })
      .catch((error) => {
        alert(error.response.data.message);
      });
  });
});
