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

Open `TastingNoteEditor.tsx` and add in the following code (add any imports along the way):

```TypeScript
import React from 'react';

interface TastingNoteEditorProps {
  onDismiss: () => void;
  note?: TastingNote;
}

const TastingNoteEditor: React.FC<TastingNoteEditorProps> = ({
  onDismiss,
  note = undefined,
}) => {
  return (
    <>
      <IonHeader></IonHeader>
      <IonContent></IonContent>
      <IonFooter></IonFooter>
    </>
  );
};
export default TastingNoteEditor;
```

We are creating a shell component to house our editor in. There are a few notable items here:

- Since we're building a component - opposed to a full page - we do not wrap inner elements in an `IonPage`
- This component will contain a close button; it is the parent component's responsibility to provide that functionality
- We want the ability to update an existing note later on, so we'll add it as an optional prop

Let's also start the test file. Open `TastingNoteEditor.test.tsx` and paste in the following code:

```TypeScript
import React from 'react';
import { render } from '@testing-library/react';
import { cleanup } from '@testing-library/react-hooks';
import { ionFireEvent as fireEvent } from '@ionic/react-test-utils';
import TastingNotesSingleton, { TastingNotesService } from '../TastingNotesService';
import TastingNoteEditor from './TastingNoteEditor';


describe('<TastingNoteEditor />', () => {
  let mockOnDismiss: any;

  beforeEach(() => {
    mockOnDismiss = jest.fn();
  });

  afterEach(() => {
    cleanup();
    jest.restoreAllMocks();
  });
});
```

### Hookup the Modal

The first thing we need to do is get a modal overlayed hooked up for the "add a new note" case. This will allow us to test out the component for the modal as we develop it.

We will launch the modal for the "add a new note" scenario from a floating action button on the `TastingNotes` component.

#### Test First

Open `src/tasting-notes/TastingNotes.test.tsx` and add the following describe block:

```TypeScript
  ...
  describe('add a new note', () => {
    it('displays the editor modal', async () => {
      const { container, getByText } = render(<TastingNotes />);
      const button = container.querySelector('ion-fab-button')!;
      fireEvent.click(button);
      await wait(() => expect(getByText('Add New Tasting Note')).toBeDefined());
    });
  });
  ...
```

#### Then Code

Now let's add the modal to the tasting notes page. Open `TastingNotes.tsx` and add the following code:

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
         <IonModal isOpen={showModal}>
          <TastingNoteEditor onDismiss={() => setShowModal(false)} />
        </IonModal>
      </IonContent>
    </IonPage>
  );
};
export default TastingNotes;
```

Don't worry, the test you added will still be failing. We'll fix that next.

### Mock the Editor Component

#### Basic Layout

To make our test in `TastingNotes.test.tsx` pass, we need some text that says "Add New Tasting Note". Luckily, that will be the header text for `TastingNoteEditor`. Let's lay down some basics of the form's UI - including the header.

Open up `src/tasing-notes/editor/TastingNoteEditor.tsx` and fill out the template like so:

```JSX
<>
  <IonHeader>
    <IonToolbar>
      <IonTitle>Add New Tasting Note</IonTitle>
      <IonButtons slot="primary">
        <IonButton id="cancel-button" onClick={() => onDismiss()}>
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
</>
```

Typically we'd test first, but in this instance I'll let it slide. Add a new describe block to `TastingNoteEditor.test.tsx`:

```TypeScript
describe('cancel button', () => {
  it('calls the dismiss function', async () => {
    const { container } = render(
      <TastingNoteEditor onDismiss={mockOnDismiss} />,
    );
    const button = await waitForElement(
      () => container.querySelector('#cancel-button')!,
    );
    fireEvent.click(button);
    expect(mockOnDismiss).toHaveBeenCalledTimes(1);
  });
});
```

#### Inputs

Let's start filling out that form. First start by adding the following code to hook into React Form Hook:

```TypeScript
import React, { useState } from 'react';
...
import { useForm, Controller } from 'react-hook-form';
...
interface TastingNoteEditorProps {
  ...
}

