import http.server
import os
import json
import importlib

class PartialContentHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if "Range" in self.headers:
            # Parse the Range header
            range_header = self.headers["Range"]
            start, end = range_header.replace("bytes=", "").split("-")

            # Get the file size
            try:
                path = self.translate_path(self.path)
                f = open(path, 'rb')
                fs = os.fstat(f.fileno()).st_size
                f.close()
            except:
                self.send_error(404, "File not found")
                return

            # Convert start and end to integers
            start = int(start) if start else 0
            end = int(end) if end else fs - 1

            # Validate the range
            if start >= fs:
                self.send_error(416, "Requested Range Not Satisfiable")
                return

            # Send the partial content
            self.send_response(206)
            self.send_header("Content-Range", f"bytes {start}-{end}/{fs}")
            self.send_header("Content-Length", str(end - start + 1))
            self.send_header("Content-Type", self.guess_type(path))
            self.end_headers()

            with open(path, 'rb') as f:
                f.seek(start)
                self.wfile.write(f.read(end - start + 1))
        else:
            # Handle requests without the Range header normally
            super().do_GET()
    def do_POST(self):
        #first need to look at the self.path
        #split off query
        split = self.path.split('?')
        path = split[0][1:]
        #add the scripts and the .py
        path = 'scripts.' + path
        query = '';
        if(len(split) > 1):
            query = split[1] 

        #use the body that the client sent
        content_len = int(self.headers.get('Content-Length'))
        body = self.rfile.read(content_len).decode('utf-8')
        try:
            body = json.loads(body)
        except json.JSONDecodeError:
            #just make body blank, and then if it is needed later, error will be caught there
            #makes it so that a malformed body won't err when body isn't needed
            body = {};
        #try to run the file in the given url
        try:
            script = importlib.import_module(path);
            #the given script will return 'success', 'location', and 'message'
            success, location, message = script.execute(body, query)
            if(success):
                self.send_response(201)
                self.send_header('Location', location)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                #also send back the json file it wrote to
                with open(location, 'r') as file:
                    self.wfile.write(bytes(file.read(), 'utf8'))
            else:
                self.send_response(400)
                self.send_header('Content-type', 'text/html')
                self.end_headers()

                self.wfile.write(bytes(message, 'utf8'))
        except ModuleNotFoundError:
            #send back an error
            self.send_response(404)
            self.send_header('Location', path)
            self.end_headers()
if __name__ == '__main__':
    server_address = ('', 8000)
    httpd = http.server.HTTPServer(server_address, PartialContentHandler)
    httpd.serve_forever()
