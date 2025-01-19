import json

def execute(body, query):
    location = 'json/ids.json'
    success = False
    message = ''

    try:
        id_file = open(location, 'r+');
        tag_file = open('json/tags.json', 'r+');

        ids = json.loads(id_file.read());
        tags = json.loads(tag_file.read());

        i = body['id']
        tags_to_remove = body['tags']
        if isinstance(tags_to_remove, str):
            tags_to_remove = [tags_to_remove];

        for tag in tags_to_remove:
            ids[i]['tags'].remove(tag)
            tags[tag]['ids'].remove(i)

        #write ids and tags to files
        id_file.seek(0)
        json.dump(ids, id_file)
        id_file.truncate()
        tag_file.seek(0)
        json.dump(tags, tag_file)
        tag_file.truncate()

        id_file.close()
        tag_file.close()

        success = True;
    except FileNotFoundError:
        message = 'Tags must exist to remove them'
        success = False
    except KeyError:
        message = 'Malformed Body. Must be in form {id:<id>, tags[tags to remove]}, and id must exist in json/ids.json'
        success = False
    except ValueError:
        message = 'At least one tag trying to be removed does not belong to the given id. Tags are case sensitive'
        success = False
    return success, location, message
