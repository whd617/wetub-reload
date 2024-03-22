const videoContainer = document.getElementById('videoContainer');
const form = document.getElementById('commentForm');
const deleteBtn = document.querySelectorAll('.deleteComment');

const addComment = (text, id) => {
   const videoComments = document.querySelector('.video__comments ul');
   const newComment = document.createElement('li');
   newComment.dataset.id = id;
   newComment.className = 'video__comment';
   const icon = document.createElement('i');
   icon.className = 'fas fa-comment';
   const span = document.createElement('span');
   span.innerText = ` ${text}`;
   const spanDelete = document.createElement('span');
   spanDelete.dataset.id = id;
   spanDelete.innerText = ' ❌';
   spanDelete.className = 'deleteComment';
   newComment.appendChild(icon);
   newComment.appendChild(span);
   newComment.appendChild(spanDelete);
   videoComments.prepend(newComment);
   spanDelete.addEventListener('click', handleCommentDelete);
};

const handleSubmit = async (event) => {
   event.preventDefault(); //preventDefault: default behavior를 못하도록 막는 역할
   const textarea = form.querySelector('textarea');
   const text = textarea.value;
   const videoId = videoContainer.dataset.id;
   if (text === '') {
      return;
   }
   const response = await fetch(`/api/videos/${videoId}/comment`, {
      method: 'POST',
      headers: {
         'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
   });
   if (response.status === 201) {
      textarea.value = ''; // textarea.value 저장 후 textarea.value값 비우기
      const { newCommentId } = await response.json();
      addComment(text, newCommentId);
   }
};

const handleCommentDelete = async (event) => {
   const commentId = event.target.dataset.id;
   await fetch(`/api/comments/${commentId}`, {
      method: 'DELETE',
   });
   event.target.parentNode.remove();
};

if (form) {
   form.addEventListener('submit', handleSubmit);
}

if (deleteBtn) {
   deleteBtn.forEach((commentDeleteBtn) => {
      commentDeleteBtn.addEventListener('click', handleCommentDelete);
   });
}
