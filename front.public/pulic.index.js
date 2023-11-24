// 1. axios 전역 설정
axios.defaults.withCredentials = true; // withCredentials 전역 설정

// 쿠키 삭제 (로그아웃)
function deleteCookie(name) {
  document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
}

async function getUser() {
  const res = await axios.get("/api/users/me");
  const user = res.data;
  console.log(user);
}
getUser();

// 로그인 여부에 따른 사용자정보 화면 or 로그인 안된 화면 뜨게
if (document.cookie) {
  document.getElementById("auth-form").style.display = "none";
  document.getElementById("user-info").style.display = "block";
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
    if (login.data !== "로그인 성공!") {
      return alert("로그인에 실패했습니다. 이메일과 비밀번호를 다시 확인해주세요.");
    }
    alert("로그인 되었습니다.");
  } catch (err) {
    console.error(err);
  }
});

// 유저 정보

// 로그아웃
document.getElementById("logout-btn").addEventListener("click", async () => {
  deleteCookie("connect.sid");
  location.reload();
});
