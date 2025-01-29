import json

def execute(body, query):
    #try to open ids.json
    location = 'json/ids.json'
    success = False
    message = '';
    try:
        file = open(location, 'r+')
        current_ids = json.load(file)
        #attempt to edit current_ids
        #assume body has an id and attr to edit
        i = body['id']
        for key in body:
            if key != 'id' and key in current_ids[i]:
                current_ids[i][key] = body[key]
        #write back to ids.json
        file.seek(0)
        json.dump(current_ids, file)
        file.truncate()
        file.close()
        success = True
    except FileNotFoundError:
        success = False
        message = 'No ids to edit'
    except KeyError:
        success = False
        message = 'Unable to edit given id'
    return success, location, message
