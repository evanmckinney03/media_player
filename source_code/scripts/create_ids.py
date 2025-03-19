global json
import json
global hashlib
import hashlib
global time
import time
global random
import random
import os

def generate_id():
    curr = time.time()
    rand = random.randint(0, 15)
    string = str(curr) + str(rand)
    hash_obj = hashlib.sha256(string.encode())
    return hash_obj.hexdigest()


def execute(body, query):
    #location that the json file is at
    location = 'json/ids.json'

    current_ids = {}
    #try to open json/ids.json
    os.makedirs('json', exist_ok=True)
    
    try:
        with open(location, 'r+') as file:
            #set current_ids to be the stuff in ids.json
            current_ids = json.loads(file.read())
    except:
        #if the file does not exist, then current_ids should be empty
        pass

    #open tags.json
    tags_file = open('json/tags.json', 'a+')
    tags_file.seek(0)
    tags = json.load(tags_file)

    #get all the files currently in videos
    os.makedirs('videos', exist_ok=True)
    files = os.listdir('videos')

    #remove from files ids that are in current_ids
    if(len(current_ids) > 0):
        ids_set = set(current_ids.keys())
        files[:] = [x for x in files if x not in ids_set]

    #now files contains the list of videos that needs a unique id
    for f in files:
        #add the file extenstion as well
        new_name = generate_id() + '.' + f.split('.')[-1].lower()
        current_ids[new_name] = {'title': os.path.splitext(f)[0], 'tags': ['!new'], 'thumbnail-url': ''};
        #also rename the file in ../videos
        os.rename('videos/' + f, 'videos/' + new_name)
        #add !new tag
        try:
          tags['!new']['ids'].append(new_name)
        except:
          tags['!new'] = {'ids': [new_name]}

    #now current_ids contains all the unique id to old file names
    with open(location, 'w+') as file:
        file.seek(0)
        json.dump(current_ids, file)
    
    tags_file.close()
    with open('json/tags.json', 'w+') as file:
        file.seek(0)
        json.dump(tags, file)
    success = True
    message = 'hello'
    return success, location, message
