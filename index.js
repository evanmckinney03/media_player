window.onload = init()

let ids_obj;

function init() {
  displayFirstAndThumbnails()
}

async function displayFirstAndThumbnails(){
  try {
    const json = await getData('json/ids.json', 'GET');
    ids_obj = json;
  } catch {
    //error getting ids.json, meaning it does not exist
    await getData('create_ids.py', 'POST');
    json = await getData('json/ids.json', 'GET');
    //also generate thumbnails for the videos
    await getData('create_thumbnails.py', 'POST');
    ids_obj = json;
  }
  const ids = Object.keys(ids_obj);
  displayVideo(ids[0], ids_obj[ids[0]]['title']);
  for(let i = 0; i < ids.length; i++) {
    await createThumbnail(ids[i], i % 3, ids_obj[ids[i]]['title']);
  }
  //add an event listener to the edit button to make the title editable
  const editTitleButton = document.getElementById('edit-title-button');
  editTitleButton.addEventListener('click', function() {
    const titleElem = document.getElementById('title');
    titleElem.removeAttribute('readonly');
    title.addEventListener('blur', editTitle, {once: true});
  });
  const title = document.getElementById('title');
  title.addEventListener('keypress', function(event) {
    if(event.key === 'Enter') {
      //remove the event listener that waits for input to lose focus
      this.removeEventListener('blur', editTitle);
      editTitle.call(this);
    }
  });
}

async function editTitle() {
  this.setAttribute('readonly', '');
  const newTitle = this.value;
  //update the thumbnail
  //id is in the video element
  const id = document.getElementById('src').getAttribute('src').split('/')[1].split('.')[0];
  const div = document.getElementById(id);
  //works because title is first child, change if that changes in future
  div.firstElementChild.innerHTML = newTitle;

  //make a post request to edit title on server
  ids_obj = getData('edit_ids.py', 'POST', {id: id + '.mp4', title: newTitle});
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
    displayVideo(id + '.mp4', title);
  });
  const div = document.createElement('div');
  div.appendChild(text);
  div.appendChild(img);
  div.setAttribute('id', plainID);
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
function displayVideo(id, title) {
  const video = document.getElementById('video');
  let src = document.getElementById('src');
  const url = 'videos/' + id;
  if(src == null) {
    src = document.createElement('source');
    src.setAttribute('id', 'src');
    src.setAttribute('type', 'video/mp4');
    video.appendChild(src);
  } 
  if(src.getAttribute('src') !== url) {
    src.setAttribute('src', 'videos/' + id);
    const titleElem = document.getElementById('title');
    titleElem.value = title;
    titleElem.setAttribute('readonly', '');
    video.load();
  }
}
