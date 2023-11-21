// HTML 스크립트
document.getElementById("login-btn").addEventListener("click", function () {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  // 로그인 처리 로직 (서버 요청 추가 필요)
});

document.getElementById("signup-btn").addEventListener("click", function () {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  // 회원가입 처리 로직 (서버 요청 추가 필요)
});

document.getElementById("update-profile-btn").addEventListener("click", function () {
  const name = document.getElementById("name").value;
  const bio = document.getElementById("bio").value;
  // 프로필 업데이트 로직 (서버 요청 추가 필요)
});

document.getElementById("post-btn").addEventListener("click", function () {
  const content = document.getElementById("post-content").value;
  // 게시물 작성 로직 (서버 요청 추가 필요)
});

// 게시물 목록을 불러오는 함수
function loadPosts() {
  // 서버에서 게시물 목록을 불러오는 로직 (서버 요청 추가 필요)
}

// 앱 초기화 함수
function initApp() {
  loadPosts();
}

initApp();
