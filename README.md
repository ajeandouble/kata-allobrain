# Allo Brain Kata

## Install and run locally

### Run backend

```sh
$ pip3 install pipenv
$ pipenv shell
$ pipenv install
$ export ENVIRONMENT=development; pipenv run uvicorn app.main:app --reload
```

Backend is running on port **8000**.

#### Test Backend

Set up `.env.dev` in projet root following `.env.example` format.

```sh
$ pipenv shell
$ pipenv run pytest`
```

### Run frontend

Set up `.env.development` in projet root following `.env.example` format.

```sh
$ npm i -g pnpm
$ pnpm install
$ pnpm run dev
```

Frontend is running on port **3000**.

## Run in Docker

```sh
$ docker-compose up --build
```

Backend is running on port **8000**. Frontend is running on port **3000**.

## Resources

- [https://blog.jcoglan.com/2017/04/25/myers-diff-in-linear-space-implementation/](Myers Diff in Linear Space Implementation)
- [https://leetcode.com/problems/delete-operation-for-two-strings/](leetcode - 583. Delete Operation for Two Strings)
