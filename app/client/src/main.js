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