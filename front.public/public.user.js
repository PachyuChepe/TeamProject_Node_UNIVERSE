

// 로그인
axios.defaults.withCredentials = true;
document.getElementById("loginForm").addEventListener("submit", function (event) {
  event.preventDefault();

  let email = document.getElementById("email").value;
  console.log(email);
  let password = document.getElementById("password").value;

  axios
    .post("/api/login", { email: email, password: password })
    .then(function (response) {
      // 성공 메시지 알림
      alert(response.data.message);
      // 추가적인 성공 처리 로직 (예: 메인 페이지로 리디렉션)
      // window.location.href = "main.html";
      window.location.reload();
    })
    .catch(function (error) {
      if (error.response) {
        // 서버로부터의 응답이 있는 경우
        alert(error.response.data.message);
      } else {
        // 서버 응답 없이 오류 발생
        alert("오류가 발생했습니다. 다시 시도해주세요.");
      }
    });
});

// 로그아웃
document.getElementById("logoutButton").addEventListener("click", function () {
  axios
    .post("/api/logout")
    .then(function (response) {
      // 성공 메시지 알림
      alert(response.data.message);
      // 추가적인 로그아웃 처리 로직 (예: 로그인 페이지로 리디렉션)
      window.location.href = "index.html";
    })
    .catch(function (error) {
      // 오류 처리
      alert("로그아웃 중 오류가 발생했습니다.");
    });
});

// 회원 탈퇴
function handleDeleteAccount() {
  if (confirm("정말로 회원탈퇴를 하시겠습니까?")) {
    axios
      .delete("/api/user")
      .then(function (response) {
        // 서버로부터 받은 성공 메시지를 표시
        alert(response.data.message);
        // 성공적으로 처리된 후의 행동 (예: 로그인 페이지로 리디렉션)
        window.location.href = "/index.html";
      })
      .catch(function (error) {
        // 서버로부터 받은 에러 메시지를 표시
        alert(error.response.data.message);
      });
  }
}
document.getElementById("deleteAccountButton").addEventListener("click", handleDeleteAccount);

// 페이지 로드 시 로그인 상태 확인
document.addEventListener("DOMContentLoaded", function () {
  checkLoginStatusAndUpdateUI();
});

// 로그인 상태를 확인하고 사용자 정보를 UI에 업데이트하는 함수
function checkLoginStatusAndUpdateUI() {
  axios
    .get("/api/user/me")
    .then((response) => {
      const { success, data } = response.data;

      if (success && data) {
        // 사용자 정보를 UI에 반영
        updateUserInfo(data);
        // 로그인 섹션 숨기기
        document.getElementById("loginSection").style.display = "none";
        // 로그인 이후 섹션 보이기
        document.getElementById("loggedInSection").style.display = "block";
      } else {
        // 로그인하지 않은 상태의 UI 처리
        document.getElementById("loginSection").style.display = "block";
        document.getElementById("loggedInSection").style.display = "none";
      }
    })
    .catch((error) => {
      console.error("사용자 정보를 가져오는 중 오류 발생:", error);
      // 로그인하지 않은 것으로 간주하고 UI 업데이트
      document.getElementById("loginSection").style.display = "block";
      document.getElementById("loggedInSection").style.display = "none";
    });
}

// 사용자 정보를 UI에 반영하는 함수
function updateUserInfo(userData) {
  // 프로필 사진 업데이트
  if (userData.userProfile.profilePictureUrl) {
    let profileImage = document.querySelector(".profile-image");
    profileImage.style.backgroundImage = `url(${userData.userProfile.profilePictureUrl})`;
    profileImage.style.backgroundPosition = "center";
    profileImage.style.backgroundSize = "cover";
    profileImage.style.backgroundRepeat = "no-repeat";
  }
  // 이름, 게시글 수, 팔로워 수, 팔로잉 수 등의 정보 업데이트
  const nameElement = document.getElementById("username");
  nameElement.innerHTML = userData.userProfile.username;

  // 게시글 수, 팔로워 수, 팔로잉 수 업데이트
  document.getElementById("postsCount").textContent = userData.stats.postsCount; // 게시글 수
  document.getElementById("followersCount").textContent = userData.stats.followersCount; // 팔로워 수
  document.getElementById("followingCount").textContent = userData.stats.followingCount; // 팔로잉 수
}

// 페이지 로드 시 로그인 상태 확인 및 사용자 정보 업데이트
document.addEventListener("DOMContentLoaded", function () {
  checkLoginStatusAndUpdateUI();
});

