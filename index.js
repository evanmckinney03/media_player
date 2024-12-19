window.onload = init()

function init() {
  //get the list of the ids and display the first one
  displayFirst();
}

async function displayFirst(){
  const ids = await getData('json/ids.json', 'GET');
  displayVideo(ids[0]['id']);
}

async function getData(url, method) {
  try {
    const response = await fetch(url, {method: method});
    if(!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    const json = await response.json();
    return json
  } catch (error) {
    console.error(error.message);
  }
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