const TastingNoteEditor: React.FC<TastingNoteEditorProps> = ({
  isOpen,
  setIsOpen,
  id
}) => {
  const { handleSubmit, control, formState } = useForm<TastingNote>({
    mode: 'onChange',
  });

  return (
    ...
  );
};
export default TastingNoteEditor;
```

We already have one simple form, the `LoginPage`. Over there we used a list of inputs, we will need something like that so let's use it as a model for the first couple of input fields here. All of the following code will go inside the `form` element:

```JSX
<IonItem>
  <IonLabel position="floating">Brand</IonLabel>
  <Controller
    render={({ onChange, value }) => (
      <IonInput name="brand" onIonChange={onChange} value={value} />
    )}
    control={control}
    name="brand"
    rules={{ required: true }}
    defaultValue={note?.brand || ''}
  />
</IonItem>
<IonItem>
  <IonLabel position="floating">Name</IonLabel>
  <Controller
    render={({ onChange, value }) => (
      <IonInput onIonChange={onChange} value={value} />
    )}
    control={control}
    name="name"
    rules={{ required: true }}
    defaultValue={note?.name || ''}
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

```JSX
<IonItem>
  <IonLabel>Category</IonLabel>
  <Controller
    render={({ onChange, value }) => (
      <>
        {categories.length && (
          <IonSelect onIonChange={onChange} value={value}>
            {categories.map((tea: Tea) => (
              <IonSelectOption key={tea.id} value={tea.id}>
                {tea.name}
              </IonSelectOption>
            ))}
          </IonSelect>
        )}
      </>
    )}
    control={control}
    name="teaCategoryId"
    rules={{ required: true }}
    defaultValue={note?.teaCategoryId || 0}
  />
</IonItem>
```

Underneath that, we'll add a field for rating:

```JSX
<IonItem>
  <IonLabel>Rating</IonLabel>
  <Controller
    render={({ onChange, value }) => (
      <Rating onRatingChange={onChange} initialRating={value} />
    )}
    control={control}
    name="rating"
    rules={{ required: true }}
    defaultValue={note?.rating || 0}
  />
</IonItem>
```

Isn't it cool how our reusable `Rating` component fits seamlessly into the React Form Hook library?

Finally, we'll add a text area for some free-form notes on the tea tasted:

```JSX
<IonItem>
  <IonLabel position="floating">Notes</IonLabel>
  <Controller
    render={({ onChange, value }) => (
      <IonTextarea onIonChange={onChange} rows={5} value={value} />
    )}
    control={control}
    name="notes"
    rules={{ required: true }}
    defaultValue={note?.notes || 0}
  />
</IonItem>
```

### Wiring up the Form

We will now turn our attention to wiring the form up so it can be submitted to the tasting notes data service.

#### Initialization

The only initialization we need at this point is to fetch the list of tea categories to bind to our `ion-select` component.

##### Test First

Add the following mock to `src/tasting-notes/editor/TastingNoteEditor.test.tsx`:

