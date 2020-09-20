# Lab: Add the Notes Feature

In this lab you will:

- Take what you have learned so far and add a whole new feature
- Use some Ionic Framework components we have not seen yet, including:
- The modal overlay, various form elements, and the sliding Ion Item

## Overview

Let's take what we've learned so far to add a whole new feature to our application. Specifically, we will add the "Tasting Notes" feature. In addition to exercising some skills we have already learned such as creating models, data service singletons, components, and pages, we will also use some Ionic Framework components we have not seen yet.

## Prelimary Items

Before we move onto new stuff, there are a couple of preliminary items that we need to get out of the way first:

- Create a data model
- Create a data service singleton that performs HTTP requests
- Create a hook to abstract our data service singleton from component logic

These are a couple things we have done multiple times now, so I will just give you the code to move things along. If you are still unsure on these items though, please review the code that is provided here.

### The `TastingNote` Model

Add the following model in `src/models/TastingNote.ts` and make sure to update the barrel file accordingly:

```TypeScript
export interface TastingNote {
  id?: number;
  brand: string;
  name: string;
  notes: string;
  rating: number;
  teaCategoryId: number;
}
```

### The `TastingNotes` Singleton

Create two files inside `src/tasting-notes`: `TastingNotesService.tsx` and `TastingNotesService.test.tsx`.

#### Test First

Fill in `TastingNotesService.test.tsx` with the following:

```TypeScript
import { TastingNote } from '../models';
import TastingNotesSingleton, { TastingNotesService } from './TastingNotesService';

const mockToken = '3884915llf950';

describe('TastingNotesService', () => {
  let tastingNotesService: TastingNotesService;

  beforeEach(() => {
    tastingNotesService = TastingNotesSingleton.getInstance();
    (window.fetch as any) = jest.fn(() => {
      return Promise.resolve({
        json: () => Promise.resolve(),
      });
    });
  });

  it('should use the singleton instance', () => {
    expect(tastingNotesService).toBeDefined();
  });

  describe('get all', () => {
    it('GETs the user tasting notes', async () => {
      await tastingNotesService.getAll(mockToken);
      expect(window.fetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('get', () => {
    it('GETs a specific note', async () => {
      await tastingNotesService.get(mockToken, 4);
      expect(window.fetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('delete', () => {
    it('DELETEs a specific note', async () => {
      await tastingNotesService.delete(mockToken, 4);
      expect(window.fetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('save', () => {
    it('POSTs a new note', async () => {
      const note: TastingNote = {
        brand: 'Lipton',
        name: 'Yellow Label',
        notes: 'Overly acidic, highly tannic flavor',
        rating: 1,
        teaCategoryId: 3,
      };
      await tastingNotesService.save(mockToken, note);
      expect(window.fetch).toHaveBeenCalledTimes(1);
    });

    it('saves an existing note', async () => {
      const note: TastingNote = {
        id: 7,
        brand: 'Lipton',
        name: 'Yellow Label',
        notes: 'Overly acidic, highly tannic flavor',
        rating: 1,
        teaCategoryId: 3,
      };
      await tastingNotesService.save(mockToken, note);
      expect(window.fetch).toHaveBeenCalledTimes(1);
    });
  });

  afterEach(() => {
    (window.fetch as any).mockRestore();
  });
});
```

#### Then Code

Place the following code inside `TastingNotesService.tsx`:

```TypeScript
import { TastingNote } from '../models';

export class TastingNotesService {
  async getAll(token: string): Promise<Array<TastingNote>> {
    const url = `${process.env.REACT_APP_DATA_SERVICE}/user-tasting-notes`;
    return await this.request(url, token);
  }

  async get(token: string, id: number): Promise<TastingNote> {
    const url = `${process.env.REACT_APP_DATA_SERVICE}/user-tasting-notes/${id}`;
    return await this.request(url, token);
  }

  async delete(token: string, id: number): Promise<void> {
    const options = { method: 'DELETE' };
    const url = `${process.env.REACT_APP_DATA_SERVICE}/user-tasting-notes/${id}`;
    return await this.request(url, token, options);
  }

  async save(token: string, note: TastingNote): Promise<void> {
    const options = { method: 'POST' };
    let url = `${process.env.REACT_APP_DATA_SERVICE}/user-tasting-notes`;
    if (note.id) url += `/${note.id}`;
    return await this.request(url, token, options);
  }

  private async request(
    url: string,
    token: string,
    options: any = undefined,
  ): Promise<any> {
    const headers = { Authorization: 'Bearer ' + token };
    const response = await fetch(url, { ...options, headers });
    return await response.json();
  }
}

export default class TastingNotesSingleton {
  private static instance: TastingNotesService | undefined = undefined;

  static getInstance(): TastingNotesService {
    if (this.instance === undefined) this.instance = new TastingNotesService();
    return this.instance;
  }
}
```

