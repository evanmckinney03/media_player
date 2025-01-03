
let ids_obj;
let tags_obj;
const elemsToSearch = [];

window.onload = init()
function init() {
  displayFirstAndThumbnails();
  //get tags from server
  getTags();
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
  const editTagButton = document.getElementById('edit-tag-button');
  editTagButton.addEventListener('click', editTagClicked);

  const doneTagsButton = document.getElementById('tag-done-button');
  doneTagsButton.addEventListener('click', doneTagsClicked);

  const tagInputField = document.getElementById('tag-input');
  tagInputField.addEventListener('keypress', function(event) {
    if(event.key == 'Enter') {
      if(this.value !== '') {
        addTag(this.value);
        this.value = '';
      }
    }
  });
  
  const searchBy = document.getElementById('search-by');
  let searchByValue = searchBy.value;
  searchBy.addEventListener('input', function(e) {
    searchByValue = this.value;
    //should probably also search values
  });

  const searchInput = document.getElementById('search-input');
  searchInput.addEventListener('input', function(e) {
    if(searchByValue === 'title') {
      searchTitles(this.value);
    } else {
      searchTags(this.value);
    }
  });

  const clearSearchButton = document.getElementById('clear-search-button');
  clearSearchButton.addEventListener('click', function(e) {
    this.classList.add('removed');
    clearSearch();
  });

  searchInput.addEventListener('keypress', function(event) {
    if(event.key == 'Enter') { 
      clearSearchButton.classList.remove('removed');
      addToSearchList(this.value);
      this.value = '';
    }
  });
}

async function editTitle() {
  this.setAttribute('readonly', '');
  const newTitle = this.value;
}

async function displayFirstAndThumbnails(){
  try {
    const json = await getData('json/ids.json', 'GET');
    ids_obj = json;
  } catch {
    //error getting ids.json, meaning it does not exist
    const json = await getData('create_ids.py', 'POST');
    //also generate thumbnails for the videos
    await getData('create_thumbnails.py', 'POST');
    ids_obj = json;
  }
  const ids = Object.keys(ids_obj);
  displayVideo(ids[0], ids_obj[ids[0]]['title']);
  for(let i = 0; i < ids.length; i++) {
    await createThumbnail(ids[i], ids_obj[ids[i]]['title']);
  }
  //after displaying the thumbnails, set elemsToSearch to all the thumbnails
  elemsToSearch.push(...document.getElementById('thumbnails-div').children)
}

async function editTitle() {
  this.setAttribute('readonly', '');
  const newTitle = this.value;
  //update the thumbnail
  //id is in the video element
  const id = getCurrentId();
  const div = document.getElementById(id);
  //works because title is first child, change if that changes in future
  div.firstElementChild.innerHTML = newTitle;

  //make a post request to edit title on server
  ids_obj = getData('edit_ids.py', 'POST', {id: id + '.mp4', title: newTitle});
}

