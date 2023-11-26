// axios 전역 설정
axios.defaults.withCredentials = true; // withCredentials 전역 설정

// 쿠키 삭제 (로그아웃 기능)
function deleteCookie(name) {
  document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
}

// 사용자 정보 화면 (로그인 시에만 보여짐)
async function getUser() {
  const res = await axios.get("/api/users/me");
  const data = res.data; // userInfo
  const user = data.userInfo;
  document.getElementsByClassName("profile-img");
  document.getElementById("username").innerHTML = user.username ? user.username : "사용자";
  document.getElementById("useremail").innerHTML = user.email ? user.email : "이메일이 없습니다.";
  document.getElementById("following").innerHTML = user.following ? user.following : "0";
  document.getElementById("follower").innerHTML = user.follower ? user.follower : "0";
}

// 카테고리별 탭이동
const $nav = document.querySelector("#tabButtonNav");
const $sections = document.querySelectorAll(".tabSection");

$nav.addEventListener("click", (e) => {
  if (!e.target.classList.contains("tabButton")) {
    return;
  }

  const focusedTabId = e.target.dataset.tabSection;

  // 탭을 누르면 태그의 hidden 속성이 지워지며 해당 탭이 화면이 보여지고 나머지 탭의 화면들이 가려지게 구현함
  $sections.forEach(($section) => {
    if ($section.id === focusedTabId) {
      $section.removeAttribute("hidden");
    } else {
      $section.setAttribute("hidden", true);
    }
  });
});

// 로그인 여부에 따른 사용자정보 화면 or 로그인 안된 화면 뜨게
if (document.cookie) {
  document.getElementById("auth-form").style.display = "none";
  document.getElementById("user-info").style.display = "block";
  getUser();
} else {
  document.getElementById("user-info").style.display = "none";
  document.getElementById("auth-form").style.display = "block";
}

// 로그인
document.getElementById("login-btn").addEventListener("click", async () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  console.log(email, password);

  try {
    const login = await axios.post("/api/login", { email, password });
    if (!login) {
      return alert("로그인에 실패했습니다. 이메일과 비밀번호를 다시 확인해주세요.");
    }
    if (!email || !password) {
      return alert("이메일과 패스워드를 모두 입력해주세요.");
    }
    location.reload();
    alert("로그인 되었습니다.");
  } catch (err) {
    console.error(err);
  }
});

// 로그아웃
document.getElementById("logout-btn").addEventListener("click", async () => {
  deleteCookie("connect.sid");
  location.reload();
});