### The `useTastingNotes` Hook

Create two more files inside `src/tasting-notes`: `useTastingNotes.ts` and `useTastingNotes.test.ts`

#### Test First

Fill in `useTastingNotes.test.ts`:

```TypeScript
import { renderHook, act, cleanup } from '@testing-library/react-hooks';
import { useTastingNotes } from './useTastingNotes';
import IdentitySingleton, { Identity } from '../auth/Identity';
import TastingNotesSingleton, {
  TastingNotesService,
} from './TastingNotesService';
import { TastingNote } from '../models';
import { doesNotThrow } from 'assert';

const mockToken = '3884915llf950';
const mockNote = {
  id: 4,
  brand: 'Lipton',
  name: 'Yellow Label',
  notes: 'Overly acidic, highly tannic flavor',
  rating: 1,
  teaCategoryId: 3,
};

describe('useTastingNotes', () => {
  let identity: Identity;
  let tastingNotesService: TastingNotesService;

  beforeEach(() => {
    identity = IdentitySingleton.getInstance();
    identity['_token'] = mockToken;
    tastingNotesService = TastingNotesSingleton.getInstance();
  });

  describe('get all user tasting notes', () => {
    it('returns an array of TastingNote', async () => {
      tastingNotesService.getAll = jest.fn(() => Promise.resolve([]));
      let notes: Array<TastingNote> | undefined;
      const { result } = renderHook(() => useTastingNotes());
      await act(async () => {
        notes = await result.current.getAllNotes();
      });
      expect(notes).toEqual([]);
    });

    it('sets an error if there is a failure', async () => {
      const error = 'Uh-oh, something went wrong!';
      tastingNotesService.getAll = jest.fn(() => {
        throw new Error(error);
      });
      const { result } = renderHook(() => useTastingNotes());
      await act(async () => {
        await result.current.getAllNotes();
      });
      expect(result.current.error).toEqual(error);
    });
  });
  describe('get the specific user tasting note', () => {
    it('returns the specific TastingNote', async () => {
      tastingNotesService.get = jest.fn(() => Promise.resolve(mockNote));
      let note: TastingNote | undefined;
      const { result } = renderHook(() => useTastingNotes());
      await act(async () => {
        note = await result.current.getNote(4);
      });
      expect(note).toEqual(mockNote);
    });

    it('sets an error if there is a failure', async () => {
      const error = 'Uh-oh, something went wrong!';
      tastingNotesService.get = jest.fn(() => {
        throw new Error(error);
      });
      const { result } = renderHook(() => useTastingNotes());
      await act(async () => {
        await result.current.getNote(4);
      });
      expect(result.current.error).toEqual(error);
    });
  });

  describe('delete the specific user tasting note', () => {
    it('returns the specific TastingNote', async () => {
      tastingNotesService.delete = jest.fn(() => Promise.resolve());
      const { result } = renderHook(() => useTastingNotes());
      await act(async () => {
        await result.current.deleteNote(4);
      });
      expect(tastingNotesService.delete).toHaveBeenCalledTimes(1);
    });

    it('sets an error if there is a failure', async () => {
      const error = 'Uh-oh, something went wrong!';
      tastingNotesService.delete = jest.fn(() => {
        throw new Error(error);
      });
      const { result } = renderHook(() => useTastingNotes());
      await act(async () => {
        await result.current.deleteNote(4);
      });
      expect(result.current.error).toEqual(error);
    });
  });

  describe('save the specific user tasting note', () => {
    it('saves a specific TastingNote', async () => {
      tastingNotesService.save = jest.fn(() => Promise.resolve());
      const { result } = renderHook(() => useTastingNotes());
      await act(async () => {
        await result.current.saveNote(mockNote);
      });
      expect(tastingNotesService.save).toBeCalledTimes(1);
    });

    it('saves a new TastingNote', async () => {
      const note = { ...mockNote };
      delete note.id;
      tastingNotesService.save = jest.fn(() => Promise.resolve());
      const { result } = renderHook(() => useTastingNotes());
      await act(async () => {
        await result.current.saveNote(note);
      });
      expect(tastingNotesService.save).toBeCalledTimes(1);
    });

    it('sets an error if there is a failure', async () => {
      const error = 'Uh-oh, something went wrong!';
      tastingNotesService.save = jest.fn(() => {
        throw new Error(error);
      });
      const { result } = renderHook(() => useTastingNotes());
      await act(async () => {
        await result.current.saveNote(mockNote);
      });
      expect(result.current.error).toEqual(error);
    });
  });

  afterEach(() => {
    cleanup();
    jest.restoreAllMocks();
  });
});
```

