# Allo Brain Kata

## TODO xstate

- [ ] Title upload and go on with state changes
  - [ ] Verify if there are not better patterns
- [ ] Content upload
- [ ] Note creation
- [ ] Note comparison
- [ ] Rollback mechanisms and opportunistic requests
- [ ] Improve ui and add save button

Technical test for Allo Brain

## Install and run locally

### Backend

```sh
$ pip3 install pipenv
$ pipenv shell
$ pipenv install
```

#### Test Backend

Set up `.env.dev` in projet root following `.env.example` format.

```sh
$ pipenv shell
$ pipenv run pytest`
$ ENVIRONMENT=development; pipenv run uvicorn app.main:app --reload
```

### Frontend

Set up `.env.development` in projet root following `.env.example` format.

```sh
$ npm i -g pnpm
$ pnpm install
$ pnpm run dev
```

## TODO

- [ ] Dockerize
  - [ ] Docker files
  - [ ] Docker composes

## References

- [https://blog.jcoglan.com/2017/04/25/myers-diff-in-linear-space-implementation/](Myers Diff in Linear Space Implementation)
