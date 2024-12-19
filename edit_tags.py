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
        #ids now has ids.json
        ids[body['id']]['tags'] = list(set(ids[body['id']]['tags'] + body['tags']))
        #write ids to ids.json
        with open(location, 'w+') as file:
            file.seek(0)
            json.dump(ids, file)
except FileNotFoundError:
    #if there are no ids, then must create_ids.py first
    #for now just exit, should probably add a descriptive error
    success = False
    message = 'No Ids Exist'
except KeyError:
    success = False
    message = 'Malformed body. Body must be in form {id: "<id>", tags:[<tags>]}'
except TypeError:
    success = False
    message = 'A body must be attached'

success = True
