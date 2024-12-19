global json
import json

#assume body is id: [tags]

location = 'json/ids.json'

ids = {}
#try to get the current ids.json
try:
    with open(location, 'r+') as file:
        #set ids to be the stuff in ids.json
        ids = json.loads(file.read())
except:
    #if there are no ids, then must create_ids.py first
    #for now just exit, should probably add a descriptive error
    exit()

#ids now has ids.json
ids[body['id']]['tags'] = ids[body['id']]['tags'] + body['tags']

#write ids to ids.json
with open(location, 'w+') as file:
    file.seek(0)
    json.dump(ids, file)
