# Simple Python HTTP Server with custom 404 handling and connection error recovery
# This helps prevent Chrome DevTools 404 errors and handles connection issues during development

import http.server
import socketserver
import os
import socket
from urllib.parse import urlparse

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        try:
            # Handle .well-known requests (return 404 silently)
            if self.path.startswith('/.well-known/'):
                self.send_response(404)
                self.send_header('Content-type', 'text/plain')
                self.end_headers()
                self.wfile.write(b'Not Found')
                return
            
            # Handle Chrome DevTools requests
            if 'devtools' in self.path or 'chrome-extension' in self.path:
                self.send_response(404)
                self.send_header('Content-type', 'text/plain')
                self.end_headers()
                self.wfile.write(b'Not Found')
                return
            
            # Handle manifest.json with correct content type
            if self.path == '/manifest.json':
                self.send_response(200)
                self.send_header('Content-type', 'application/manifest+json')
                self.send_header('Cache-Control', 'no-cache')
                self.end_headers()
                try:
                    with open('manifest.json', 'rb') as f:
                        self.wfile.write(f.read())
                except FileNotFoundError:
                    self.send_error(404, "Manifest file not found")
                return
            
            # Handle favicon.ico with correct content type
            if self.path == '/favicon.ico':
                self.send_response(200)
                self.send_header('Content-type', 'image/x-icon')
                self.send_header('Cache-Control', 'public, max-age=86400')
                self.end_headers()
                try:
                    with open('favicon.ico', 'rb') as f:
                        self.wfile.write(f.read())
                except FileNotFoundError:
                    self.send_error(404, "Favicon file not found")
                return
            
            # Serve static files normally
            return super().do_GET()
            
        except (ConnectionAbortedError, ConnectionResetError, BrokenPipeError) as e:
            # Client disconnected, silently ignore
            pass
        except Exception as e:
            # Log other unexpected errors
            print(f"❌ Unexpected error in do_GET: {e}")
    
    def log_message(self, format, *args):
        # Filter out .well-known and devtools requests from logs
        if not any(x in args[0] for x in ['.well-known', 'devtools', 'chrome-extension']):
            super().log_message(format, *args)
    
    def handle(self):
        try:
            super().handle()
        except (ConnectionAbortedError, ConnectionResetError, BrokenPipeError):
            # Client disconnected, silently ignore
            pass
        except Exception as e:
            print(f"❌ Connection error: {e}")

class RobustTCPServer(socketserver.TCPServer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Allow socket reuse to prevent "Address already in use" errors
        self.allow_reuse_address = True
    
    def handle_error(self, request, client_address):
        # Override to handle connection errors gracefully
        import traceback
        import sys
        
        exc_type, exc_value, exc_traceback = sys.exc_info()
        
        # Ignore common connection errors
        if isinstance(exc_value, (ConnectionAbortedError, ConnectionResetError, BrokenPipeError)):
            return        # Log other errors
        print(f"❌ Server error from {client_address}: {exc_value}")

if __name__ == "__main__":
    PORT = 8000
    
    # Change to the directory containing your files
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    with RobustTCPServer(("", PORT), CustomHTTPRequestHandler) as httpd:
        print(f"🚀 BalanCoffee development server running at http://localhost:{PORT}")
        print(f"📁 Serving files from: {os.getcwd()}")
        print("🛑 Press Ctrl+C to stop the server")
        print("✨ 404 errors for .well-known and DevTools requests are filtered out")
        print("🔧 Connection errors are handled gracefully")
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n🛑 Server stopped")
