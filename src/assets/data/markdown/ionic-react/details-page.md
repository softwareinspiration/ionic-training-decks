# Lab: Tea Details Page

In this lab, you will learn how to:

- Use query parameters to create dynamic routes
- Leverage query parameters within components

## Overview

The Ionic Framework supports the common mobile paradigm of stacked navigation, where one page is logically displayed over the top of another page. In this lab we will see that paradigm in action by creating a simple "details" page for each of our teas. This page will start simple, but we will add more information to it later.

## Tea Feature Cleanup

We'll be placing more files into our tea feature folder: `src/tea`. At the root of the folder we already have 7 files, it makes sense to start creating some subfolders.

Go ahead and create subdirectories called `list` and `details`. Move `TeaList.tsx`, `TeaList.test.tsx`, and `TeaList.css` into `list` then create `TeaDetails.tsx`, `TeaDetails.test.tsx`, and `TeaDetails.css` inside the `details` subdirectory.

Now do the bare minimum needed to create and export a component named `<TeaDetails />` inside `src/tea/details/TeaDetails.tsx` and write a snapshot test in `src/tea/details/TeaDetails.test.tsx`.

Make sure update your import statements, delete `src/tea/__snapshots__`, and regenerate your snapshots.

## Adding the Details Route

### Create the Files

Create two files in `src/tea` named `TeaDetails.tsx` and `TeaDetails.test.tsx`. Do the bare minimum needed to create and export a component named `<TeaDetails />`.

### Adding the Details Route

Head over to `App.tsx`. We need to add an additional route inside our `<IonRouterOutlet>`:

```TypeScript
      ...
      <IonRouterOutlet>
        ...
        <Route path="/tea/details/:id" component={TeaDetails} />
        ...
      </IonRouterOutlet>
      ...
```

With a little URL hacking you should be able to navigate to this page, but you will need to supply an ID like this: `/tea/details/1`. Pretty neat!

### Update the Teas page

The tea category detail route has been defined but our application has no idea how to navigate to it. So let's add the child page to the application's routing flow by navigating the user to the child page upon clicking one of the tea category cards.

Open `src/tea/list/TeaList.tsx`. Modify the `<IonCard>` component by adding the following props:

```TypeScript
...
<IonCard button onClick={() => showDetailsPage(tea.id)}>
...
```

The `button` prop which adds some styling to the card, making it behave in a "clickable" fashion.

Next let's define `showDetailsPage`. Add the following code below the `useIonViewWillEnter` block:

```TypeScript
const TeaList: React.FC = () => {
  ...
  const showDetailsPage = (id: number) => {
    history.push(`/tea/details/${id}`);
  }
  ...
};
export default TeaList;
```

#### Test First

#### Then Code

## The Tea Details Page

## Conclusion

In this lab, you added a child page and examined how stacked navigation works. In the next section we will look at adding a shared component to our project that we can then use on this page to rate the teas.
