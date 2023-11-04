# react-rx-bindings

A small, reactive, MVVM library with no dependencies. Only peer dependencies are 

`react` +16.8.0 and 

`rxjs` +5.0.0

# Features

* Small and lightweight.
* Separates business logic from UI code using MVVM.
* Focus on managing individual components, not the entire application.
* UI can be derived from local state.
* Plays nice with `Redux` and other state management libraries.

# Installation

The easiest way to install is with npm.

`npm i react-rx-bindings`

The entire implementation is in `index.ts` so you can also just copy and paste the code into your project if you do not want
to use npm.

# Usage

If you have not used [RxJS](https://rxjs.dev/) before, it's probably a good idea to take a look at their 
[Getting Started](https://rxjs.dev/guide/overview) guide.

### Hello World - the View Model

```typescript

class HelloWorldViewModel extends ReactRxBindingViewModel<void> {
    public readonly name: BehaviorSubject<string> = new BehaviorSubject<string>("World");
    public readonly greeting: Observable<string> = this.name.pipe(map(name => `Hello ${name}!`));
}

```
