import http.server
import os

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
        #self.send_response(200)
        #self.send_header('Location', 'test');
        #self.end_headers();
        
        #print(self.path)
        #with open(self.path[1:], 'r') as file:
        #    exec(file.read())
        
        #first need to look at the self.path
        #remove the leading /, and split off and ignore query
        split = self.path.split('?')
        path = split[0][1:]
        
        #use the body instead of query for the client to send info to server
        content_len = int(self.headers.get('Content-Length'))
        body = self.rfile.read(content_len).decode('utf-8')
        #try to run the file in the given url
        try:
            with open(path, 'r') as file:
                exec(file.read())
            #send back success
            self.send_response(201)
            self.send_header('Location', locals()['location'])
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            #also send back the json file it wrote to
            with open(locals()['location'], 'r') as file:
                self.wfile.write(bytes(file.read(), 'utf8'))
        except FileNotFoundError:
            #send back an error
            self.send_response(404)
            self.send_header('Location', path)
            self.end_headers()
if __name__ == '__main__':
    server_address = ('', 8000)
    httpd = http.server.HTTPServer(server_address, PartialContentHandler)
    httpd.serve_forever()
