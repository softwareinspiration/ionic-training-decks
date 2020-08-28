# Lab: Handle Authentication

In this lab, you will learn how to:

- Use environment variables
- Interact with a data service
- Supply application-level state
- Control navigation based on state

## Overview

Our application has a login page but it doesn't do much; we don't have a way to authenticate users. We also don't have a way to direct unauthenticated users to our login page before they view our list of teas. Let's set that up!

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

## Write Data Service Logic

For the purpose of our application, "authentication" consists of two parts:

1. Managing the identity of the user currently interacting with the application
2. Communicating between the application and the authentication API

We're going to pre-emptively decouple each portion to it's own class. This will make it easier if we ever need to swap implementations of either part. We'll also get brownie points for following the Single Responsibility Principle!

### Side Note: `new Class()` vs. Singletons

Most data service logic classes used in a web or mobile application either (a) only need one instance or (b) require the instance to be shared (singleton). The data service classes we'll be building will be singletons.

Some frameworks provide a mechanism to automagically set your data service classes up to be singletons out-of-the-box, React is not one of those frameworks.

I commonly see React projects export a singleton instance like this:

```TypeScript
class MyClass {}
export default new MyClass();
```

Which works, but isn't ideal:

- If `MyClass` isn't exported, it becomes very difficult to mock and test
- Suppose `MyClass` was exported, nothing tells the developers to use the default export instead of creating a new instance

We'll be implementing the Singleton Pattern the traditional way, as shown in the following sections.

### Identity Singleton

Start by creating a new folder named `auth` within our `src` folder. We'll keep all authentication-based files here. Going forward, we can refer to this process as creating a "feature-folder".

#### First Test

#### Then Code

### Authentication Singleton

## Provide Application State

### Create Authentication Context

### Create Authentication Hook

## Update Routing Flow

## Conclusion
