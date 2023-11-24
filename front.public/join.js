// 회원가입 페이지

document.getElementById("joinBtn").addEventListener("click", async () => {
  const getEmail = document.getElementById("email").value;
  const getUsername = document.getElementById("username").value;
  const getPassword = document.getElementById("password").value;
  const getConfirmPassword = document.getElementById("confirmPassword").value;

  console.log(getEmail, getUsername, getPassword, getConfirmPassword);

  // 액시오스 post 요청
  axios
    .post("/api/join", {
      email: getEmail,
      username: getUsername,
      password: getPassword,
      confirmPassword: getConfirmPassword,
    })
    .then(function (response) {
      console.log(response);
    })
    .catch(function (error) {
      console.log(error);
    });
});
