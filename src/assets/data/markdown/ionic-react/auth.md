# Lab: Handle Authentication

In this lab, you will learn how to:

- Use environment variables
- Interact with a data service
- Supply application-level state
- Control navigation based on state

## Overview

Our application has a login page but it doesn't do much; we don't have a way to authenticate users or a way to determine the authentication status of the current user. This functionality would be beneficial to show or hide specific portions of our application depending if the current user is logged in or not.

For the purpose of our application, "authentication" consists of two parts:

1. Managing the identity of the user currently interacting with the application
2. Communicating between the application and the authentication API

We're going to write separate implementations for each part, making it easier if we ever need to swap implementations. We also get brownie points by following the Single Responsibility Principle!

### Side Note: `new Class()` vs. Singletons

In most web or mobile applications, classes that provide data service functionality only need one single instance that should be shared across the implementation. This is the ideal scenario to apply the Singleton design pattern.

Some frameworks provide a mechanism to "automagically" create singletons out of data service classes. React is not one of those frameworks.

I commonly see React projects implement the Singleton pattern like this:

```TypeScript
class MyClass {}
export default new MyClass();
```

Which works, but isn't ideal:

- If `MyClass` isn't exported, it becomes very difficult to mock and test
- Suppose `MyClass` was exported, nothing tells the developers to use the default export instead of creating a new instance

We'll be implementing the Singleton Pattern the traditional way, shown in the following sections.

## Create the User Model

Let's begin by modeling the shape of what a user should look like in our application. Add a new file to `src/models` and name it `User.ts`. We'll export an interface with the following properties:

```TypeScript
export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}
```

**Challenge:** Add our `User` model to the models folder's barrel file.

## Set Up the Environment

Many applications have the need to keep dynamically-named values that affect the way the application behaves at runtime. These values are known as environment variables and are useful for storing API keys, supplying different values based on which environment context is running, enabling/disabling feature flags, etc. Our application will use environment variables to declare the URL to the data service it will use.

At the root of your application, create a new file called `.env` and populate it with a key-value pair called `REACT_APP_DATA_SERVICE`:

**`.env`**

```bash
REACT_APP_DATA_SERVICE=https://cs-demo-api.herokuapp.com
```

There are two things to note about using `.env` files within a React application:

- All key names **must** start with `REACT_APP`
- All values are strings and are **not** enclosed with any type of quotation characters

Our application will only have one environment context to run in but if we had dedicated development and production environments, we would add additional files `.env.production` and `.env.development` to the root of our application.

Handling multiple environment variable files is out-of-scope for this course, but you can find additional information on it in the <a href="https://create-react-app.dev/docs/adding-custom-environment-variables/" target="_blank">Adding Custom Environment Variables</a> portion of the Create React App documentation.

## Identity Singleton

Start by creating a new folder named `auth` within our `src` folder. We'll keep all authentication-based files here. Inside `src/auth`, create `Identity.ts` and `Identity.test.ts`.

Our identity data service will be responsible for the following functionality:

- Storing the current user's authorization token using <a href="https://capacitorjs.com/docs/apis/storage" target="_blank">Capacitor's Storage API</a>.
- Getting/setting the current user's authorization token and user object.
- Attempt to automatically log the user in using the stored authorization token.
- Clearing the current user's in-memory authorization token and user object, and removing the current user's stored authorization token.

Open `Identity.ts` so we can scaffold the identity class and complete the singleton implementation:

```TypeScript
import { Plugins } from '@capacitor/core';
import { User } from '../models';

export class Identity {
  private _key = 'auth-token';
  private _token: string | undefined = undefined;
  private _user: User | undefined = undefined;

    get token(): string | undefined {
    return this._token;
  }

  get user(): User | undefined {
    return this._user;
  }

  async initialize(): Promise<void> {
    // TODO: Implement
  }

  async set(user: User, token: string): Promise<void> {
    // TODO: Implement
  }

  async clear(): Promise<void> {
    // TODO: Implement
  }

}

export default class IdentitySingleton {
  private static instance: Identity | undefined = undefined;

  static getInstance(): Identity {
    if(this.instance === undefined) this.instance = new Identity();
    return this.instance;
  }
}

```