#### Then Code

Fill in `useTastingNotes.ts`:

```TypeScript
import { useState } from 'react';
import IdentitySingleton from '../auth/Identity';
import TastingNotesSingleton from './TastingNotesService';
import { TastingNote } from '../models';

export const useTastingNotes = () => {
  const identityService = IdentitySingleton.getInstance();
  const tastingNotesService = TastingNotesSingleton.getInstance();
  const [error, setError] = useState<string>('');

  const getAllNotes = async (): Promise<Array<TastingNote> | undefined> => {
    try {
      return await tastingNotesService.getAll(identityService.token || '');
    } catch (error) {
      setError(error.message);
    }
  };

  const getNote = async (id: number): Promise<TastingNote | undefined> => {
    try {
      return await tastingNotesService.get(identityService.token || '', id);
    } catch (error) {
      setError(error.message);
    }
  };

  const deleteNote = async (id: number) => {
    try {
      return await tastingNotesService.delete(identityService.token || '', id);
    } catch (error) {
      setError(error.message);
    }
  };

  const saveNote = async (note: TastingNote) => {
    try {
      return await tastingNotesService.save(identityService.token || '', note);
    } catch (error) {
      setError(error.message);
    }
  };

  return { error, getAllNotes, getNote, deleteNote, saveNote };
};

```

## Create the Editor Component

Now we are getting into the new stuff. Back to the usual format. 🤓

Let's create a composite component that we can use to both create new tasting notes or update existing notes. This component will be created in the tasting notes feature folder since it is going to be specific to that feature of the application.

Create a new folder inside of `src/tasting-notes` named `editor`. Add the following files in into the newly created folder:

- `TastingNoteEditor.css`
- `TastingNoteEditor.tsx`
- `TastingNoteEditor.test.tsx`

In `TastingNoteEditor.tsx` add the following code:

```TypeScript
import React from 'react';
import { IonModal } from '@ionic/react';

interface TastingNoteEditorProps {
  isOpen: boolean;
  setIsOpen: (value: React.SetStateAction<boolean>) => void;
  id?: number;
}

const TastingNoteEditor: React.FC<TastingNoteEditorProps> = ({
  isOpen,
  setIsOpen
  id,
}) => {
  return (
    <IonModal isOpen={isOpen}>
      <p>This is my modal!</p>
    </IonModal>
  );
};
export default TastingNoteEditor;
```

Here we are creating a shell modal component to house our editor in. Since we want the `TastingNotes` component to control whether the modal is open or closed, we'll have the parent component pass in props so that they can tell `TastingNoteEditor` when it's appropriate to show or hide itself. We also added a prop named `id` which we will use later. It will help us when we need to edit an existing note.

### Hookup the Modal

The first thing we need to do is add the `TastingNoteEditor` to our tasting notes page so we can test out the component for the modal as we develop it. We will launch the model for the "add a new note" scenario from a floating action button on the `TastingNotes` component.

#### Test First

Add the following describe block to `TastingNotes.test.tsx`:

```TypeScript
  ...
  describe('add new note', () => {
    it('displays the editor modal', async () => {
      const { container, getByText } = render(<TastingNotes />);
      const button = container.querySelector('ion-fab-button')!;
      fireEvent.click(button);
      const modal = await waitForElement(() =>
        getByText('Add New Tasting Note'),
      );
      expect(modal).toBeDefined();
    });
  });
  ...
```

