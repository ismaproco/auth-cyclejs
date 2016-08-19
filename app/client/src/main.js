import Cycle from '@cycle/xstream-run';
import xs from 'xstream';
import debounce from 'xstream/extra/debounce';
import {div, label, input, button, h1, h2, span,
        hr, ul, li, a, form, fieldset, legend, 
        makeDOMDriver } from '@cycle/dom';
import {makeHTTPDriver} from '@cycle/http';
import Quotes from './Quotes';
import Login from './Login';

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

const quotes = Quotes(API);
const login = Login(API);

/* Views definition */

function view( userState, quotes, login ) {
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
          userState.username = ev.request.send.username;
          userState.screen = 'logged-in';
          userState.loggedIn = true;
          userState.error = '';
          API.requestRandomProtected.headers["Authorization"] = 'Bearer ' + obj.id_token;
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
          userState.loggedIn = false;
          API.requestRandomProtected.headers["Authorization"] = '';
        }
      } else if (ev.name === 'Error') {
        userState.error = ev.response ? ev.response.text : 'Error';
      }
    
      return {
        text:userState.quote ,
        screen: userState.screen || 'welcome', 
        loggedIn: userState.loggedIn,
        username: userState.username,
        error: userState.error
      }; 

    } ) // this is the response text body
    .startWith({text:'Loading...', screen: 'welcome'})
    .map( ( { text, screen, loggedIn, username, error } ) => {
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
  const quoteActions = quotes.intent( sources );
  const loginActions = login.intent( sources );

  /* STATE definition */
  const userState = model( loginActions, quoteActions );

  /* VDOM creation */

  // create the vdom
  const vdom$ = view( userState , quotes, login );

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