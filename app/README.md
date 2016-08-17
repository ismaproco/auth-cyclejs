# Building an app using CycleJS with JWT Authentication

Learn how to implement an application with CycleJS that Authenticates using JWT

## Introduction

Reactive programming is one of the developments concepts that started in the graphics and video processing and now is coming to the Web UI, and it is doing so mainly by the ReactiveX which is a compendium of libraries that help with the usage of Observable collections,  and with them is possible to execute operations over the objects. But develop an application with it can be an intimidating task, particularly with such abstract concepts.

But Andre Saltz, one of the core contributor of the RxJS project, bring us the CycleJS, a framework to build Reactive applications that simplifies the process with a clever cyclic architecture composed on input and output of streams, the great thing about it is that you can plug the RxJS library or use a suited implementation for it called "xstream" that simplify the learning curve call "xstream" wich is a much simpler version of the RxJS library with exclusive support for hot streams.

All this new words and terms can be quite intimidating at first, but with some practice and patience, you will be able to understand them and applying in a way that suits your needs.

## Why use CycleJS with so many options out there?

CycleJS is not the silver bullet solution for the development of web applications, hardly any framework can claim to be the ultimate solution, but with CycleJS you will be constructing your application in a fully reactive and functional way, so all the operations are limited to the interactions between the streams, making unnecessary the usage of the "this" keyword.

Also facilitates the creation and management of complex dataflows, through few operations you can access and transform the data that is going to be transferred to the differents stages of the flow, all this make it easier to understand and order the code.

But these advantages are possible if the application is written with the reactive model in mind, and it can be really difficult to move from structural programming to a functional reactive approach. Additionally the framework still on an early stage so many components and integrations still under development.

For more information look at http://cycle.js.org

## The JWT Authentication sample app

The JWT sample application is a battle tested backend built in node.js which provides multiples end points to get used to the JWT authorization flow through allowing to create users, sessions and retrieving funny Chuck Norris quotes. 

Check https://github.com/auth0/nodejs-jwt-authentication-sample repository to get more details.

To begin just clone the repository wherever you want and execute `npm start` on the root folder.

## Basic HTTP Request CycleJS application

We are going to develop a simple application that consumes the random-quote endpoint provided by the JWT sample. (if you want to get the full code check this repo: <link for the basic application repository folder> )

First lets create a package.json file with the basic dependencies and scripts to run the application.

```
{
  "name": "simple-example",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "author": "Ismael Jimenez",
  "license": "ISC",
  "dependencies": {
    "@cycle/xstream-run": "1.0.1",
    "@cycle/dom": "10.0.0-rc11",
    "@cycle/http": "9.0.0-rc3",
    "xstream": "2.1.x"
  },
  "devDependencies": {
    "babel-preset-es2015": "^6.3.13",
    "babel-register": "^6.4.3",
    "babelify": "7.2.0",
    "browserify": "13.0.0",
    "http-server": "^0.9.0",
    "mkdirp": "0.5.x",
    "watchify": "^3.7.0"
  },
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "prebrowserify": "mkdirp dist",
    "browserify": "browserify src/main.js -t babelify --outfile dist/main.js",
    "watchify": "watchify src/main.js -t babelify --outfile dist/main.js -dv",
    "start": "npm install && npm run watchify & http-server"
  }
}
```

We will be using the most basic dependencies to develop applications for CycleJS. Also as dev-dependencies we will use babel and browserify for the preprocessing of the ES6 files, watchify for  the automatic building of js files, and finally the http-server to create a simple web server of static files.

The scripts sections specify the running scripts we will have in the application.

+ test: not implemented
+ prebrowserify: create the dist folder before executing the browserify command.
+ browserify: build the output js file ready for the browser with all the internal dependencies
+ watchify: execute the browserify command each time a js file changes.
+ start: the default starting scripts

Your development server will start on http://localhost:8080 you can check the console for more details.



## Let's define the application flow and architecture

## Setting up the intents

## Setting up the model

## Setting up the view 

## Putting all together

## Conclusion and final thoughts