```TypeScript
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

Now let's add a mock for the `getAll()` method of `TeaCategoriesSingleton` and add describe block and test for the component's initialization logic:

```TypeScript
describe('<TastingNoteEditor />', () => {
  let teaCategoriesService: TeaCategories;

  beforeEach(() => {
    ...
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

  ...

});
```

##### Then Code

We've seen this code before. Add the following to `TastingNoteEditor.tsx`:

```TypeScript
useEffect(() => {
  const initTeaCategories = async () => {
    const teaCategories = await getCategories();
    setCategories(teaCategories || []);
  };
  initTeaCategories();
}, []);
```

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

## List the Tasting Notes

We can add notes all day long, but we cannot see them. Let's shift back to the tasting notes page and do a little work. When we come into the page, we want to display the existing notes in a simple list.

### Test First

First we need to provide a mock for the `TastingNotesService` and configure it to return some basic test data. Open up `src/tasting-notes/TastingNotes.test.tsx` and update the file like so:

```Typescript
import React from 'react';
...

const mockTastingNotes: Array<TastingNote> = [
  {
    id: 73,
    brand: 'Bently',
    name: 'Brown Label',
    notes: 'Essentially OK',
    rating: 3,
    teaCategoryId: 2,
  },
  {
    id: 42,
    brand: 'Lipton',
    name: 'Yellow Label',
    notes: 'Overly acidic, highly tannic flavor',
    rating: 1,
    teaCategoryId: 3,
  },
];

describe('<TastingNotes />', () => {
  let tastingNotesService: TastingNotesService;

  beforeEach(() => {
    tastingNotesService = TastingNotesSingleton.getInstance();
    tastingNotesService.getAll = jest.fn(() =>
      Promise.resolve(mockTastingNotes),
    );
  });

  it('renders consistently', async () => {
    const { asFragment } = render(<TastingNotes />);
    await wait(() => expect(asFragment).toMatchSnapshot());
  });

  describe('add new note', () => {
    ...
  });

  afterEach(() => {
    cleanup();
    jest.restoreAllMocks();
  });
});
```

Then we can create a couple of simple tests to ensure our list is displayed properly:

```TypeScript
  ...
  describe('initialization', () => {
    it('gets all of the notes', async () => {
      render(<TastingNotes />);
      await wait(() => expect(tastingNotesService.getAll).toBeCalledTimes(1));
    });

    it('displays the notes', async () => {
      const { container } = render(<TastingNotes />);
      await wait(() => {
        expect(container).toHaveTextContent(/Bently/);
        expect(container).toHaveTextContent(/Lipton/);
      });
    });
  });
  ...
```

Failing tests means time to code!

### Then Code

You should know the drill by now, in order to fetch data during initialization we need a `useEffect` and use `useState` to hold the data for us to render. We'll also need to create a list to display the tasting notes:

```TypeScript
...
const TastingNotes: React.FC = () => {
  ...
  const [tastingNotes, setTastingNotes] = useState<TastingNote[]>([]);
  const { getAllNotes } = useTastingNotes();

  useEffect(() => {
    const initNotes = async () => {
      const notes = await getAllNotes();
      setTastingNotes(notes || []);
    };
    initNotes();
  }, []);
};

return (
  <IonPage>
    <IonHeader>
      ...
    </IonHeader>
    <IonContent>
      <IonHeader>
        ...
      </IonHeader>

      <IonList>
        {tastingNotes.map((note, idx) => (
          <IonItem key={idx}>
            <IonLabel>
              <div>{note.brand}</div>
              <div>{note.name}</div>
            </IonLabel>
          </IonItem>
        ))}
      </IonList>

      <IonFab vertical="bottom" horizontal="end" slot="fixed">
        ...
      </IonFab>
      <TastingNoteEditor isOpen={showModal} setIsOpen={setShowModal}>
    </IonContent>
  </IonPage>
);
export default TastingNotes;
```

## Refreshing Tasting Notes

The notes we have added so far show up, but when we add a new note it does not. We can easily fix that.

### Test First

Add the following test to the "add new note" describe block of `TastingNotes.test.tsx`. We want to make sure we wait for the modal to be dismissed and that we refresh the note list.

```TypeScript
it('refreshes the notes list', async () => {
  const { container } = render(<TastingNotes />);
  const button = container.querySelector('ion-fab-button')!;
  fireEvent.click(button);
  const cancelButton = await waitForElement(
    () => container.querySelector('#cancel-button')!,
  );
  fireEvent.click(cancelButton);
  expect(tastingNotesService.getAll).toHaveBeenCalledTimes(2);
});
```

### Then Code

We need a way to update `tastingNotes` when the modal has been dismissed. There's already code in place to retrieve the list of tasting notes when the component is initialized, it would be advantageous if we could modify the `useEffect`, right?

Let's shift our thinking towards hooks and how they work. We can run logic when properties are changed, and for all intents and purposes, we really just care about getting the tasting notes when `showModal` is set to `false`. This always happens when the component is initialized and whenever the modal is dismissed.

We can modify the `useEffect` in `TastingNotes.tsx` to achieve this:

```TypeScript
useEffect(() => {
  if (!showModal) {
    const initNotes = async () => {
      const notes = await getAllNotes();
      setTastingNotes(notes || []);
    };
    initNotes();
  }
}, [showModal]);
```

The modification above states that our `useEffect` listens to changes on `showModal`. If `showModal` is `false` then we run an asyncrhonous function that updates `tastingNotes`. This is pretty powerful!

#### Side-Note: Better Practices

Now we refresh the list of tasting notes whenever the user dismisses the modal, whether they have added a new note or not. In a real-life scenario, you would want to guard against this.

Additionally, if this list of notes was tied to the current application user it would be a waste of network resources to refresh the list every time a new note was added. It would be practical to store the intitial list of notes application state and add new notes to that in-memory list.

## Edit a Note

It would be nice to be able to go back and either view or modify tasting notes that had been previously created.

## Conclusion

Congratulations. You have used what we have learned to this point to add a whole new feature to your app. Along the way, you also exercised a few Framework components you had not used before. We are almost done with this app. One more page to go and we will be done.
