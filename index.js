window.onload = init()

function init() {
  displayFirstAndThumbnails()
}

async function displayFirstAndThumbnails(){
  let json;
  try {
    json = await getData('json/ids.json', 'GET');
  } catch {
    //error getting ids.json, meaning it does not exist
    await getData('create_ids.py', 'POST');
    json = await getData('json/ids.json', 'GET');
    //also generate thumbnails for the videos
    await getData('create_thumbnails.py', 'POST');
  }
  const ids = Object.keys(json);
  displayVideo(ids[0]);
  for(let i = 0; i < ids.length; i++) {
    await createThumbnail(ids[i], i % 3, json[ids[i]]['title']);
  }
}

async function createThumbnail(id, col, title) {
  const plainID = id.split('.')[0];
  const text = document.createElement('p');
  text.innerHTML = title;
  text.setAttribute('class', 'thumbnail-text');
  const img = document.createElement('img');
  img.setAttribute('src', 'thumbnails/' + plainID + '.jpg');
  img.setAttribute('class', 'thumbnail');
  img.addEventListener('click', function() {
    const id = this.getAttribute('src').split('/')[1].split('.')[0];
    displayVideo(id + '.mp4');
  });
  const div = document.createElement('div');
  div.appendChild(text);
  div.appendChild(img);
  const pdiv = document.getElementById('col' + col);
  pdiv.appendChild(div);
}

//any error thrown will be propagated up
async function getData(url, method, body) {
  const response = await fetch(url, {method: method, body: JSON.stringify(body)})
  if(!response.ok) {
    throw new Error(`Response status: ${response.status}`);
  }
  const json = await response.json();
  return json;
}


//given the id, put it into the video player
function displayVideo(id) {
  const video = document.getElementById('video');
  let src = document.getElementById('src');
  const url = 'videos/' + id;
  if(src == null) {
    src = document.createElement('source');
    src.setAttribute('id', 'src');
    src.setAttribute('type', 'video/mp4');
    video.appendChild(src);
    src.setAttribute('src', 'videos/' + id);
    video.load();
  } else if(src.getAttribute('src') !== url) {
    src.setAttribute('src', 'videos/' + id);
    video.load();
  }
}
