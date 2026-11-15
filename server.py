#!/usr/bin/env python3
"""
Simple, robust HTTP Server with REST API for Abdul Rehman's Portfolio Website.
Handles static asset serving and contact form submission storage.
"""

import http.server
import socketserver
import os
import json
import mimetypes
import uuid
from datetime import datetime

PORT = 8080
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CONTACTS_FILE = os.path.join(BASE_DIR, "contacts.json")

# Ensure proper mime types
mimetypes.init()
mimetypes.add_type("text/css", ".css")
mimetypes.add_type("application/javascript", ".js")
mimetypes.add_type("image/jpeg", ".jpg")
mimetypes.add_type("image/jpeg", ".jpeg")
mimetypes.add_type("image/png", ".png")
mimetypes.add_type("image/svg+xml", ".svg")
mimetypes.add_type("application/json", ".json")


def load_contacts():
    if not os.path.exists(CONTACTS_FILE):
        return []
    try:
        with open(CONTACTS_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return []


def save_contacts(contacts):
    try:
        with open(CONTACTS_FILE, "w", encoding="utf-8") as f:
            json.dump(contacts, f, indent=2, ensure_ascii=False)
        return True
    except Exception as e:
        print(f"Error saving contacts: {e}")
        return False


class PortfolioHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=BASE_DIR, **kwargs)

    def _set_headers(self, status=200, content_type="application/json"):
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        self.end_headers()

    def do_OPTIONS(self):
        self._set_headers(200)

    def do_GET(self):
        url_path = self.path.split("?")[0]
        
        # API: Get messages
        if url_path == "/api/messages":
            contacts = load_contacts()
            self._set_headers(200, "application/json")
            self.wfile.write(json.dumps({"success": True, "messages": contacts}).encode("utf-8"))
            return

        # Default static file handling
        return super().do_GET()

    def do_POST(self):
        url_path = self.path.split("?")[0]

        # API: Contact Form Submission
        if url_path == "/api/contact":
            try:
                content_len = int(self.headers.get("Content-Length", 0))
                post_body = self.rfile.read(content_len).decode("utf-8")
                data = json.loads(post_body)
                
                name = str(data.get("name", "")).strip()
                email = str(data.get("email", "")).strip()
                subject = str(data.get("subject", "General Inquiry")).strip()
                message = str(data.get("message", "")).strip()

                if not name or not email or not message:
                    self._set_headers(400)
                    self.wfile.write(json.dumps({
                        "success": False,
                        "error": "Name, email, and message are required."
                    }).encode("utf-8"))
                    return

                new_contact = {
                    "id": str(uuid.uuid4())[:8],
                    "name": name,
                    "email": email,
                    "subject": subject if subject else "General Inquiry",
                    "message": message,
                    "timestamp": datetime.utcnow().isoformat() + "Z"
                }

                contacts = load_contacts()
                contacts.insert(0, new_contact)
                save_contacts(contacts)

                self._set_headers(201)
                self.wfile.write(json.dumps({
                    "success": True,
                    "message": "Thank you! Your message has been received.",
                    "data": new_contact
                }).encode("utf-8"))
                print(f"[Contact Received] From {name} ({email}) - {subject}")
                return

            except Exception as e:
                self._set_headers(500)
                self.wfile.write(json.dumps({
                    "success": False,
                    "error": f"Internal server error: {str(e)}"
                }).encode("utf-8"))
                return

        # API: Delete message
        if url_path == "/api/messages/delete":
            try:
                content_len = int(self.headers.get("Content-Length", 0))
                post_body = self.rfile.read(content_len).decode("utf-8")
                data = json.loads(post_body)
                msg_id = data.get("id")

                if not msg_id:
                    self._set_headers(400)
                    self.wfile.write(json.dumps({"success": False, "error": "Message ID required"}).encode("utf-8"))
                    return

                contacts = load_contacts()
                contacts = [c for c in contacts if c.get("id") != msg_id]
                save_contacts(contacts)

                self._set_headers(200)
                self.wfile.write(json.dumps({"success": True, "message": "Message removed"}).encode("utf-8"))
                return
            except Exception as e:
                self._set_headers(500)
                self.wfile.write(json.dumps({"success": False, "error": str(e)}).encode("utf-8"))
                return

        self._set_headers(404)
        self.wfile.write(json.dumps({"success": False, "error": "Endpoint not found"}).encode("utf-8"))


class ReusableTCPServer(socketserver.TCPServer):
    allow_reuse_address = True


def run_server(port=PORT):
    for p in range(port, port + 10):
        try:
            with ReusableTCPServer(("", p), PortfolioHandler) as httpd:
                print(f"==========================================================")
                print(f"  Abdul Rehman Portfolio Server running!")
                print(f"  Local URL: http://localhost:{p}")
                print(f"  Static Root: {BASE_DIR}")
                print(f"==========================================================")
                httpd.serve_forever()
                break
        except OSError as e:
            if "Address already in use" in str(e) or e.errno == 10048 or "Only one usage" in str(e):
                print(f"Port {p} is in use, trying port {p + 1}...")
                continue
            else:
                raise e


if __name__ == "__main__":
    run_server()
