window.onload = init()

function init() {
  
}

//given the id, put it into the video player
function displayVideo(id) {
  const video = document.getElementById('video');
  let src = document.getElementById('src');
  if(src == null) {
    src = document.createElement('source');
    src.setAttribute('id', 'src');
    src.setAttribute('type', 'video/mp4');
    video.appendChild(src);
  }
  src.setAttribute('src', '../videos/' + id);
  video.load();
}
