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
    const url = `${process.env.REACT_APP_DATA_SERVICE}/user-tasing-notes`;
    return await this.request(url, token);
  }

  async get(token: string, id: number): Promise<TastingNote> {
    const url = `${process.env.REACT_APP_DATA_SERVICE}/user-tasing-notes/${id}`;
    return await this.request(url, token);
  }

  async delete(token: string, id: number): Promise<void> {
    const options = { method: 'DELETE' };
    const url = `${process.env.REACT_APP_DATA_SERVICE}/user-tasing-notes/${id}`;
    return await this.request(url, token, options);
  }

  async save(token: string, note: TastingNote): Promise<void> {
    const options = { method: 'POST' };
    let url = `${process.env.REACT_APP_DATA_SERVICE}/user-tasing-notes`;
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

Fill in `

## Conclusion

Congratulations. You have used what we have learned to this point to add a whole new feature to your app. Along the way, you also exercised a few Framework components you had not used before. We are almost done with this app. One more page to go and we will be done.
