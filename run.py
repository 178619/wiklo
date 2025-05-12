from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib import parse
import os
import json
import time
import mimetypes
import uuid

try:
    with open('./config.json', 'rb') as file:
        config = json.load(file)
except FileNotFoundError:
    config = {}
    print('config.json could not be found. Attempting to make a new one...')

while not config.get('name') or type(config.get('name')) != str:
    config['name'] = input('Name: ')

while type(config.get('description')) != str:
    config['description'] = input('Short Description (Default: \'\'): ')

while type(config.get('host')) != str:
    config['host'] = input('Host (Default: \'\'): ')

while not config.get('port') or type(config.get('port')) != int:
    try:
        port = input('Port (Default: 10001): ')
        port = int(port)
        config['port'] = port
    except ValueError:
        if port == '':
            port = 10001
            config['port'] = port
            break
        print('invalid value')
        continue
    if port < 1 or port > 65535:
        print('invalid value')
        continue
    del port
    break

if not config.get('dir'):
    config['dir'] = 'dist'

__WIKLO_DEBUG__ = config.get('debug', False)

with open('./config.json', 'wb') as file:
    file.write(json.dumps(config, ensure_ascii=False, indent=4).encode('utf-8'))

print('config loaded.')

if not os.path.isdir(config['dir']+'/data'):
    os.mkdir(config['dir']+'/data')

try:
    with open(f'./{config['dir']}/auto.js', 'wb') as file:
        file.write(('''// Generated automatically. Do not modify manually.
(()=>{
Wiklo.title = `''' + config['name'].replace('`', '\\`') + '''`
})()''').encode('utf-8'))
except:
    pass

try:
    with open(f'./{config['dir']}/metadata.json', 'rb') as file:
        metadata = json.load(file)
except FileNotFoundError:
    metadata = {}
    with open(f'./{config['dir']}/metadata.json', 'wb') as file:
        file.write(json.dumps(metadata, ensure_ascii=False, indent=4).encode('utf-8'))

try:
    with open('./base.html', 'r', encoding='utf-8') as file:
        base = file.read()
except FileNotFoundError:
    base = ''
    with open('./base.html', 'wb') as file:
        file.write(base.encode('utf-8'))

base = base.replace('<!--WIKLO.NAME-->', config['name']).replace('<!--WIKLO.DESCRIPTION-->', config['description'])


homepage = base.replace('<!--WIKLO.CONTENTS-->', '<section></section>')
with open(f'./{config['dir']}/index.html', 'wb') as file:
    file.write(homepage.encode('utf-8'))

try:
    with open('./editor.html', 'r', encoding='utf-8') as file:
        editor = file.read()
except FileNotFoundError:
    editor = ''
    with open('./editor.html', 'wb') as file:
        file.write(editor.encode('utf-8'))
editpage = base.replace('<!--WIKLO.CONTENTS-->', editor)
del editor

del base

