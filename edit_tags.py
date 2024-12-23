global json
import json

def addTag(tags, tag, body):
    try:
        tags[tag]['ids'].append(body['id'])
        tags[tag]['ids'] = list(set(tags[tag]['ids']))
    except KeyError:
        #there are no previous ids attached to this tag
        tags[tag] = {'ids': [body['id']]}
#assume body is id: [tags]
location = 'json/ids.json'

ids = {}
#try to get the current ids.json
try:
    with open(location, 'r+') as file:
        #set ids to be the stuff in ids.json
        ids = json.loads(file.read())
    #ids now has ids.json
    if(isinstance(body['tags'], str)):
        ids[body['id']]['tags'].append(body['tags'])
        ids[body['id']]['tags'] = list(set(ids[body['id']]['tags']))
    else:
        ids[body['id']]['tags'] = list(set(ids[body['id']]['tags'] + body['tags']))
    #write ids to ids.json
    with open(location, 'w+') as file:
        file.seek(0)
        json.dump(ids, file)
    #also add it to tags.json
    tags = {}
    try:
        with open('json/tags.json', 'r') as file:
            tags = json.loads(file.read())
    except FileNotFoundError:
        #if there is no file, then tags should be blank, and file will be created later
        pass
    #tags now has all the current tags in tags.json
    #add to the tags the id that it was just tied to
    if(isinstance(body['tags'], str)):
        addTag(tags, body['tags'], body)
    else:
        for tag in body['tags']:
            addTag(tags, tag, body)
    #add tags to tags.json
    with open('json/tags.json', 'w+') as file:
        file.seek(0)
        json.dump(tags, file)
    success = True
except FileNotFoundError:
    #if there are no ids, then must create_ids.py first
    success = False
    message = 'No Ids Exist'
except KeyError:
    success = False
    message = 'Malformed body. Body must be in form {id: "<id>", tags:<tags>}'

