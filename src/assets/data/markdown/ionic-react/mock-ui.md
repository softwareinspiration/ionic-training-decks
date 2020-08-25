# Lab: Mock Up the Interface

In this lab, you will:

- Model the data
- Mock up the user interface

## Overview

Let's mock up how components will be used in each page. This allows us to test out exactly how our data should look like and also allows us to concentrate on styling without worrying about other moving parts. This is a common technique used when laying out user interfaces for an application.

## Mock Up the Tea Display

### Tea Model

Make a new folder named `models` inside the `src` directory of the project. This folder will contain models that represent the shape of the data we want displayed in our application.

Inside the new folder, we'll create a new file `Tea.ts` for our tea model:

```TypeScript
export interface Tea {
  id: number;
  name: string;
  description: string;
  image: string;
}
```

### Barrel Files

Before we move on, let's make TypeScript module resolution a bit easier to deal with. Have you ever worked on a project where files have a bunch of imports that look like this?

```TypeScript
import { Bar } from '../core/bar/Bar';
import { Foo } from '../core/foo/Foo';
import { Baz } from '../models/Baz';
```

The amount of import statements are obnoxious. They're also a maintenance headache as the application scales, since you may need to add additional imports. Wouldn't it be nice if we could import multiple modules on a single line like this?

```TypeScript
import { Bar, Foo } from '../core';
import { Baz } from '../models';
```

This can be achieved by grouping like-items into "barrel" files. Let's group all of our models in a single `index.ts` file within the `models` folder.

**`src/models/index.ts`**

```TypeScript
export * from './Tea';
```

The files in our `models` folder are pretty redundant at this moment, but as the application grows this will help keep our import statements from getting out of hand.
index.

### The Tea Page

#### Rename the Home Page

Our app currently has a page called `Home`, but we want to display several types of teas on it. Let's rename that page so we can find it more easily as our application grows. This is a two part operation:

1. Move the files
2. Rename the objects

#### Move the Files

First, remove any snaphots if you have them stored under the `pages` directory. We'll regenerate them. Next, we'll move and rename our `pages` folder and it's contents:

```bash
$ mv src/pages src/tea
$ mv src/tea/Home.tsx src/tea/TeaList.tsx
$ mv src/tea/Home.css src/tea/TeaList.css
$ mv src/tea/Home.test.tsx src/tea/TeaList.test.tsx
```

Note that you don't _have_ to do this from a terminal instance; it's used here as a visual guide.

#### Rename the Objects

The TypeScript files in `src/tea` contain path references to the old `home` files, and our component is named `<Home />`. Change the component's name to `<TeaList />` and update the reference in the test file.

As an example, here is what `src/tea/TeaList.tsx` should look like when you are done:

```TypeScript
import { ... } from '@ionic/react';
import React from 'react';
import ExploreContainer from '../components/ExploreContainer';
import './TeaList.css';

const TeaList: React.FC = () => {
  return (
    ...
  );
}

export default TeaList;
```

Finally, update `App.tsx` to replace references to our old `<Home />` component and update the routing to have a `tea` route instead of a `home` route:

```TypeScript
...
import { TeaList } from './tea/TeaList';
...
const App: React.FC = () => {
  useEffect(() => {
    ...
  });

  return (
    <IonApp>
      <IonReactRouter>
        <IonRouterOutlet>
          <Route path="/tea" component={TeaList} exact={true} />
          <Route exact path="/" render={() => <Redirect to="/tea" />} />
        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;
```

Run your tests again to validate that we didn't break any tests during this process. Additionally a new snapshot will be captured for our `<TeaList />` component.