### Initializing the User

To provide our application's users with a great user experience, our application will attempt to automatically log users in if an authorization token is found on device. If an authorization token can be found, we'll make a call out to an API endpoint `/users/current` to retrieve the current user's information. Once that data is obtained, we'll set our `token` and `user` properties.

#### First Test

Open up `Identity.test.ts`. We're going to do some test setup first; defining mocks, writing setup/teardown code and making sure that our singleton implementation works:

```TypeScript
import { Plugins } from '@capacitor/core';
import IdentitySingleton, { Identity } from './Identity';

const mockToken = '3884915llf950';
const mockUser = {
  id: 42,
  firstName: 'Joe',
  lastName: 'Tester',
  email: 'test@test.org',
};

describe('Identity', () => {
  let identity: Identity;

  beforeEach(() => {
    identity = IdentitySingleton.getInstance();
    identity['_token'] = undefined;
    identity['_user'] = undefined;
    (Plugins.Storage as any) = jest.fn();
    (Plugins.Storage.get as any) = jest.fn();
    (Plugins.Storage.set as any) = jest.fn();
    (Plugins.Storage.remove as any) = jest.fn();
  });

  it('should use the singleton instance', () => {
    expect(identity).toBeDefined();
  });

  afterEach(() => {
    (Plugins.Storage as any).mockRestore();
    (Plugins.Storage.get as any).mockRestore();
    (Plugins.Storage.set as any).mockRestore();
    (Plugins.Storage.remove as any).mockRestore();
  });
});
```

Ensure that this test passes. Once verified, add a new `describe` block after the singleton test for the `initialize` function:

```TypeScript
  ...
  describe('initialize', () => {
     beforeEach(() => {
      (window.fetch as any) = jest.fn(() => {
        return Promise.resolve({
          json: () => Promise.resolve(mockUser)
        });
      });
    });

    afterEach(() => {
      (window.fetch as any).mockRestore();
    });
  });
  ...
```

Our `initialize` function needs to make a network request to fetch the current user's information. There's a million different HTTP networking libraries available but we'll make use of `window.fetch` since it's available out-of-the-box with JavaScript.

First, we need to ensure that we can are looking in the proper place for our token. Place this test in between the setup and teardown code written for the `initialize` describe block:

```TypeScript
    ...
    it('gets the stored token', async () => {
      (Plugins.Storage.get as any).mockImplementation(() =>
        Promise.resolve({ value: mockToken })
      );
      await identity.initialize();
      expect(Plugins.Storage.get).toHaveBeenCalledTimes(1);
      expect(Plugins.Storage.get).toHaveBeenCalledWith({ key: 'auth-token' });
    });
    ...
```

Next, we'll write tests covering the path where an authorization token is available in device storage. These tests should be placed under the test we just added:

```TypeScript
    ...
    describe('if a token exists', () => {
      beforeEach(() => {
        (Plugins.Storage.get as any).mockImplementation(() =>
          Promise.resolve({ value: mockToken }),
        );
      });

      it('assigns the token', async () => {
        await identity.initialize();
        expect(identity.token).toEqual(mockToken);
      });

      it('gets the current user', async () => {
        await identity.initialize();
        expect(window.fetch).toHaveBeenCalledTimes(1);
        expect(identity.user).toEqual(mockUser);
      });

      it('assigns the current user', async () => {
        await identity.initialize();
        expect(identity.user).toEqual(mockUser);
      });
    });
    ...
```

Note how we're mocking the `Storage` API before each test to return our desired value. We're also mocking our network connection in the second test to simulate the response we'd expect the network to return.

Finally, we'll move onto the path where an authorization token is not available on device:

```TypeScript
    ...
    describe('if there is not a token', () => {
      beforeEach(() => {
        (Plugins.Storage.get as any).mockImplementation(() =>
          Promise.resolve({ value: null }),
        );
      });

      it('does not get the current user', async () => {
        await identity.initialize();
        expect(identity.token).toBeUndefined();
        expect(identity.user).toBeUndefined();
      });
    });
    ...
```