Don't forget to add any imports.

#### Then Code

From here, the markup is pretty easy. Modify `TastingNotes` to add the following code:

```TypeScript
...
const TastingNotes: React.FC = () => {
  const [showModal, setShowModal] = useState<boolean>(false);

  return (
    <IonPage>
      <IonHeader>
        ...
      </IonHeader>
      <IonContent>
        <IonHeader collapse="condense">
          ...
        </IonHeader>
        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton onClick={() => setShowModal(true)}>
            <IonIcon icon={add} />
          </IonFabButton>
        </IonFab>
        <TastingNoteEditor isOpen={showModal} setIsOpen={setShowModal} />
      </IonContent>
    </IonPage>
  );
};
export default TastingNotes;
```

Don't worry, the test you added will still be failing. We'll fix that next.

### Mock the Editor Component

#### Basic Layout

To make our test in `TastingNotes.test.tsx` pass, we need some text that says "Add New Tasting Note". Fortuantely, that is _exactly_ what the header of our `TastingNoteEditor` component will be.

Let's lay our some more basics of the form's UI - we'll want a header section with a title, a footer section with a button, and the content that will be our form. So let's start there.

Open up `src/tasing-notes/editor/TastingNoteEditor.tsx` and replace the existing `<p>` tag inside the `IonModal` component with the following:

```JSX
<IonHeader>
  <IonToolbar>
    <IonTitle>Add New Tasting Note</IonTitle>
    <IonButtons slot="primary">
      <IonButton id="cancel-button" onClick={() => setIsOpen(false)}>
        <IonIcon slot="icon-only" icon={close} />
      </IonButton>
    </IonButtons>
  </IonToolbar>
</IonHeader>

<IonContent>
  <form></form>
</IonContent>

<IonFooter>
  <IonToolbar>
    <IonButton expand="full">Add</IonButton>
  </IonToolbar>
</IonFooter>
```

#### Inputs

Let's start filling out that form. First start by adding the following code to hook into React Form Hook:

```TypeScript
import React, { useState } from 'react';
...
import {useForm, Controller } from 'react-hook-form';
...
interface TastingNoteEditorProps {
  ...
}

const defaultValues = {
  brand: '',
  name: '',
  teaCategoryId: 0,
  rating: 0,
  notes: '',
};

const TastingNoteEditor: React.FC<TastingNoteEditorProps> = ({
  isOpen,
  setIsOpen,
  id
}) => {
  const { handleSubmit, control, formState } = useForm<TastingNote>({
    mode: 'onChange',
    defaultValues,
  });
  const [categories, setCategories] = useState<Array<string>>([]);
  return (
    ...
  );
};
export default TastingNoteEditor;
```

We already have one simple form, the `LoginPage`. Over there we used a list of inputs, we will need something like that so let's use it as a model for the first couple of input fields here. All of the following code will go inside the `form` element:

```TypeScript
<IonItem>
  <IonLabel position="floating">Brand</IonLabel>
  <Controller
    render={({ onChange }) => <IonInput onIonChange={onChange} />}
    control={control}
    name="brand"
    rules={{ required: true, minLength: 1 }}
  />
</IonItem>
<IonItem>
  <IonLabel position="floating">Name</IonLabel>
  <Controller
    render={({ onChange }) => <IonInput onIonChange={onChange} />}
    control={control}
    name="name"
    rules={{ required: true, minLength: 1 }}
  />
</IonItem>
```

We need a way to select the category of tea that we have. Add the following `useState` statement under the declaration for `useForm`:

```TypeScript
  ...
  const [categories, setCategories] = useState<Array<Tea>>([]);
  ...
```

Then add the following template syntax underneath the "name" field created above:

```TypeScript
<IonItem>
  <IonLabel>Category</IonLabel>
  <Controller
    render={({ onChange }) => (
      <IonSelect onIonChange={onChange}>
        {categories.map((tea: Tea) => (
          <IonSelectOption key={tea.id} value={tea.id}>
            {tea.name}
          </IonSelectOption>
        ))}
      </IonSelect>
    )}
    control={control}
    name="teaCategoryId"
    rules={{ required: true }}
  />
</IonItem>
```

