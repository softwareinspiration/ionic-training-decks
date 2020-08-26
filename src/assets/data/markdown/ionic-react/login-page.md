# Lab: Add a Login Page

In this lab, you will learn how to:

- Create new pages
- Set up routing

## Overview

Most applications have more than one page. Our application will eventually have several; let's start by adding a login page.

## The Login Page

### Create Folder and Files

Add a new folder within `src` called `login`. Within that folder, let's create the component file, the test file, and CSS file for our login page:

- `Login.tsx`
- `Login.test.tsx`
- `Login.css`

Let's scaffold the page so that it has the same design as our teas page, but without the `IonGrid`:

**`src/login/Login.tsx`**

```TypeScript
import React from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/react';

const Login: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Login</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Login</IonTitle>
          </IonToolbar>
        </IonHeader>
      </IonContent>
    </IonPage>
  );
};

export default Login;
```

**Challenge:** Stand up `Login.test.tsx` with tests to verify:

1. `<Login />` displays a header with the text "Login"
2. `<Login />` renders consistently

### Add Routing

To wire up a path to our login page, we need to add an entry to our `IonReactRouter` residing in `App.tsx`:

```TypeScript
...
import Login from './login/Login';
...
const App: React.FC = () => {
  ...
  return (
    <IonApp>
      <IonReactRouter>
        <IonRouterOutlet>
          <Route path="/login" component={Login} exact={true} />
          <Route path="/tea" component={TeaList} exact={true} />
          <Route exact path="/" render={() => <Redirect to="/tea" />} />
        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;
```

Let's make sure this works by changing the route in our browser to http://localhost:8100/login if you are running the application using `ionic serve` or http://localhost:3000/login if you are running it using `ng start`. There's not much to see, but we can tell that the route is actually working.

### Mock the User Interface

Let's mock up what we would like the login page to look like. We know we are going to need a form in which to enter our e-mail and our password along with a button to press when the user is ready to log in, so let's start there:

```JSX
<IonPage>
  ...
  <IonContent>
    <IonHeader collapse="condense">
    ...
    </IonHeader>

    <form>
      <IonList>
        <IonItem>
          <IonLabel>E-Mail Address</IonLabel>
          <IonInput />
        </IonItem>
        <IonItem>
          <IonLabel>Password</IonLabel>
          <IonInput />
        </IonItem>
      </IonList>
    </form>
  </IonContent>

  <IonFooter>
    <IonToolbar>
      <IonButton>Login</IonButton>
    </IonToolbar>
  </IonFooter>

</IonPage>
```

Well, that's a start, but let's pretty it up a bit. First, ;et's use the "floating" style labels like this: `<IonLabel position="floating">Some Label</IonLabel>`. Nice!

We should also give the inputs an `id`, a `name`, and a `type`:

```JSX
<IonList>
  <IonItem>
    <IonLabel position="floating">E-Mail Address</IonLabel>
    <IonInput id="email-input" name="email" type="email" />
  </IonItem>
  <IonItem>
    <IonLabel position="floating">Password</IonLabel>
    <IonInput id="password-input" name="password" type="password" />
  </IonItem>
</IonList>
```

## Form Handling

### Test First

### Then Code

## Conclusion

We have learned how to mock up an interface and make our design responsive. Make sure you have a look at your app in both light and dark mode. Next we will add a login page to our application.
