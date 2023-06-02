<div style="display: flex;">
  <div style="flex: 1;">
    <img src="docs/Mu2Mi.svg" alt="Mu2Mi English logo" title="Mu2Mi English logo">
  </div>
  <div style="background-color: #FB5A00; width: 2px; margin-bottom: 5px"></div>
  <div style="flex: 1;">
    <img src="docs/ムツミ_Final.svg" alt="Mu2Mi Japanese logo" title="Mu2Mi Japanese logo">
  </div>
</div>

# Mu2Mi: MIDI Multitrack Generation from Audio

Mu2Mi is a web application that generates isolated stem tracks of vocal, accompaniment, bass, and drum from any audio file (preferably songs c:).

It utilizes [Spleeter](https://github.com/deezer/spleeter) to perform source separation and [Basic Pitch](https://github.com/spotify/basic-pitch) to generate MIDI files from the separated audio. The application is built using [Django](https://www.djangoproject.com/) and [Next.js](https://nextjs.org/) and packaged using [Docker](https://www.docker.com/).


## Installation

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

4. Go back to the root directory:

   ```shell
   cd ../
   ```

5. Start the application using Docker Compose:

   ```shell
   docker-compose up
   ```

6. Access Mu2Mi in your web browser at [http://localhost:8000/](http://localhost:8000/).

7. Upload an audio file and wait for approximately 1-2 minutes.

8. Retrieve the generated ZIP file containing the MIDI multitrack output.

> **Note**: If you encounter a 504 Gateway Timeout error, please try uploading the file again. This error occurs when the server is downloading model weights, which should happen only once.

## Usage

You can either run Mu2Mi locally or use its web version (to be deployed).