Underneath that, we'll add a field for rating:

```TypeScript
<IonItem>
  <IonLabel>Rating</IonLabel>
  <Controller
    render={({ onChange }) => <Rating onRatingChange={onChange} />}
    control={control}
    name="rating"
    rules={{ required: true }}
  />
</IonItem>
```

Isn't it awesome how our reusable `Rating` component fits seamlessly into the React Form Hook library?

Finally, we'll add a text area for some free-form notes on the tea tasted:

```TypeScript
<IonItem>
  <IonLabel position="floating">Notes</IonLabel>
  <Controller
    render={({ onChange }) => (
      <IonTextarea onIonChange={onChange} rows={5} />
    )}
    control={control}
    name="notes"
    rules={{ required: true }}
  />
</IonItem>
```

### Wiring up the Form

We will now turn our attention to wiring the form up so it can be submitted to the tasting notes data service.

#### Initialization

The only initialization we need at this point is to fetch the list of tea categories to bind to our `ion-select` component.

##### Test First

Add the following mocks to `src/tasting-notes/editor/TastingNoteEditor.test.tsx`:

```TypeScript
const MockAddTastingNoteEditor: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(true);
  return <TastingNoteEditor isOpen={isOpen} setIsOpen={setIsOpen} />;
};

const mockTeaCategories = [
  {
    id: 7,
    name: 'White',
    image: 'assets/img/white.jpg',
    description: 'White tea description.',
    rating: 5,
  },
  {
    id: 8,
    name: 'Yellow',
    image: 'assets/img/yellow.jpg',
    description: 'Yellow tea description.',
    rating: 3,
  },
];
```

Here we are creating a mock component that will keep `TastingEditorNote` open for our test cases. We also have a small mock list of tea categories for our `ion-select` element to use for options. Now replace the existing `describe` block with the following:

```TypeScript
describe('<TastingNoteEditor />', () => {
  let teaCategoriesService: TeaCategories;
  let tastingNotesService: TastingNotesService;

  beforeEach(() => {
    teaCategoriesService = TeaCategoriesSingleton.getInstance();
    teaCategoriesService.getAll = jest.fn(() =>
      Promise.resolve(mockTeaCategories),
    );
  });

  describe('initialization', () => {
    it('binds the tea select', async () => {
      const { container } = render(<MockAddTastingNoteEditor />);
      const options = await waitForElement(
        () => container.querySelector('ion-select')!.children,
      );
      expect(options.length).toEqual(2);
      expect(options[0].textContent).toEqual('White');
      expect(options[1].textContent).toEqual('Yellow');
    });
  });

  afterEach(() => {
    cleanup();
    jest.restoreAllMocks();
  });
});
```

Don't forget to remove the existing snapshot test; we'll create new tests later on to create snapshots for when the editor is in add mode and when it's in update mode.

##### Then Code

We've seen this code before. I'll leave it to you to implement.

**Challenge:** Implement logic so that the list of `categories` is set when the component is initialized.

#### Perform the Add

Adding a tasting note is relatively easy: create a tasting note object using the form properties, call `saveNote()` from the tasting note hook and dismiss the modal.

##### Test First

TODO: Having trouble figuring out how to assert this.

##### Then Code

First let's modify the button in the footer. We want it to be disabled if the form is not valid and we need to supply it a click event:

```JSX
    ...
    <IonButton
      disabled={!formState.isValid}
      expand="full"
      onClick={handleSubmit(data => submitNote(data))}>
      Add
    </IonButton>
    ...
```

Now let's setup the `submitNote()` function:

```TypeScript
  ...
  const submitNote = async (data: TastingNote) => {
    await saveNote(data);
    setIsOpen(false);
  };
  ...
```

Nice! After the note is saved we close the modal. Pretty slick.

### List the Tasting Notes

We can add notes all day long, but we cannot see them. Let's shift back to the tasting notes page and do a little work. When we come into the page, we want to display the existing notes in a simple list.

#### Test First

#### Then Code

## Conclusion

Congratulations. You have used what we have learned to this point to add a whole new feature to your app. Along the way, you also exercised a few Framework components you had not used before. We are almost done with this app. One more page to go and we will be done.
