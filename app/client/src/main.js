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
  random_quote: 'api/random-quote',
  random_quote_protected: 'api/protected/random-quote',
  requestLogin: {
    url: 'http://localhost:3001/sessions/create/',
    category: 'login'
  },
  requestCreate: {
    url: 'http://localhost:3001/users/',
    method: 'POST',
    category: 'create-user'
  }
};

const requestRandom = {
  url: API.url + API.random_quote,
  category: 'random-quote'
};

const requestRandomProtected = {
  url: API.url + API.random_quote_protected,
  headers: {"Authorization": "Bearer "},
  category: 'random-quote-protected'
};

let $state = { 
    authorized : false, 
    token: '', 
    userRequest: requestRandom, 
    screen: 'welcome' 
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

function renderLoggedIn( state ) {
  return div('.logged-in-form',[
    span('.user-name', 'Welcome ' + state.username ),
    button('.btn-log-out', 'log out' )
  ])
}

function renderWelcome( state ) {
  return div('.welcome', [
    renderForm(),
    button('.btn-signup .pure-button','sign up'),
    button('.btn-log-in .pure-button', 'log in')
  ]);
}


function renderQuote(text, logged) {
  return div('.quote-container', [
          h1(text),
          span('.protected',  ( logged ? 'protected quote' : '')  ),
          button('.btn-get-quote .pure-button','get a quote')
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
        if( ev.request.category === 'create-user' ) {
          const obj = JSON.parse( ev.text );
          userState.id_token = obj.id_token;
          userState.username = ev.request.send.username;
          userState.screen = 'logged-in';
          $state.screen = 'logged-in';
          $state.userRequest = requestRandomProtected;
          $state.userRequest.headers["Authorization"] += userState.id_token;

        } else if ( ev.request.category === 'random-quote' 
                    || ev.request.category === 'random-quote-protected' ) {
          userState.quote = ev.text;  
        }
      } else if( ev.screen){
        userState.screen = ev.screen;
      }

      return {
        text:userState.quote ,
        screen: userState.screen || 'welcome', 
        logged: !!userState.id_token 
      }; 

    } ) // this is the response text body
    .startWith({text:'Loading...', screen: 'welcome'})
    .map( ({text,screen, logged }) => {
        return div('.page',[
            renderQuote(text, logged),
            div('.login-container',[
                renderLoginSection(screen, userState)
              ])
          ]);
      }
    );
}


function renderLoginSection( screen, userState ) {
  if(screen === 'welcome') {
    return renderWelcome( userState );
  } else if( screen === 'logged-in' ) {
    return renderLoggedIn( userState );
  }
}

/* begin intents */

function quoteIntent( sources , $state ) {
  // construct the event for the click 
  const click$ = sources.DOM
    .select('.btn-get-quote').events('click')
    .map(ev => ( $state.userRequest ) );

  // defining the url observer
  // const request$ = xs.of( $state.userRequest );
  const request$ = click$;

  // response event which filter by the category
  const responseRandom$ = sources.HTTP
    .select('random-quote').flatten();

  // response event which filter by the category
  const responseRandomProtected$ = sources.HTTP
    .select('random-quote-protected').flatten();

  const response$ = xs.merge(responseRandom$, responseRandomProtected$);


  return { request$: request$ , response$: response$ };
}


function loginIntent(sources, $state ){
  let user,pass;

  const user$ = sources.DOM.select('.user-input')
     .events('input')
     .map(ev => ev.target.value);

   const password$ = sources.DOM.select('.user-password')
     .events('input')
     .map(ev => ev.target.value);


  // login click
  const loginClick$ = sources.DOM
    .select('.btn-log-in').events('click')
    .map( ev => ({ screen:'login'}) );

  var userPass$ = xs.combine(user, pass);


  const signUpClick$ = sources.DOM
    .select('.btn-signup').events('click')
    .map( ev => { 

      let request = API.requestCreate;
      
      // TODO - search for the best way to use the values.
      var user = document.querySelector('.user-input').value;
      var pass = document.querySelector('.user-password').value;
      
      if(user && pass ) {
        request.send = { username:user, password: pass };  
        return request;
      }
    });

  // response event which filter by the category
  const loginResponse$ = sources.HTTP
    .select('create-user').flatten();


  let screenActions$ = loginClick$;

  return {  screenActions$,
            request$:signUpClick$, 
            response$: loginResponse$ }
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

  const quoteActions = quoteIntent( sources , $state);

  const loginActions = loginIntent(sources , $state);

  /* STATE definition */
  const userState = model(loginActions, quoteActions );

  /* VDOM creation */

  // create the vdom
  const vdom$ = view( userState );

  /* merge request streams */
  const mergeRequest$ = quoteActions.request$
                          .merge(loginActions.request$);

  return {
    DOM: vdom$,
    HTTP: mergeRequest$
  };
}

Cycle.run(main, {
  DOM: makeDOMDriver('#main-container'),
  HTTP: makeHTTPDriver()
}); 