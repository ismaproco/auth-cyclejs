import Cycle from '@cycle/xstream-run';
import xs from 'xstream';
import debounce from 'xstream/extra/debounce';
import {div, label, input, button, h1, h2, span,
        hr, ul, li, a, form, fieldset, legend, 
        makeDOMDriver } from '@cycle/dom';
import {makeHTTPDriver} from '@cycle/http';


// URL and endpoint constants
const API = {
  url: 'http://localhost:3001/',
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

let $state = { 
    userRequest: API.requestRandom, 
};

/* Views definition */

function renderForm( state ) {
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

function renderLoggedIn( username ) {
  return div('.logged-in-form',[
    div('.welcome-user-name', [ 
      span('.welcome', 'Welcome: '), 
      span('.user-name',username) 
      ]),
    button('.btn-log-out .pure-button', 'log out' )
  ])
}

function renderWelcome(  ) {
  return div('.welcome', [
    renderForm(),
    button('.btn-signup .pure-button','sign up'),
    button('.btn-log-in .pure-button', 'log in')
  ]);
}


function renderQuote(text, logged) {

  let quoteButton;

  if(logged){
    quoteButton = button('.btn-get-quote-protected .pure-button','get a protected quote')
  } else {
    quoteButton = button('.btn-get-quote .pure-button','get a quote')
  }

  return div('.quote-container', [
          h1(text),
          quoteButton
        ]);
}


function view( userState ) {
  console.log(userState)
  let events$ = xs.merge(
    userState.quoteActions.response$, 
    userState.loginActions.response$,
    userState.loginActions.screenActions$);

  return events$
    .map(( ev ) => { 

      console.log( ev.text, 'state',userState );
      
      
      if(ev.request) {
        if( ev.request.category === 'create-user' || ev.request.category === 'login') {
          const obj = JSON.parse( ev.text );
          userState.id_token = obj.id_token;
          userState.username = ev.request.send.username;
          userState.screen = 'logged-in';
          userState.error = '';

          $state.screen = 'logged-in';
          $state.userRequest = API.requestRandomProtected;
          $state.userRequest.headers["Authorization"] = 'Bearer ' + userState.id_token;

        } else if ( ev.request.category === 'random-quote' 
                    || ev.request.category === 'random-quote-protected' ) {
          userState.quote = ev.text;
          userState.error = '';
        }
      } else if( ev.screen){
        userState.screen = ev.screen;

        if(userState.screen === 'welcome') {
          userState.id_token = '';
          userState.error = '';
          $state.userRequest = API.requestRandom;
        }
      } else if (ev.name === 'Error') {
        userState.error = ev.response ? ev.response.text : 'Error';
      }

      return {
        text:userState.quote ,
        screen: userState.screen || 'welcome', 
        logged: !!userState.id_token,
        username: userState.username,
        error: userState.error
      }; 

    } ) // this is the response text body
    .startWith({text:'Loading...', screen: 'welcome'})
    .map( ({ text, screen, logged, username, error }) => {
        return div('.page',[
            renderQuote(text, logged),
            div('.login-container',[
                renderLoginSection( screen, username),
                span('.error', error ? 'Error: '+ error : '')
              ]),
            
          ]);
      }
    );
}


function renderLoginSection( screen, username ) {
  if(screen === 'welcome') {
    return renderWelcome(  );
  } else if( screen === 'logged-in' ) {
    return renderLoggedIn( username );
  }
}

/* begin intents */

function quoteIntent( sources ) {
  // construct the event for the click 
  const click$ = sources.DOM
    .select('.btn-get-quote').events('click')
    .map(ev => ( API.requestRandom ) );

  const clickProtected$ = sources.DOM
    .select('.btn-get-quote-protected').events('click')
    .map(ev => ( API.requestRandomProtected ) );

  const autoQuote$ = xs.of( API.requestRandom );

  // defining the url observer
  // const request$ = xs.of( $state.userRequest );
  const request$ = xs.merge(click$, clickProtected$, autoQuote$);

  // response event which filter by the category
  const responseRandom$ = sources.HTTP
    .select('random-quote').flatten();

  // response event which filter by the category
  const responseRandomProtected$ = sources.HTTP
    .select('random-quote-protected').flatten();

  const response$ = xs.merge(responseRandom$, responseRandomProtected$);


  return { request$: request$ , response$: response$ };
}


function loginIntent(sources){
  
  // login click
  const loginClick$ = sources.DOM
    .select('.btn-log-in').events('click')
    .map( ev => ({ 
      username: document.querySelector('.user-input').value,
      password: document.querySelector('.user-password').value
    }))
    .filter(data => data.username && data.password)
    .map(data => {
      const request = API.requestLogin;
      request.send = data;
      return request;
    });

  const signUpClick$ = sources.DOM
    .select('.btn-signup').events('click')
    .map( ev => ({ 
      username: document.querySelector('.user-input').value,
      password: document.querySelector('.user-password').value
    }))
    .filter(data => data.username && data.password)
    .map(data => {
      const request = API.requestCreate;

      request.send = data;

      return request;
    });


  // login click
  const logoutClick$ = sources.DOM
    .select('.btn-log-out').events('click')
    .map( ev => ({ screen:'welcome'}) );


  // response event which filter by the category
  const createResponse$ = sources.HTTP
    .select('create-user').map( (response$) =>
      response$.replaceError( (errorObject) => xs.of( errorObject ) ) ).flatten();

  const loginResponse$ = sources.HTTP
    .select('login').map( (response$) =>
      response$.replaceError( (errorObject) => xs.of( errorObject ) ) ).flatten();

  const mergeRequest$ = xs.merge( loginClick$ , signUpClick$ );
  const mergeResponse$ = xs.merge( createResponse$, loginResponse$ );

  let screenActions$ = xs.merge(logoutClick$);

  return {  screenActions$,
            request$: mergeRequest$, 
            response$: mergeResponse$ }
}

/* begin model */

function model( loginActions, quoteActions ) {
  
  // initial state
  let screen = 'welcome';
  let quote = 'loading';

  return {screen, quote, loginActions, quoteActions};
}

/* end model */

function main(sources) {
  /* ACTIONS definitions */

  const quoteActions = quoteIntent( sources );

  const loginActions = loginIntent( sources );

  /* STATE definition */
  const userState = model(loginActions, quoteActions );

  /* VDOM creation */

  // create the vdom
  const vdom$ = view( userState );

  /* merge request streams */
  const mergeRequest$ = xs.merge(loginActions.request$, quoteActions.request$);

  return {
    DOM: vdom$,
    HTTP: mergeRequest$
  };
}

Cycle.run(main, {
  DOM: makeDOMDriver('#main-container'),
  HTTP: makeHTTPDriver()
}); 