class Server(BaseHTTPRequestHandler):
    def redirect(self, location):
        self.send_response(307)
        self.send_header("Content-type", location)
        self.end_headers()
        return
    def sendText(self, text, content_type='text/plain', status=200):
        self.send_response(status)
        if content_type: self.send_header("Content-type", content_type)
        self.end_headers()
        return self.wfile.write(bytes(text, 'utf-8'))
    def sendFile(self, file, content_type='application/json', status=200):
        self.send_response(status)
        if content_type: self.send_header("Content-type", content_type)
        self.end_headers()
        return self.wfile.write(file.read())
    def do_GET(self):
        path = self.path.split('?')[0]
        if path == '/':
            self.sendText(homepage, 'text/html')
            return
        if path == '/edit':
            self.sendText(editpage, 'text/html')
            return
        try:
            if path.startswith(f'/{config['dir']}/'): path = path[(len(config['dir'])+1):]
            path = config['dir'] + path
            if path.endswith('/'): path += 'index.html'
            with open(path, 'rb') as file:
                self.sendFile(file, mimetypes.guess_type(path.split('/')[-1])[0])
        except:
            self.send_error(404)
        return
    def do_PUT(self):
        params = dict(parse.parse_qsl(parse.urlsplit(self.path).query))
        newData = {}
        if params.get('uuid'):
            if params.get('uuid') not in metadata.keys():
                self.sendText('{"error": "UUID_NOT_FOUND", "description": "UUID does not match any article"}', 'application/json', 400)
                return
            if metadata[params['uuid']].get('revised'):
                self.sendText('{"error": "REVISED", "description": "Edits must be based on the latest revision"}', 'application/json', 400)
                return
        if not params.get('name'):
            self.sendText('{"error": "MISSING_NAME", "description": "Name is a required field"}', 'application/json', 400)
            return
        data = self.rfile.read(int(self.headers.get('content-length')))
        newData['name'] = params.get('name')
        newData['author'] = params.get('author')
        newData['lastModification'] = time.time_ns() // 1000000
        newData['creation'] = metadata[params.get('uuid')]['creation'] if params.get('uuid') in metadata.keys() else newData['lastModification']
        # newData['displayName'] = params.get('displayName')
        # newData['officialName'] = params.get('officialName')
        # newData['originalName'] = params.get('originalName')
        # newData['latinName'] = params.get('latinName')
        # newData['commonName'] = params.get('commonName')
        # newData['abbreviation'] = params.get('abbreviation')
        # newData['language'] = params.get('language')
        # newData['languageNames'] = {}
        # newData['otherLanguages'] = []
        newData['categories'] = []
        for x in params.get('categories', '').split(';'):
            if x in metadata.keys():
                newData['categories'].append(x)
        if params.get('iscategory') == 'true':
            newData['categories'].append(True)
        if params.get('isdisambiguation') == 'true':
            newData['categories'].append(False)
        newData['MIMEType'] = (params.get('type') or self.headers.get('content-type') or 'application/octet-stream').split(';')[0]
        newData['encrypted'] = False
        uid = uuid.uuid4().hex
        if params.get('uuid'):
            metadata[params.get('uuid')]['revised'] = True
            if metadata[params.get('uuid')].get('revisions'):
                newData['revisions'] = metadata[params.get('uuid')].get('revisions', []) + [params.get('uuid')]
                del metadata[params.get('uuid')]['revisions']
            else:
                newData['revisions'] = [params.get('uuid')]
        try:
            with open(f'./{config['dir']}/data/'+uid, 'wb') as file:
                file.write(data)
            metadata[uid] = newData
            with open(f'./{config['dir']}/metadata.json', 'wb') as file:
                file.write(json.dumps(metadata, ensure_ascii=False, indent=4).encode('utf-8'))
            self.sendText('{"uuid": "'+uid+'"}', 'application/json', 201)
            return
        except:
            self.send_error(500)
            return
    def do_HEAD(self):
        if self.path == '/editable':
            self.send_response(202)
            self.end_headers()
            return
        self.send_response(400)
        self.end_headers()
        return
    def do_DELETE(self):
        path = self.path.split('?')[0]
        if path.startswith('/'): path = path[1:]
        if path.endswith('/'): path = path[:-1]
        if len(path) != 32: return self.send_error(400)
        if '.' in path: return self.send_error(400)
        try:
            # os.remove(f'./{config['dir']}/data/'+path)
            metadata[path]['revised'] = True
            with open(f'./{config['dir']}/metadata.json', 'wb') as file:
                file.write(json.dumps(metadata, ensure_ascii=False, indent=4).encode('utf-8'))
            self.send_response(204)
            self.end_headers()
            return
        except:
            self.send_error(500)
            return
            
if __name__ == "__main__":
    webServer = HTTPServer((config['host'], config['port']), Server)

    print("server started.")

    try:
        webServer.serve_forever()
    except KeyboardInterrupt:
        pass

    webServer.server_close()
    print("server stopped.")
