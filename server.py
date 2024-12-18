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
        self.send_response(200)
        self.send_header('Content-type', 'text/html')
        self.end_headers()
        
        print(self.path)
        #with open(self.path[1:], 'r') as file:
        #    exec(file.read())

        message = 'Hello, World! This is a POST response'
        self.wfile.write(bytes(message, 'utf8'))

if __name__ == '__main__':
    server_address = ('', 8000)
    httpd = http.server.HTTPServer(server_address, PartialContentHandler)
    httpd.serve_forever()
