
let ids_obj;
let tags_obj;
const elemsToSearch = [];

window.onload = init()
function init() {
  displayFirstAndThumbnails();
  //add an event listener to the edit button to make the title editable
  const editTitleButton = document.getElementById('edit-title-button');
  editTitleButton.addEventListener('click', function() {
    const titleElem = document.getElementById('title');
    //set focus to titleElem
    titleElem.focus();
    titleElem.removeAttribute('readonly');
    title.addEventListener('blur', editTitle, {once: true});
  });
  const title = document.getElementById('title');
  title.addEventListener('keypress', function(event) {
    if(event.key === 'Enter') {
      //remove the event listener that waits for input to lose focus
      this.removeEventListener('blur', editTitle);
      editTitle.call(this);
      this.blur();
    }
  });
  const editTagButton = document.getElementById('edit-tag-button');
  const tagMenu = document.getElementById('tag-menu-div');
  editTagButton.addEventListener('click', function() {
    if(tagMenu.classList.contains('removed')) {
      editTagClicked();
    } else {
      doneTagsClicked();
    }
  });

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

  const updateThumbnailButton = document.getElementById('update-thumbnail-button');
  updateThumbnailButton.addEventListener('click', function() {
    this.disabled = true;
    updateThumbnail().then(function(e) {
      updateThumbnailButton.disabled = false;
    })
  });

}

async function displayFirstAndThumbnails(){
  try {
    const json = await getData('json/ids.json', 'GET');
    ids_obj = json;
  } catch {
    //error getting ids.json, meaning it does not exist
    await getData('create_ids.py', 'POST');
    //also generate thumbnails for the videos
    const json = await getData('create_thumbnails.py', 'POST');
    ids_obj = json;
  }
  await getTags();
  const ids = Object.keys(ids_obj);
  displayVideo(ids[0], ids_obj[ids[0]]['title']);
  for(let i = 0; i < ids.length; i++) {
    await createThumbnail(ids[i], ids_obj[ids[i]]['title']);
  }
  //after displaying the thumbnails, set elemsToSearch to all the thumbnails
  elemsToSearch.push(...document.getElementById('thumbnails-div').children);
}

async function editTitle() {
  this.setAttribute('readonly', '');
  const newTitle = this.value;
  //update the thumbnail
  //id is in the video element
  const id = getCurrentId();
  const div = document.getElementById(id);
  if(newTitle !== ids_obj[id]['title']) {
    //works because title is first child, change if that changes in future
    div.firstElementChild.innerHTML = newTitle;

    //make a post request to edit title on server
    ids_obj = await getData('edit_ids.py', 'POST', {id: id, title: newTitle});
  }
}

async function createThumbnail(id, title) {
  const text = document.createElement('p');
  text.innerHTML = title;
  text.setAttribute('class', 'thumbnail-text');
  const img = document.createElement('img');
  img.setAttribute('src', ids_obj[id]['thumbnail-url']);
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
    addTagsToDatalist();
  } else {
    addTagsToDatalist(ids_obj[src.getAttribute('src').slice('videos/'.length)]['tags']);
  }
  src.setAttribute('src', 'videos/' + id);
  const titleElem = document.getElementById('title');
  titleElem.value = title;
  titleElem.setAttribute('readonly', '');
  video.load();

  //also must display tags, but clear them first except the button
  const tagList = document.getElementById('tag-list');
  while(tagList.children.length > 1) {
    tagList.removeChild(tagList.firstChild);
  }
  displayTags();

  //also add the tags to the datalist
  removeTagsFromDatalist(ids_obj[id]['tags']);
}

//returns the id of the video currently playing
//includes file ext
function getCurrentId() {
  return document.getElementById('src').getAttribute('src').split('/')[1];
}

function editTagClicked() {
  //add to the tag menu
  const menuDiv = document.getElementById('tag-menu-div');
  menuDiv.classList.remove('removed'); 
  const tagListDiv = document.getElementById('tag-list');
  for(let i = 0; i < tagListDiv.children.length - 1; i++) {
    tagListDiv.children[i].lastElementChild.classList.remove('removed');
    tagListDiv.children[i].classList.remove('tag-padding');
  }
}