It's important to keep the two branches in separate describe blocks as they each require different setup code. Now we have all the tests we need for `initialize`, and they're all failing, so it's time to code!

#### Then Code

Head over to `Identity.ts` and let's implement `initialize`:

```TypeScript
...
export class Identity {
  private _key = 'auth-token';
  private _token: string | undefined = undefined;
  private _user: User | undefined = undefined;

    get token(): string | undefined {
    return this._token;
  }

  get user(): User | undefined {
    return this._user;
  }

  async initialize(): Promise<void> {
   const { Storage } = Plugins;
   const { value } = await Storage.get({ key: this._key });

   if (!value) return;

   this._token = value;
   this._user = await this.fetchUser(this._token);
  }

  async set(user: User, token: string): Promise<void> {
    // TODO: Implement
  }

  async clear(): Promise<void> {
    // TODO: Implement
  }

  /**
   * This fetches user information and parses it into a User object.
   * @param token Authorization token
   * @returns {Promise<User>} The authenticated user's information.
   */
  private async fetchUser(token: string): Promise<User> {
    const headers = { Authorization: 'Bearer ' + token };
    const url = `${process.env.REACT_APP_DATA_SERVICE}/users/current`;
    const response = await fetch(url, { headers });
    const { id, firstName, lastName, email } = await response.json();
    return { id, firstName, lastName, email };
  }

}
...
```

There's quite a bit that goes on in making the network request and casting the response into a `User` object. This makes it a good candidate for a private method. Let's break down what it's doing:

1. The authorization header is generated which is needed to obtain the user's information
2. The API endpoint to retrieve the user's information is constructed using our environment variable
3. A GET request is made to the constructed URL with headers provided in the `options` parameter
4. The JSON response body is deconstructed to obtain the values we need for a `User` object
5. TypeScript asserts that we are returning a `User` object based on the object being returned

### Setting the User and Storing the Token

The `initialize` function takes care of the case when the user has already established their identity within our application. We need a way to set the identity after the user has signed in using the login page.

#### First Test

Open `Identity.test.ts` and add the following test cases under the `initialize` describe block:

```TypeScript
    ...
    describe('set', () => {
      beforeEach(() => {
        (Plugins.Storage.set as any).mockImplementation(() => Promise.resolve());
      });

      it('sets the user', async () => {
        await identity.set(mockUser, mockToken);
        expect(identity.user).toEqual(mockUser);
      });

      it('sets the token', async () => {
        await identity.set(mockUser, mockToken);
        expect(identity.token).toEqual(mockToken);
      });

      it('saves the token in storage', async () => {
        await identity.set(mockUser, mockToken);
        expect(Plugins.Storage.set).toHaveBeenCalledTimes(1);
        expect(Plugins.Storage.set).toHaveBeenCalledWith({
          key: 'auth-token',
          value: mockToken,
        });
      });
    });
    ...
```

That's all we need to cover for the `set` method, so let's go ahead and implement this method.

#### Then Code

**Challenge:** Implement the `set` method of `Identity`.

### Clearing the User

The last piece to the identity data service class is to provide the ability to clear the application user's data, both in-memory and on device.

#### Test First

After the describe block for the `set` method, add the following:

```TypeScript
  ...
  describe('clear', () => {
    beforeEach(async () => {
      await identity.set(mockUser, mockToken);
      (Plugins.Storage.remove as any).mockImplementation(() =>
        Promise.resolve(),
      );
    });

    it('clears the user', async () => {
      await identity.clear();
      expect(identity.user).toBeUndefined();
    });

    it('clears the token', async () => {
      await identity.clear();
      expect(identity.token).toBeUndefined();
    });

    it('clears the token in storage', async () => {
      await identity.clear();
      expect(Plugins.Storage.remove).toHaveBeenCalledTimes(1);
      expect(Plugins.Storage.remove).toHaveBeenCalledWith({
        key: 'auth-token',
      });
    });
  });
  ...
```

You know the drill, failing tests means it's time to code.

#### Then Code

**Challenge:** Implement the `clear` method of the `Identity` class.

## Authentication Singleton

## Conclusion

Now we have two singletons that power our application's authentication. Next, we're going to use them to derive application state and control routing.
