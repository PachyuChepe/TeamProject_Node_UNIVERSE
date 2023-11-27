// Quill 에디터 설정
document.addEventListener("DOMContentLoaded", function () {
  let quill = new Quill("#editor", {
    modules: {
      toolbar: [
        [{ header: [1, 2, false] }],
        ["bold", "italic", "underline"],
        ["image", "code-block"],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ script: "sub" }, { script: "super" }],
        [{ indent: "-1" }, { indent: "+1" }],
        [{ direction: "rtl" }],
        [{ size: ["small", false, "large", "huge"] }],
        [{ color: [] }, { background: [] }],
        [{ font: [] }],
        [{ align: [] }],
        ["clean"],
      ],
    },
    placeholder: "여기에 글을 작성하세요...",
    theme: "snow",
  });

  function sendData() {
    let title = document.getElementById("postTitle").value;
    let category = document.getElementById("categorySelect").value;
    let content = quill.root.innerHTML;

    axios
      .post("/api/post", {
        categoryName: category,
        title: title,
        content: content,
      })
      .then(function (response) {
        // 성공적인 응답 처리
        alert(response.data.message);
        window.location.href = "index.html";
      })
      .catch(function (error) {
        // 오류 처리
        // 오류 응답이 존재하면 그 메시지를 사용하고, 그렇지 않으면 기본 오류 메시지를 표시합니다.
        let errorMessage = error.response && error.response.data ? error.response.data.message : "알 수 없는 오류가 발생했습니다.";
        alert(errorMessage);
      });
  }

  document.getElementById("sendButton2").addEventListener("click", sendData);
});
