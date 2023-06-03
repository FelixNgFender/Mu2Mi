<div style="display: flex;">
  <div style="flex: 1;">
    <img src="docs/Mu2Mi.svg" alt="Mu2Mi English logo" title="Mu2Mi English logo">
  </div>
  <div style="background-color: #FB5A00; width: 2px; margin-bottom: 5px"></div>
  <div style="flex: 1;">
    <img src="docs/ムツミ.svg" alt="Mu2Mi Japanese logo" title="Mu2Mi Japanese logo">
  </div>
</div>

# Mu2Mi: MIDI Multitrack Generation from Audio

Mu2Mi is a web application that generates isolated stem tracks and MIDI data of vocal, accompaniment, bass, and drum from any audio file (preferably songs c:).

It utilizes [Spleeter](https://github.com/deezer/spleeter) to perform source separation and [Basic Pitch](https://github.com/spotify/basic-pitch) to generate MIDI files from the separated audio. The application is built using [Django](https://www.djangoproject.com/) and [Next.js](https://nextjs.org/) and packaged using [Docker](https://www.docker.com/).

Mu2Mi can be installed with or without Docker. However, we recommend using Docker as it is the easiest way to get started.

## Platform Support

Mu2Mi local installation has only been tested on WSL2 (Windows Subsystem for Linux) using Ubuntu 22.04.2 LTS. It may work on other platforms, but we cannot guarantee that it will.

> **Note**: For Windows installation, `backend\entrypoint.sh` must be converted to `LF` line endings before building the Docker image. This can be done using any text editor that supports line ending conversion. However, Windows is currently not supported due to Python dependency issues.

## Installation with Docker

To use Mu2Mi, follow these steps:

1. Clone the repository:

   ```shell
   git clone https://github.com/FelixNgFender/Mu2Mi.git
   ```

2. Navigate to the `backend/` directory:

   ```shell
   cd Mu2Mi/backend/
   ```

3. Create a `.env` file and add the following environment variables:

   ```shell
   DJANGO_ENV=production
   # Set to 0 in production
   DEBUG=0
   SECRET_KEY='django-insecure-58f*tv*06rz%h^3iea4%&#a4*icpklnd8(+scnsi&@e3st#4(d'
   DJANGO_ALLOWED_HOSTS=www.example.com localhost 127.0.0.1 [::1]

   DJANGO_ADMIN_USER=felixng
   DJANGO_ADMIN_EMAIL=ngthinh302@gmail.com
   DJANGO_ADMIN_PASSWORD=Toanthinh123.

   DATABASE=postgres

   DB_ENGINE=django.db.backends.postgresql
   DB_DATABASE=trackdb2
   DB_USER=postgres
   DB_PASSWORD=1234
   DB_HOST=db
   DB_PORT=5432
   ```

4. Navigate to the `django_app/mainapp/` directory:

   ```shell
   cd django_app/mainapp/
   ```

5. Create a `local_settings.py` file and add the following environment variables:

   ```python
   import os
   BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

   #################################################################
      ##  Get Django environment set by docker (i.e either development or production), or else set it to local ##
   #################################################################
   try:
      DJANGO_ENV = os.environ.get("DJANGO_ENV")
   except:
      DJANGO_ENV = 'local'

   #################################################################
      ##  If Django environement has been set by docker it would be either development or production otherwise it would be undefined or local ##
   #################################################################
   if DJANGO_ENV == 'development' or DJANGO_ENV == 'production':

      try:
         SECRET_KEY = os.environ.get("SECRET_KEY")
      except:
         SECRET_KEY = 'localsecret'

      try:
         DEBUG = int(os.environ.get("DEBUG", default=0))
      except:
         DEBUG = False

      try:
         ALLOWED_HOSTS = os.environ.get("DJANGO_ALLOWED_HOSTS").split(" ")
      except:
         ALLOWED_HOSTS = ['127.0.0.1', '0.0.0.0', 'localhost']

      DATABASES = {
         "default": {
               "ENGINE": os.environ.get("DB_ENGINE", "django.db.backends.sqlite3"),
               "NAME": os.environ.get("DB_DATABASE", os.path.join(BASE_DIR, "db.sqlite3")),
               "USER": os.environ.get("DB_USER", "user"),
               "PASSWORD": os.environ.get("DB_PASSWORD", "password"),
               "HOST": os.environ.get("DB_HOST", "localhost"),
               "PORT": os.environ.get("DB_PORT", "5432"),
         }
      }
   else:
      SECRET_KEY = 'localsecret'
      DEBUG = True
      ALLOWED_HOSTS = ['127.0.0.1', '0.0.0.0', 'localhost']
      DATABASES = {
         'default': {
               'ENGINE': 'django.db.backends.postgresql_psycopg2',
               'NAME': 'trackdb2',
               'USER': 'postgres',
               'PASSWORD': '1234',
               'HOST': '127.0.0.1',
               'PORT': '5432',
         }
      }

   #################################################################
      ##  (CORS) Cross-Origin Resource Sharing Settings ##
   #################################################################
   CORS_ORIGIN_ALLOW_ALL = True

   #################################################################
      ##  STATIC FILES ROOT AND URL ##
   #################################################################
   STATIC_ROOT = os.path.join(BASE_DIR, 'static')
   STATIC_URL = '/static/'
   ```

6. Go back to the root directory:

   ```shell
   cd ../../
   ```

7. Make sure Docker is up and running and start the application using Docker Compose:

   ```shell
   docker compose up
   ```

8. Access Mu2Mi in your web browser at [http://localhost:8000/](http://localhost:8000/).

9. Upload an audio file and wait for approximately 1-2 minutes.

10. Retrieve the generated ZIP file containing the MIDI multitrack output and separated audio files.

> **Note**: If you encounter a 504 Gateway Timeout error, please try uploading the file again. This error occurs when the server is downloading model weights, which should happen only once.

## Installation without Docker

1. Install ffmpeg as suggested by [Spleeter](https://github.com/deezer/spleeter#quick-start)

2. Clone the repository:

   ```shell
   git clone https://github.com/FelixNgFender/Mu2Mi.git
   ```

3. Create and activate a Python virtual environment:

   ```shell
   cd Mu2Mi/backend/
   python3 -m venv .venv
   source .venv/bin/activate
   ```

4. Install the required Python packages:

   ```shell
   cd django_app/
   pip install -r requirements.txt
   ```

5. Go back to `backend/` and create a `.env` file and add the following environment variables:

   ```shell
   cd ../
   ```

   ```shell
   DJANGO_ENV=production
   # Set to 0 in production
   DEBUG=0
   SECRET_KEY='django-insecure-58f*tv*06rz%h^3iea4%&#a4*icpklnd8(+scnsi&@e3st#4(d'
   DJANGO_ALLOWED_HOSTS=www.example.com localhost 127.0.0.1 [::1]

   DJANGO_ADMIN_USER=felixng
   DJANGO_ADMIN_EMAIL=ngthinh302@gmail.com
   DJANGO_ADMIN_PASSWORD=Toanthinh123.

   DATABASE=postgres

   DB_ENGINE=django.db.backends.postgresql
   DB_DATABASE=trackdb2
   DB_USER=postgres
   DB_PASSWORD=1234
   DB_HOST=db
   DB_PORT=5432
   ```

6. Migrate the database:

   ```shell
   cd django_app/
   python3 manage.py migrate
   ```

7. Start the Django development server:

   ```shell
   python3 manage.py runserver
   ```

8. Let the server run in the background and open a new terminal window.

9. Go to `frontend/next_app/` and install the required Node packages:

   ```shell
   cd frontend/next_app/
   npm install
   ```

10. Start the Next.js development server:

```shell
npm run dev
```

11. Access Mu2Mi in your web browser at [http://localhost:3000/](http://localhost:3000/).

12. Upload an audio file and wait for approximately 1-2 minutes.

13. Retrieve the generated ZIP file containing the MIDI multitrack output and separated audio files.

## Usage

You can either run Mu2Mi locally or use its web version (to be deployed).
