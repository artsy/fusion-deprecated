Fusion
===

[Fusion](https://github.com/artsy/fusion) is an orchestration layer for Artsy web clients.

Meta
---

* __State:__ production
* __Production:__ [https://fusion.artsy.net/](https://www.artsy.net/) | [Heroku](https://dashboard.heroku.com/apps/fusion-production/resources)
* __Staging:__ [https://fusion-staging.artsy.net/](https://staging.artsy.net/) | [Heroku](https://dashboard.heroku.com/apps/fusion-staging/resources)
* __Github:__ [https://github.com/artsy/fusion/](https://github.com/artsy/fusion/)
* __CI:__ [Semaphore](https://semaphoreapp.com/artsy/fusion/); merged PRs to artsy/fusion#master are automatically deployed to staging; production is manually deployed from semaphore
* __Point People:__ [@craigspaeth](https://github.com/craigspaeth)

[![Build Status](https://semaphoreapp.com/api/v1/projects/f6c57bfa-d60c-476d-b7cf-5f3954b69495/253300/badge.png)](https://semaphoreapp.com/artsy/fusion)

Set-Up
---

- Install [NVM](https://github.com/creationix/nvm)
- Install Node 0.12
```
nvm install 0.12
nvm alias default 0.12
```
- Fork Fusion to your Github account in the Github UI.
- Clone your repo locally (substitute your Github username).
```
git clone git@github.com:craigspaeth/fusion.git && cd fusion
```
- Install node modules
```
npm install
```
- Create a .env file in the root of the project and paste in sensitive configuration. You can copy the .env.example and fill in the sensitive config with the config vars from staging `heroku config --app=fusion-staging`.
  ( note: Leave non-sensitive configuration as it appears in the .env.example rather than copying over the config vars from `heroku config --app=fusion-staging`. )
- Fusion uses MongoDB as a database. To install MongoDB using homebrew do the following, if you would prefer to install manually check the documentation at [MongoDB](http://docs.mongodb.org/manual/tutorial/install-mongodb-on-os-x/)
```
brew install mongodb
```
- Start the MongoDB database
```
mongod
```
- Start the server
```
npm run s
```
- Fusion should now be running at [http://localhost:3005/](http://localhost:3005/)

Copy production data
---

- Set the COPY_MONGO_URL env variable to the MONGOHQ_URL config var from heroku
```
heroku config --app=fusion-production | grep MONGOHQ_URL
```
- Only use the replica set by removing the first hostname from the url, e.g. `...candidate.A.mongolayer.com,candidate.B.mongolayer.com...` should become `...candidate.B.mongolayer.com...`
- Run the copy task
```
npm run dbcopy
```