function doneTagsClicked() {
  if(tagsToSend.length != 0 || tagsToRemove.length != 0) {
    sendTags();
  }
  const tagListDiv = document.getElementById('tag-list');
  for(let i = 0; i < tagListDiv.children.length - 1; i++) {
    tagListDiv.children[i].lastElementChild.classList.add('removed');
    tagListDiv.children[i].classList.add('tag-padding');
  }
  document.getElementById('tag-menu-div').classList.add('removed');
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
    const tagDiv = document.createElement('div');
    tagDiv.setAttribute('id', 'tag,' + tagList[i]);
    tagDiv.classList.add('flex-grid');
    tagDiv.classList.add('tag');
    tagDiv.classList.add('tag-padding');
    const tagSpan = document.createElement('span');
    tagSpan.innerHTML = tagList[i];
    const x = document.createElement('span');
    x.addEventListener('click', tagClicked);
    x.classList.add('x');
    //if currently adding tags, then there should be an x
    if(document.getElementById('tag-menu-div').classList.contains('removed')) {
      x.classList.add('removed');
    }
    x.classList.add('material-icons');
    x.innerHTML = 'close';
    tagDiv.appendChild(tagSpan);
    tagDiv.appendChild(x);
    tagsElem.insertBefore(tagDiv, tagsElem.lastElementChild);
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
    removeTagsFromDatalist([tag]);
  } else {
    const index = tagsToRemove.indexOf(tag);
    if(index != -1) {
      tagsToRemove.splice(index, 1);
      displayTags(tag);
      removeTagsFromDatalist([tag]);
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
    tagDiv.removeChild(this.parentNode);
    //add tag to tags to remove
    //start from 4 because first three letters are 'tag,'
    const tag = this.parentNode.getAttribute('id').slice(4);
    tagsToRemove.push(tag);
    addTagsToDatalist([tag]);
  }
}

//send taglist to server
async function sendTags() {
  const id = getCurrentId();
  try {
    //if a tag is being removed, dont also send it
    const diff1 = tagsToSend.filter(x => !tagsToRemove.includes(x));
    if(diff1.length > 0) {
      const initLength = Object.keys(tags_obj).length;
      ids_obj = await getData('add_tags.py', 'POST', {id: id, tags: diff1});
      await getTags();
      if(Object.keys(tags_obj).length > initLength) {
        console.log('new key')
      }
    }
    //if a tag was added then removed, dont need to remove it still
    const diff2 = tagsToRemove.filter(x => !tagsToSend.includes(x));
    if(diff2.length > 0) {
      ids_obj = await getData('remove_tags.py', 'POST', {id: id, tags: diff2});
      await getTags();
      //diff two contains the tags that were removed
      for(let i = diff2.length - 1; i >= 0; i--) {
        if(tags_obj[diff2[i]]['ids'].length > 0) {
          diff2.splice(i, 1);
        }
      }
      console.log(diff2);
      //diff two now contains tags with no ids, so remove them
      tags_obj = await getData('delete_entry.py', 'POST', {tags: diff2});
    }
  } catch ({name, message}){
    console.error('Unable to send tags to server');
    console.log(name)
    console.log(message)
  }
  tagsToSend.length = 0;
  tagsToRemove.length = 0;
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

//gets the current position of the video and updates the thumbnail to be that frame
async function updateThumbnail() {
  const video = document.getElementById('video');
  //server expects timestamp to be in milliseconds
  const timestamp = 1000 * video.currentTime;
  const id = getCurrentId();
  //should probably be in a try catch
  ids_obj = await getData('create_thumbnails.py', 'POST', {ids: id, timestamps: timestamp});
  //change the thumbnail img url to the new one
  const img = document.getElementById(id).querySelector('img');
  img.src = ids_obj[id]['thumbnail-url'];
}

//adds tags from tags_obj to the datalist
function addTagsToDatalist(tagsToAdd) {
  const tags = tagsToAdd === undefined ? Object.keys(tags_obj) : tagsToAdd;
  const datalist = document.getElementById('tags-datalist');
  for(let i = 0; i < tags.length; i++) {
    const option = document.createElement('option');
    option.setAttribute('value', tags[i]);
    option.setAttribute('id', 'opt,' + tags[i]);
    datalist.appendChild(option);
  }
}

//removes the tags in the given array from the datalist
function removeTagsFromDatalist(tags) {
  const datalist = document.getElementById('tags-datalist');
  for(let i = 0; i < tags.length; i++) {
    const opt = document.getElementById('opt,' + tags[i]);
    if(opt !== undefined) {
      datalist.removeChild(opt);
    }
  }
}
