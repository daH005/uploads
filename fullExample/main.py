from flask import (
    Flask,
    request,
    send_from_directory,
    Response,
    render_template,
    redirect,
    url_for,
)
from os import listdir, remove

app: Flask = Flask(__name__)
FOLDER: str = 'files'


@app.route('/')
def home() -> str:
    return render_template('index.html')


@app.route('/form', methods=['POST'])
def form() -> Response:
    for filename in request.form.getlist('filenamesToDelete'):
        remove(FOLDER + '/' + filename)

    for file in request.files.getlist('files'):
        if not file.filename:
            continue
        file.save(FOLDER + '/' + file.filename)

    return redirect(url_for('home'))


@app.route('/js/<string:path>')
def get_js(path: str) -> Response:
    return send_from_directory('../js', path)


@app.route('/css')
def get_css() -> Response:
    return send_from_directory('../', 'style.css')


@app.route('/get_exist_files')
def get_exist_files() -> list[dict[str, str]]:
    files = []
    for filename in listdir(FOLDER):
        if filename.startswith('.git'):
            continue

        files.append({
            'filename': filename,
            'url': '/get_file/' + filename,
        })

    return files


@app.route('/get_file/<string:filename>')
def get_file(filename: str) -> Response:
    return send_from_directory(FOLDER, filename)


if __name__ == '__main__':
    app.run('0.0.0.0', 8081, True)
