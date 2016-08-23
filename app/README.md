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

![basic example screen]
(https://github.com/ismaproco/auth-cyclejs/raw/master/assets/basic-screen.png)

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
   |--- styles/
   |-----|--- styles.css
   |--- .babel.rc
   |--- index.html
   |--- package.json
```

Similar to out basic application the only difference is that we added the components files to the sources folder, and the stylesheet to give a better presentation to the app.

## The MVI architecture (Model-View-Intent)

There is not a strict guide line of how to implement CycleJS applications or components but there is a recommended
architecture to follow that is call MVI for the Model-View-Intent and it's the interpretation of the MVC architecture
adapted to the reactive and functional way. 

If you want to know more please look at great explanation in the CycleJS documentation 
http://cycle.js.org/model-view-intent.html

For the application we will have the definition of the intents and renders inside of each one of the components, and the model
defined in the main.js will merge the reponse of each one of the intents, and create the actions to be rendered by the view.

![Application diagram]
(https://github.com/ismaproco/auth-cyclejs/raw/master/assets/application-diagram.png)

### src/Quotes.js - Quotes component

The quotes will appear at the top of the page, and as soon as the application is fully loaded it will get a random quote that don't require the authorization token. It will also have a button that will allow the user to request for a different quote.

Once the user is logged in, the button will change to allow to get a protected quote using the authorization token.


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

The quotes module consist of two methods, the render that will return the virtual dom two draw on the screen, and the intent which will return the observables require for the application of the HTTP effects which are summarized in the request and response streams.

It is important to conside how the request observer that make the initial loas is just an stream with the sources respective request.

```javascript
const autoQuote$ = xs.of( sources.Auth.API.requestRandom );
```

and how the request and response are the merged streams of each one of the individual actions.

### src/Login.js - Login Component

The login have a similar structure as the Quotes, it also have the render method, that encapsulates the other render functions, and an intent method to return the merged responses and requests streams.


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

    // get the values from the input fields and set the object to return
    function getLoginInputValues(){
      return {         
        username: document.querySelector('.user-input').value,
        password: document.querySelector('.user-password').value
      }
    }

    // login click
    const loginClick$ = sources.DOM
      .select('.btn-log-in').events('click')
      .map( ev => ( getLoginInputValues() ) )
      .filter(data => data.username && data.password)
      .map(data => {
        const request = sources.Auth.API.requestLogin;
        request.send = data;
        return request;
      });

    //signup click event
    const signUpClick$ = sources.DOM
      .select('.btn-signup').events('click')
      .map( ev => ( getLoginInputValues() ) )
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

The biggest difference with the Quotes component is how the values of the inputs are mapped and filtered inside the login and signup request.

```javascript
function getLoginInputValues(){
      return {         
        username: document.querySelector('.user-input').value,
        password: document.querySelector('.user-password').value
      }
    }
```

Its also important to notice how the request change in the final mapping of each one of the streams depending of the requests.

### src/LoginDriver.js Login Driver

The javscript driver is the component that will handle the change of the state of the user data, and also expose the api for the requests. 

The idea is to separate the impure functions from the operations that happen in the main function, allowing to extend the functionality of the driver without affecting the execution of the application.

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

Look as the LoginDriver is just a closure for the AuthDriver, being the latter the one that expose the requests API and additional methods.


### src/main.js - Main File

This is the core section of the application, and consiste of the importing of the application libraries, the importing of the components and driver.

But contains three important methods:

* view: build the domain three using the UserState build by the model method.

* model: build the application state based in the responses of the quotes and login actions.

* main: initialize the components and get the components' actions from their intents, then send the actions as parameters for the model, which will build the virtual dom.

Finally every thing will be executed by the runner of the CycleJS component.


```javascript
import Cycle from '@cycle/xstream-run';
import xs from 'xstream';
import debounce from 'xstream/extra/debounce';
import {div, label, input, button, h1, h2, span,
        hr, ul, li, a, form, fieldset, legend, 
        makeDOMDriver } from '@cycle/dom';
import {makeHTTPDriver} from '@cycle/http';

// Local libraries
import LoginDriver from './LoginDriver';
import Quotes from './Quotes';
import Login from './Login';

/* Views definition */

function view( userState, quotes, login ) {

  let events$ = userState.actions$;

  return events$
    .map(( ev ) => { 
      let data = ev.data;
      // build the object to be handled by the view
      return {
        text: data.quote ,
        screen: data.screen || 'welcome', 
        loggedIn: data.loggedIn,
        username: data.username,
        error: data.error
      }; 
    } ) 
    .startWith({text:'Loading...', screen: 'welcome'})
    .map( ( { text, screen, loggedIn, username, error } ) => {
      // execute the rendering methods for the components and return
      // the stream for the view
        return div('.page',[

            quotes.render(text, loggedIn),
            div('.login-container',[
                login.render( screen, username),
                span('.error', error ? 'Error: '+ error : '')
              ]),
          ]);
      }
    );
}
/* End View */

/* Model Definition */

function model( sources, loginActions, quoteActions ) {
  
  // initial state
  let data = sources.Auth.getData();

  // merge reponses and screen actions
  const mergedResponses$ = xs.merge(
    loginActions.response$, 
    quoteActions.response$,
    loginActions.screenActions$ );

  // merge requests
  const actionsRequest$ = xs.merge(
    loginActions.request$,
    quoteActions.request$
  );

  // build the data object to be send to the views
  const actions$ = mergedResponses$.map(ev => {
    if(ev.request) {
      if( ev.request.category === 'create-user' 
            || ev.request.category === 'login') {
        // parse the text response into a json object
        const obj = JSON.parse( ev.text );

        //fill the data objec with the response
        data.username = ev.request.send.username;
        data.screen = 'logged-in';
        data.loggedIn = true;
        data.error = '';
        data.token = obj.id_token;
      } else if ( ev.request.category === 'random-quote' 
                  || ev.request.category === 'random-quote-protected' ) {
        // get the quote from the quote enpoints
        data.quote = ev.text;
        data.error = '';
      }
    } else if( ev.screen){
      data.screen = ev.screen;

      // each time the initial screen is shown the data object is cleared
      if(data.screen === 'welcome') {
        data.token = '';
        data.error = '';
        data.loggedIn = false;
      }
    } else if (ev.name === 'Error') {
      // set the error text in case of an error mesagge (handled by the HTTP request)
      data.error = ev.response ? ev.response.text : 'Error';
    }

    // all the data changes are updated in to the Auth driver
    sources.Auth.setData( data );

    return { data };
  });

  return {
    data, 
    request$: actionsRequest$,
    actions$: actions$
  };

}

/* End Model  */

function main(sources) {
  // init components
  const quotes = Quotes();
  const login = Login();

  /* ACTIONS definitions */
  const quoteActions = quotes.intent( sources );
  const loginActions = login.intent( sources );

  /* STATE definition */
  const userState = model( sources, loginActions, quoteActions );

  /* VDOM creation */
  const vdom$ = view( userState , quotes, login );

  return {
    DOM: vdom$,
    HTTP: userState.request$,
    Auth: userState.actions$
  }
}

// main application cycle
Cycle.run(main, {
  DOM: makeDOMDriver('#main-container'),
  HTTP: makeHTTPDriver(),
  Auth: LoginDriver()
}); 
```

Put attention how the model is actually capturing all the responses of the merged responses and building the data object from it, and this object is just an object that the view will evaluate to build the model.


## Putting all together index.html and main.js 

Finally the html layout with the container to hold the application and the styling sheet for the application.

### index.html

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="Cycle.js -JWT - Random Quote"/>
  <title>Cycle.js - JWT - Random Quote</title>
  <link rel="stylesheet" href="http://yui.yahooapis.com/pure/0.6.0/pure-min.css">
  <link rel="stylesheet" href="styles/main.css">
</head>
<body>
    <div class="home-menu pure-menu pure-menu-horizontal pure-menu-fixed">
        <span class="pure-menu-heading">Chuck Norris Quotes</span>
    </div>
    <div id="main-container"></div>
    <script src="./dist/main.js"></script>
</body>
</html>
```

### styles/main.css

```css
/* imports */

@import 'https://fonts.googleapis.com/css?family=Lemonada|Roboto|Tillana';

/* global styles*/
body {
    font-family: 'Roboto', sans-serif;
}

/* menu style*/

.home-menu {
    background: #009688;
    color: white;
    text-align: center;
    font-family: 'Lemonada', cursive;
    font-size: 1.2em;
    height: 60px;
}

.home-menu .pure-menu-heading {
    color: white;
}

/* main-container styles */

#main-container {
    padding-top: 65px;
}

/* quote container styles */
.quote-container {
    font-family: 'Tillana', cursive;
    font-size: 0.9em;
    padding: 25px;
    max-width: 600px;
    margin: auto;
}

.quote-container .btn-get-quote,
.quote-container .btn-get-quote-protected  {
    margin: auto;
    display: block;
    text-transform: capitalize;
    font-family: 'Roboto', sans-serif;
}

/* form container styles */

.login-container {
    font-size: 0.9em;
    padding: 25px;
    max-width: 600px;
    margin: auto;
}

.login-container input,
.login-container button {
    margin-right: 10px;
} 

.login-container button {
  text-transform: capitalize;
}

span.user-name {
    text-decoration: underline;
    color: darkblue;
}

.btn-log-out {
    margin: 10px 0 0 50px;
}

span.error {
    display: block;
    padding: 20px;
    text-align: center;
    color: #a00;
}
```


It is similar to the one of the basic example, the biggest difference are the importing of the css framework:

```html
  <link rel="stylesheet" href="http://yui.yahooapis.com/pure/0.6.0/pure-min.css">
```

Loading the application styles
```html
  <link rel="stylesheet" href="styles/main.css">
```

Loading of additional fonts from google:
```css
  @import 'https://fonts.googleapis.com/css?family=Lemonada|Roboto|Tillana';

```

The application should look as follows:

![Application end result]
(https://github.com/ismaproco/auth-cyclejs/raw/master/assets/complete-screen.png)

## Conclusion and final thoughts

CycleJS application relay in many concepts that even if they take some time to learn bring a different approach to tackle the web development in our days. So i would really recommend to try different approaches when you get to develop applications using the reactive way, and of course look at the official documentation at: http://cycle.js.org/getting-started.html to get more insight in this platform.


