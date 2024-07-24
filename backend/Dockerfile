FROM python:3.12-slim

ENV ENVIRONMENT production
WORKDIR /app

RUN pip3 install pipenv
COPY Pipfile Pipfile.lock .
RUN pipenv install --system --deploy --ignore-pipfile
RUN apt-get update && apt-get install -y libpq-dev gcc
RUN pipenv install  psycopg2

COPY . .

EXPOSE 8000

CMD ["pipenv", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]