async function createThumbnail(id, title) {
  const plainID = id.split('.')[0];
  const text = document.createElement('p');
  text.innerHTML = title;
  text.setAttribute('class', 'thumbnail-text');
  const img = document.createElement('img');
  img.setAttribute('src', 'thumbnails/' + plainID + '.jpg');
  img.setAttribute('class', 'thumbnail-img');
  img.addEventListener('click', function() {
    //the parent is the div container whose id is the video name
    const id = this.parentNode.getAttribute('id');
    const currentId = getCurrentId();
    if(id != currentId) {
      displayVideo(id, title);
    }
  });
  const div = document.createElement('div');
  div.appendChild(text);
  div.appendChild(img);
  div.setAttribute('id', id);
  div.setAttribute('class', 'thumbnail');
  const pdiv = document.getElementById('thumbnails-div');
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

//get the tags from the server
async function getTags() {
  try {
    tags_obj = await getData('json/tags.json', 'GET');
  } catch {
    tags_obj = {};
  }
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
  src.setAttribute('src', 'videos/' + id);
  const titleElem = document.getElementById('title');
  titleElem.value = title;
  titleElem.setAttribute('readonly', '');
  video.load();

  //also must display tags, but clear them first
  const tagList = document.getElementById('tag-list');
  while(tagList.firstChild) {
    tagList.removeChild(tagList.lastChild);
  }
  displayTags();
}

//returns the id of the video currently playing
//includes file ext
function getCurrentId() {
  return document.getElementById('src').getAttribute('src').split('/')[1];
}

function editTagClicked() {
  //add to the tag menu
  const div = document.getElementById('tag-menu-div');
  div.classList.remove('removed');  
}

function doneTagsClicked() {
  this.parentNode.classList.add('removed');
  if(tagsToSend.length != 0 || tagsToRemove.length != 0) {
    sendTags();
  }
}

//will update tags
//if tag is passed in, will append tag to previously displayed tags
//otherwise, will update based on ids_obj
function displayTags(tag) {
  let tagList = [];
  const length = 'Tags:<br>'.length;
  if(tag === undefined) {
    const id = getCurrentId();
    tagList = ids_obj[id]['tags'];
  } else {
    tagList.push(tag);
  }
  const tagsElem = document.getElementById('tag-list');
  for(let i = 0; i < tagList.length; i++) {
    const span = document.createElement('span');
    span.addEventListener('click', tagClicked);
    span.setAttribute('id', 'tag,' + tagList[i]);
    span.innerHTML = tagList[i] + ', ';
    tagsElem.appendChild(span)
  }
}

const tagsToSend = [];
//add tags to a list, dont send it to server yet
//also displayTags
function addTag(tag) {
  //do not add duplicates
  const id = getCurrentId();
  if(!ids_obj[id]['tags'].includes(tag) && !tagsToSend.includes(tag)) {
    tagsToSend.push(tag);
    displayTags(tag);
  } else {
    const index = tagsToRemove.indexOf(tag);
    if(index != -1) {
      tagsToRemove.splice(index, 1);
      displayTags(tag);
    }
  }
}

const tagsToRemove = [];
function tagClicked() {
  //for now, check if tag menu is removed, if so then don't do anything
  //ideally, when edit tag is clicked, x's will appear next to the tag
  //and when clicked this func will run
  const div = document.getElementById('tag-menu-div');
  if(!div.classList.contains('removed')) {
    const id = getCurrentId();
    const tagDiv = document.getElementById('tag-list');
    tagDiv.removeChild(this);
    //add tag to tags to remove
    //start from 4 because first three letters are 'tag,'
    const tag = this.getAttribute('id').slice(4);
    tagsToRemove.push(tag);
  }
}

//send taglist to server
async function sendTags() {
  const id = getCurrentId();
  try {
    //if a tag is being removed, dont also send it
    const diff1 = tagsToSend.filter(x => !tagsToRemove.includes(x));
    if(diff1.length > 0) {
      ids_obj = await getData('add_tags.py', 'POST', {id: id, tags: diff1});
      tags_obj = getTags();
    }
    //if a tag was added then removed, dont need to remove it still
    const diff2 = tagsToRemove.filter(x => !tagsToSend.includes(x));
    if(diff2.length > 0) {
      ids_obj = await getData('remove_tags.py', 'POST', {id: id, tags: diff2});
      tags_obj = getTags();
    }
  } catch {
    console.error('Unable to send tags to server');
  }
}

//during init, set this to all the thumbnail divs
//search by titles and display the thumbnails
function searchTitles(value) {
  //for now, just linear search through the titles
  for(let i = 0; i < elemsToSearch.length; i++) {
    const title = ids_obj[elemsToSearch[i].getAttribute('id')]['title'];
    if(title.toLowerCase().includes(value.toLowerCase())) {
      elemsToSearch[i].classList.remove('removed');
    } else {
      elemsToSearch[i].classList.add('removed');
    }
  }
}

//search by tags and display the thumbnails
function searchTags(value) {
  //find the tag
  const tag = tags_obj[value];
  if(tag !== undefined) {
    const tagSet = new Set(tag['ids']);
    for(let i = 0; i < elemsToSearch.length; i++) {
      if(tagSet.has(elemsToSearch[i].getAttribute('id'))) {
        elemsToSearch[i].classList.remove('removed');
      } else {
        elemsToSearch[i].classList.add('removed');
      }
    }
  } else {
    searchTitles('');
  }
}

//adds the given value to the search list
//sets elemsToSearch to only currently showing thumbnails
function addToSearchList(value) {
  const searchList = document.getElementById('search-list');
  const item = document.createElement('span');
  item.setAttribute('id', 'sl,' + value + ', ');
  item.innerHTML = value;
  searchList.appendChild(item);
  for(let i = elemsToSearch.length - 1; i >= 0; i--) {
    if(elemsToSearch[i].classList.contains('removed')) {
      elemsToSearch.splice(i, 1);
    }
  }
}

//reshow all the thumbnails, clear the search list, reset elemsToSearch
function clearSearch() {
  elemsToSearch.length = 0;
  elemsToSearch.push(...document.getElementById('thumbnails-div').children);
  const searchList = document.getElementById('search-list');
  while(searchList.firstChild) {
    searchList.removeChild(searchList.lastChild);
  }
  searchTitles('');
}
