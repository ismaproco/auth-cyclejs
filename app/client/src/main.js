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
  console.log('----| user state',userState)
  let events$ = userState.actions$;
  
  console.log('----| single out')
  return events$
    .map(( ev ) => { 
      let data = ev.data;
      console.log( ev.text, 'state',data );
      
      return {
        text: data.quote ,
        screen: data.screen || 'welcome', 
        loggedIn: data.loggedIn,
        username: data.username,
        error: data.error
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


  const actions$ = mergedResponses$.map(ev => {
    if(ev.request) {
      if( ev.request.category === 'create-user' || ev.request.category === 'login') {
        const obj = JSON.parse( ev.text );
        data.username = ev.request.send.username;
        data.screen = 'logged-in';
        data.loggedIn = true;
        data.error = '';
        data.token = obj.id_token;
        // API.requestRandomProtected.headers["Authorization"] = 'Bearer ' + obj.id_token;
      } else if ( ev.request.category === 'random-quote' 
                  || ev.request.category === 'random-quote-protected' ) {
        data.quote = ev.text;
        data.error = '';
      }
    } else if( ev.screen){
      data.screen = ev.screen;

      if(data.screen === 'welcome') {
        data.token = '';
        data.error = '';
        data.loggedIn = false;
        // API.requestRandomProtected.headers["Authorization"] = '';
      }
    } else if (ev.name === 'Error') {
      data.error = ev.response ? ev.response.text : 'Error';
    }

    sources.Auth.setData( data );

    return { data };
  });

  return {
    data, 
    request$: actionsRequest$,
    actions$: actions$
  };

}

/* end model */

function main(sources) {
  const quotes = Quotes();
  const login = Login();

  /* ACTIONS definitions */
  const quoteActions = quotes.intent( sources );
  const loginActions = login.intent( sources );

  /* STATE definition */
  const userState = model( sources, loginActions, quoteActions );

  /* VDOM creation */

  // create the vdom
  const vdom$ = view( userState , quotes, login );

  return {
    DOM: vdom$,
    HTTP: userState.request$,
    Auth: userState.actions$
  }
}

Cycle.run(main, {
  DOM: makeDOMDriver('#main-container'),
  HTTP: makeHTTPDriver(),
  Auth: LoginDriver()
}); 