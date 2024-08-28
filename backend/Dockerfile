FROM python:3.12-slim

ENV ENVIRONMENT production
WORKDIR /app

RUN pip3 install pipenv
COPY Pipfile Pipfile.lock .
RUN pipenv install --system --deploy --ignore-pipfile
RUN pipenv install  psycopg2-binary


COPY . .

EXPOSE 8000

CMD ["pipenv", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]