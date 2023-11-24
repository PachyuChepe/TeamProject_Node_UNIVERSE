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
    await axios.post("/api/login", { email, password });
    alert("로그인 완료");
    location.reload();
  } catch (err) {
    console.error(err);
    alert("로그인에 실패했습니다. 이메일과 비밀번호를 다시 확인해주세요.");
    location.reload();
  }
});

// 로그아웃
document.getElementById("logout-btn").addEventListener("click", async () => {
  console.log("로그아웃");
  document.cookie = "max-age=0";
});
