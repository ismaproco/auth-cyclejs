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

It will start by default in the localhost with port 3001 `http://localhost:3001` we will point to this url in the applications to communicate with the rest-endpoints.


## Basic HTTP Request CycleJS application

We are going to develop a simple application that consumes the random-quote endpoint provided by the JWT sample. (if you want to get the full code check this repo: <link for the basic application repository folder> )

The folder structure will be as follows

```
/basic-example
   |--- src/
   |-----|--- main.js
   |--- .babel.rc
   |--- index.html
   |--- package.json
```


The package.json file contains the basic dependencies and scripts to run the application.

### package.json

```json
{
  "name": "pre-example",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "author": "Ismael Jimenez",
  "license": "ISC",
  "dependencies": {
    "@cycle/dom": "^12.1.0",
    "@cycle/http": "^10.1.0",
    "@cycle/xstream-run": "^3.0.4",
    "xstream": "^5.3.6"
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

### .babelrc

```json
{
  "presets": ["es2015"]
}
```
 The .babelrc file specifies the configuration to use for the ES6 files processing, ( don't forget the "." at the beginning of the file)

### index.html

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
  <meta name="description" content="Cycle.js - HTTP Random quote"/>
  <title>Cycle.js - HTTP Random quote - basic</title>
</head>
<body>
    <div id="main-container"></div>
    <script src="./dist/main.js"></script>
</body>
</html>
```

This HTML file will hold the virtual-dom of the application in the div with id "main-container". Also look how the script is referencing the dist/ folder to search for the output of the browserify process.

### src/main.js

```javascript
/* required modules */

import Cycle from '@cycle/xstream-run';
import xs from 'xstream';
import debounce from 'xstream/extra/debounce';
import {div, label, input, h1, hr, ul, li, a, makeDOMDriver} from '@cycle/dom';
import {makeHTTPDriver} from '@cycle/http';


function main(sources) {
  // defining the url observer
  // cycle-dom uses the GET method by default
  const _url = 'http://localhost:3001/api/random-quote'

  //create observable for the request using the static url
  const request$ = xs.of({
    url: _url,
    category: 'random-quote'
  });

  // response event which filter by the category defined in the request
  const response$ = sources.HTTP
    .select('random-quote')
    .flatten();

  // updates the virtual dom when the response listener is executed
  const vdom$ = response$
    .map(res => res.text) // this is the response text body
    .startWith('Loading...') // default value
    .map(text =>
      div('.container', [
        h1(text)
      ]) // return the virtual dom
    );

  // return the virtual dom and the request to be processed by the Cycle.run
  return {
    DOM: vdom$,
    HTTP: request$
  };
}

// application runner
Cycle.run(main, {
  DOM: makeDOMDriver('#main-container'),
  HTTP: makeHTTPDriver()
});
```

The main.js file first imports the required modules used in the application.

Then the main function is defined, this function will hold all the operations performed 
by the CycleJS loop.

Finally, the Cycle.run will use the main method, and it will process the DOM and HTTP drivers 
and send the sources and capture the outputs.

### Starting the basic application

Now that you have all the necessary files, is just matter of execute `npm start` 
and a basic web server will start on port 8080 (if there is already an application running for 
this port the server will start in the 8081 and so on )

Open the browser and navigate to the url, and you will see the quote on the screen.

(example image of the browser here)

## Let's define the application flow and architecture

Great now that you now the normal flow of a CycleJS application is not always the best idea to have
all the logic and effects in the main, so there are different kind of approaches to improve the 
estructure of the application.

For this we need to define first what is the normal flow of the application, in our case we will 
have two main components: one for the *Quotes*, and another for the *Login*, also we will need to handle
the login in a simple driver so we can keep the state of the Login, and finally we will have the 
*Main* file were all of the compnents will be bound together.

The application file structure will look like this:

```
/basic-example
   |--- src/
   |-----|--- Login.js
   |-----|--- LoginDriver.js
   |-----|--- Quotes.js
   |-----|--- main.js
   |--- .babel.rc
   |--- index.html
   |--- package.json
```

Similar to out basic application the only difference is that we added the components files to the sources folder.

## The MVI architecture (Model-View-Intent)

There is not a strict guide line of how to implement CycleJS applications or components but there is a recommended
architecture to follow that is call MVI for the Model-View-Intent and it's the interpretation of the MVC architecture
adapted to the reactive and functional way. 

If you want to know more please look at great explanation in the CycleJS documentation 
http://cycle.js.org/model-view-intent.html

For the application we will have the definition of the intents and renders inside of each one of the components, and the model
defined in the main.js will merge the reponse of each one of the intents, and create the actions to be rendered by the view.

(graph explaining the application architecture)

### Quotes component

