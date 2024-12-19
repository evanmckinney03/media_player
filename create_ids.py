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

#location that the json file is at
location = 'json/ids.json'

current_ids = {}
#try to open json/ids.json
try:
    with open(location, 'r+') as file:
        #set current_ids to be the stuff in ids.json
        current_ids = json.loads(file.read())
except:
    #if the file does not exist, then current_ids should be empty
    pass

#get all the files currently in videos
files = os.listdir('videos')

#remove from files ids that are in current_ids
if(len(current_ids) > 0):
  ids_set = set(current_ids.keys())
  files[:] = [x for x in files if x not in ids_set]

#now files contains the list of videos that needs a unique id
for f in files:
    new_name = generate_id() + '.' + f.split('.')[-1]
    #add the file extenstion as well
    current_ids[new_name] = {'title': f, 'tags': []};
    #also rename the file in ../videos
    os.rename('videos/' + f, 'videos/' + new_name)

#now current_ids contains all the unique id to old file names
with open(location, 'w+') as file:
    file.seek(0)
    json.dump(current_ids, file)

