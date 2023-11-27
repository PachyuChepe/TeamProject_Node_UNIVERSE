const categoryMapping = {
  자유게시판: 1,
  "IT 정보": 2,
  지식공유방: 3,
  스터디: 4,
};

const headerTitle = document.querySelector(".col-span-2 h2");

document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll("nav a").forEach((link) => {
    link.addEventListener("click", function (event) {
      event.preventDefault();
      const categoryName = this.textContent;
      const category = categoryMapping[categoryName];
      headerTitle.textContent = categoryName; // 페이지 상단 제목 업데이트
      loadPosts(category);
    });
  });
});

// 서버로부터 데이터를 로드하는 함수
function loadPosts(category) {
  axios
    .get(`/api/posts?category=${category}`)
    .then((response) => {
      const posts = response.data.data[0].Posts;
      console.log(posts);
      displayPosts(posts); // 게시글을 표시하는 함수 호출

      // 포스트 클릭 시 해당 페이지로 이동
      const postLinks = document.querySelectorAll(".post");
      postLinks.forEach(function (postLink) {
        postLink.addEventListener("click", function (event) {
          event.preventDefault();

          // 클릭된 게시물의 ID 가져오기
          var postId = postLink.getAttribute("data-post-id");

          // 상세페이지로 이동
          window.location.href = "detail.html?id=" + postId;
        });
      });
    })
    .catch((error) => console.error("Error fetching posts", error));
}

// 페이지에 게시글을 표시하는 함수
function displayPosts(posts) {
  const postsContainer = document.getElementById("postsContainer");
  postsContainer.innerHTML = ""; // 기존 내용을 지움

  posts.forEach((userPosts) => {
    userPosts.Posts.forEach((post) => {
      const postElement = document.createElement("div");
      postElement.classList.add("flex", "mb-4", "stats-card");

      postElement.innerHTML = `
  <div class="post flex flex-col mx-0 px-0" data-post-id="${posts.id}">
  <div id="post-image-${posts.id}" class="w-24 h-24 mr-4"></div>
  <div class="mt-2 mr-4">
    <button class="w-full mb-2 px-3 py-2 bg-blue-400 hover:bg-blue-500 text-white rounded block text-center transition duration-200">수정</button>
    <button class="w-full mb-2 px-3 py-2 bg-blue-400 hover:bg-blue-500 text-white rounded block text-center transition duration-200">삭제</button>
    <button class="w-full mb-2 px-3 py-2 bg-blue-400 hover:bg-blue-500 text-white rounded block text-center transition duration-200">팔로우</button>
    <button class="w-full mb-2 px-3 py-2 bg-blue-400 hover:bg-blue-500 text-white rounded block text-center transition duration-200">언팔로우</button>
    <button class="w-full mb-2 px-3 py-2 bg-blue-400 hover:bg-blue-500 text-white rounded block text-center transition duration-200">좋아요</button>
    </div>

  </div>
  <div class="flex-1">
    <div id="post-title-${index}" class="mb-2">${post.title}</div>
    <div id="post-content-${index}">${post.content}</div>
  </div>
`;

      postsContainer.appendChild(postElement);

      // 게시글 이미지에 스타일 적용
      const postImage = postElement.querySelector(`#post-image-${index}`);
      postImage.style.backgroundImage = `url(${userPosts.profilePictureUrl})`;
      postImage.style.backgroundPosition = "center";
      postImage.style.backgroundSize = "cover";
      postImage.style.backgroundRepeat = "no-repeat";
    });
  });
}