```javascript
import xs from 'xstream';
import { div, button, h1 } from '@cycle/dom';

function Quotes( ) {
  // rendering methods
  function render(text, loggedIn) {
    let quoteButton;
    if(loggedIn){
      quoteButton = button('.btn-get-quote-protected .pure-button','get a protected quote')
    } else {
      quoteButton = button('.btn-get-quote .pure-button','get a quote')
    }

    return div('.quote-container', [
            h1(text),
            quoteButton
          ]);
  }
  

  // build the request and response actions based on the sources
  function intent( sources ) {
    // construct the event for the click 
    const click$ = sources.DOM
      .select('.btn-get-quote').events('click')
      .map(ev => ( sources.Auth.API.requestRandom ) );

    const clickProtected$ = sources.DOM
      .select('.btn-get-quote-protected').events('click')
      .map(ev => ( sources.Auth.API.requestRandomProtected ) );

    // stream to self execute the random request when the page load
    const autoQuote$ = xs.of( sources.Auth.API.requestRandom );

    // merge the request streams
    const request$ = xs.merge(click$, clickProtected$, autoQuote$);

    // response event which filter by the category
    const responseRandom$ = sources.HTTP
      .select('random-quote').flatten();

    // response event which filter by the category
    const responseRandomProtected$ = sources.HTTP
      .select('random-quote-protected').flatten();

    const response$ = xs.merge(responseRandom$, responseRandomProtected$);

    return { request$ , response$ };
  }
  
  
  return {
    render,
    intent
  };
}

export default Quotes;
```

### Login Component

```javascript
import xs from 'xstream';
import {div, label, input, button, h1, h2, span,
        hr, ul, li, a, form, fieldset, legend, 
        makeDOMDriver } from '@cycle/dom';

function Login(  ) {
  
  // Rendering methods
  function renderForm(  ) {
    return div('.login-form',[
      div('.pure-form',[
        fieldset([
          legend('Please log in to use the protected api.'),
          input('.user-input', 
            { attrs: { 
                type:'text', placeholder: 'User', required:'true'
              } 
            }),
          input('.user-password', 
            { attrs: { 
                type:'text', placeholder: 'Password', required:'true'
              } 
            })
        ])
      ])
    ])
  }

  function renderWelcome(  ) {
    return div('.welcome', [
      renderForm(),
      button('.btn-signup .pure-button','sign up'),
      button('.btn-log-in .pure-button', 'log in')
    ]);
  }
  
  function renderLoggedIn( username ) {
    return div('.logged-in-form',[
      div('.welcome-user-name', [ 
        span('.welcome', 'Welcome: '), 
        span('.user-name',username) 
        ]),
      button('.btn-log-out .pure-button', 'log out' )
    ])
  }

  function render( screen, username ) {
    if(screen === 'welcome') {
      return renderWelcome(  );
    } else if( screen === 'logged-in' ) {
      return renderLoggedIn( username );
    }
  }

  // build the request and response actions based on the sources
  function intent( sources ){
    // login click
    const loginClick$ = sources.DOM
      .select('.btn-log-in').events('click')
      .map( ev => ({ 
        username: document.querySelector('.user-input').value,
        password: document.querySelector('.user-password').value
      }))
      .filter(data => data.username && data.password)
      .map(data => {
        const request = sources.Auth.API.requestLogin;
        request.send = data;
        return request;
      });

    //signup click event
    const signUpClick$ = sources.DOM
      .select('.btn-signup').events('click')
      .map( ev => ({ 
        // get the values from the input fields and set the object to return
        username: document.querySelector('.user-input').value,
        password: document.querySelector('.user-password').value
      }))
      .filter(data => data.username && data.password)
      .map(data => {
        const request = sources.Auth.API.requestCreate;
        // set the data to be send trough the request
        request.send = data;
        return request;
      });


    // login click
    const logoutClick$ = sources.DOM
      .select('.btn-log-out').events('click')
      .map( ev => ({ screen:'welcome'}) );


    //  create the reponses and intercepting errors
    const createResponse$ = sources.HTTP
      .select('create-user').map( (response$) =>
        response$.replaceError( (errorObject) => 
                              xs.of( errorObject ) ) ).flatten();

    const loginResponse$ = sources.HTTP
      .select('login').map( (response$) =>
        response$.replaceError( (errorObject) => 
                              xs.of( errorObject ) ) ).flatten();

    // merge the request and responses
    const mergeRequest$ = xs.merge( loginClick$ , signUpClick$ );
    const mergeResponse$ = xs.merge( createResponse$, loginResponse$ );

    return {  screenActions$: logoutClick$,
              request$: mergeRequest$, 
              response$: mergeResponse$ }
  }
  
  
  return {
    render,
    intent
  }
}

export default Login;

```

### LoginDriver

```javascript

// Method that composites the Auth login operations
function LoginDriver( ) {
  // object to hold the request properties
  let API = {
    requestLogin: {
      url: 'http://localhost:3001/sessions/create/',
      method: 'POST',
      category: 'login',
      eager: true
    },
    requestCreate: {
      url: 'http://localhost:3001/users/',
      method: 'POST',
      category: 'create-user',
      eager: true
    },
    requestRandom: {
      url: 'http://localhost:3001/api/random-quote',
      category: 'random-quote',
      eager: true
    },
    requestRandomProtected: {
      url: 'http://localhost:3001/api/protected/random-quote',
      headers: {"Authorization": ""},
      category: 'random-quote-protected',
      eager: true
    }
  };  
  
  // auth to handle request properties
  function AuthDriver(  ){
    let data = {};

    function setData( _data ) {
      data = _data;
      // set the auth token to the protected request
      API.requestRandomProtected.headers.Authorization = "Bearer " + data.token;
    }

    function getData() {
      return data;
    }
    
    return {
      API,
      setData,
      getData
    }
  }

  return AuthDriver;
}

export default LoginDriver;

```

### Main


## Putting all together

## Conclusion and final thoughts

