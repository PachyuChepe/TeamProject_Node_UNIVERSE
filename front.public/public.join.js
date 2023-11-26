// 회원 가입
axios.defaults.withCredentials = true;
document.querySelector(".profile-card form").addEventListener("submit", function (event) {
  event.preventDefault(); // 기본 제출 이벤트 방지

  // 입력값을 변수에 저장
  var email = document.getElementById("email").value;
  var password = document.getElementById("newPassword").value;
  var confirmPassword = document.getElementById("currentPassword").value;
  var username = document.getElementById("name").value;

  // axios를 사용하여 서버로 전송
  axios
    .post("/api/join", {
      email: email,
      password: password,
      confirmPassword: confirmPassword,
      username: username,
    })
    .then(function (response) {
      // 성공 메시지 알림
      alert(response.data.message || "회원가입 완료!");
      // index.html로 리디렉션
      window.location.href = "index.html";
    })
    .catch(function (error) {
      // console.log(error.response.data);
      if (error.response) {
        // 서버로부터의 응답이 있는 경우
        alert(error.response.data.message); // 서버 응답 메시지를 알림으로 표시
      } else {
        // 서버 응답 없이 오류 발생
        alert("오류가 발생했습니다. 다시 시도해주세요.");
      }
    });
});
