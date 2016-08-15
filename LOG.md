# Creation of the pre-example app

First I created an application with the basic elements of CycleJS, after watching the tutorial
I look for the repositories of the author and found this repo where to get some examples to 
start.

https://github.com/cyclejs/cyclejs/tree/master/examples

I used the counter example to get around the idea of the basic dependencies and project structure.
then I start updating the initialization scripts so it will start a basic http-browser to run the project.

I started with the creation of a simple project that load the random using a simple http request.

With this I was able to create a very basic package.json with the minimal dependencies to work with cyclejs.

- look at the pre-example folder to check the basic project.

# Working on the final project

- For the initial configuration is necesary to have the .babelrc file with the es2005 property.
- Is also important to make sure the prebrowserify is executed when the watchify is running.

- The first part is to add some easy design elements, I will use foundation as starting point.

- After adding the styles I started working in the basic layout of the application where I added a header and a main-container to hold the virtual dom of the application, also I added some basic colors and padding in the main.css file.

- then I started to explore different architectures for the application, I decided to handle the login on the same page as the quote, the only difference is the way the form is shown to the user, initially it will allow to create a new user or to login, once a user is created or logged in, the login component will show a logout option and the current logged user.

- Now I started working in the application using the MVI pattern that is recommended in the documentation, but it has been quite complicated to move around the hole reactive idea, particularlly in the idea that everything in the application is a dataflow or stream, so it is quite complex to start thinking in this way.

- Well finally after several hours I was able to finish the login component, with two caveats, first I'm using a global state object to keep track of the general information inside of the application, I don't feel comfortable with it, but it's the only way I found to keep the persistence of certain elements, probably I'm missing something, and second I'm using classic document.querySelector to get the static information from the input files of the login form, because I need the values only when the http request is going to be performed, and with an stream there all always updated.

- The only thing remaining from the application is to handle the login (create session), the create user and protected quotes are already working.




