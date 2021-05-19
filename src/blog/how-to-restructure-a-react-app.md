# Restructuring a React Project

<keywords>react,javascript,colocation,structure,refactor</keywords>
<imageUrl>https://source.unsplash.com/95YRwf6CNw8</imageUrl>

__*Speeding up a growing app by changing the file structure.*__

## The Why

When I first joined the YouVersion team, I was tasked with working on a video content management system in need of some TLC. As I fixed bugs and added features, I realized it was difficult for me to understand how the components within the project logically worked together. The structure had become cluttered, with some components too similarly named, many of which could only be used inside specific components.

This is what it originally looked like:

```
src
├── assets
├── components
│   ├── app-search-bar
│   ├── collection-detail-row
│   ├── collection-detail-row-edit
│   ├── collection-head
│   ├── collection-row
│   ├── data-table
│   ├── detail-card
│   ├── drop-down
│   ├── error-snackbar
│   ├── image-file-input
│   ├── language-add
│   ├── language-panel
│   ├── language-selector
│   ├── nav-drawer
│   ├── pager
│   ├── publisher-add-language
│   ├── publisher-detail-row
│   ├── publisher-edit-language-row
│   ├── publisher-head
│   ├── publisher-row
│   ├── reference-edit
│   ├── reference-read
│   ├── search-bar
│   ├── search-select
│   ├── secondary-app-bar
│   ├── sign-in
│   ├── video-detail-card
│   ├── video-head
│   ├── video-row
│   ├── video-selector-list
│   │   └── video-selector-item
│   └── yv-app-bar
├── containers
│   ├── collection-add.js
│   ├── collection-detail.js
│   ├── collection-edit.js
│   ├── collection-list.js
│   ├── home.js
│   ├── publisher-add.js
│   ├── publisher-detail.js
│   ├── publisher-edit.js
│   ├── publisher-list.js
│   ├── signed-in-home.js
│   ├── video-add.js
│   ├── video-detail.js
│   └── video-list.js
└── utils
```

It became clear that it was time to restructure this React project so that the component tree could be quickly and easily visualized. 

## Beginning at the Beginning

Before starting, I tried to think through an automated process for this, so I relied on VS Code’s built-in auto-path-update tool. This turned out to be unreliable, so I resorted to manually updating file paths.

This is what that step-by-step process looked like:

1. Create new folders
1. Move files
1. Update relative paths within moved files
1. Search for references to the moved files, and update those paths
1. Run ESLint to check for `import/no-unresolved` errors
1. Git add/commit & push to remote repository

## Re-organizing the Container Structure

It was pretty easy to restructure the containers. Each object in our video API (publisher, video, collection) had a set of matching views: list, detail, add, and edit. It made sense to group each set of views together, and then put global containers (home, sign-in, etc.) together.

```
src/containers
├── collection
│   ├── collection-add.js
│   ├── collection-detail.js
│   ├── collection-edit.js
│   └── collection-list.js
├── home
│   ├── home.js
│   └── signed-in-home.js
├── publisher
│   ├── publisher-add.js
│   ├── publisher-detail.js
│   ├── publisher-edit.js
│   └── publisher-list.js
└── video
    ├── video-add.js
    ├── video-detail.js
    └── video-list.js
```

## Tackling the Component Structure

Here I needed to think through which components were used globally and locally, as well as what type of component it was and its function. I decided I would need a folder for layout components, another for UI components, and additional folders for container-specific components.

```
src/components
├── collection
│   ├── collection-detail-row
│   ├── collection-head
│   └── collection-row
├── layout
│   ├── data-table
│   ├── detail-card
│   ├── nav-drawer
│   ├── secondary-app-bar
│   └── yv-app-bar
├── publisher
│   ├── publisher-add-language
│   ├── publisher-add-language-row
│   ├── publisher-detail-row
│   ├── publisher-head
│   └── publisher-row
├── ui
│   ├── drop-down
│   ├── image-file-input
│   ├── language-selector
│   ├── pager
│   ├── search-bar
│   ├── search-select
│   └── sign-in
└── video
    ├── language-add
    ├── language-panel
    ├── reference-edit
    ├── reference-read
    ├── video-detail-card
    ├── video-head
    ├── video-row
    └── video-selector-list
        └── video-selector-item
```

## Changing From Containers to Views

After restructuring the components, each container-specific folder appeared at the same level as the global UI and layout folders. With the introduction of React hooks, it was pretty clear that the traditional container/component no longer fit our patterns. So, I decided to rename `containers` to `views` similar to other frameworks like Rails, because we were treating each of those as a unique page. and relocate the view-specific components closer to their respective views.

```
src/views
├── collection
│   ├── components
│       ├── collection-detail-row
│       ├── collection-head
│       └── collection-row
│   ├── collection-add.js
│   ├── collection-detail.js
│   ├── collection-edit.js
│   └── collection-list.js
```

## Testing

Once the project was structured the way I wanted it, I did one last project-wide lint check for `import/no-unresolved` errors. No linting errors were found for that rule, so I created a GitHub pull request, had a peer review the code, then merged it to the main branch.

## The Result

Overall, the cleaner folder structure makes it easy to quickly visualize how the app is put together. It also helps to more efficiently navigate the file tree in my code editor. Now if I need a component for a particular purpose, I know exactly where to find it. This new structure also encourages maintainability as the project grows and components and containers are added. 

```
src
├── assets
├── components
│   ├── layout
│   ├── ui
├── views
│   ├── collection
│       └── components
│   ├── home
│   ├── publisher
│       └── components
│   └── video
│       └── components
└── utils
```

_Have you implemented a similar system in your React projects or found a quicker way to update paths? Let me know, I’d love to discuss this topic with you!_