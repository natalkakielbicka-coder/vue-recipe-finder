# Recipe Finder

A recipe discovery application built with Vue 3 and TheMealDB API.

Users can search for recipes by name or ingredient, browse categories, save favorites, view recently visited recipes and explore detailed recipe information.

## Features

- Search recipes by name
- Search recipes by ingredient
- Search suggestions with keyboard navigation
- Browse recipes by category
- Filter recipes by category and cuisine
- Pagination synchronized with the URL
- Browser Back / Forward navigation support
- Recipe details with ingredients and instructions
- Copy ingredients to clipboard
- Recipe source and YouTube video
- Similar recipes
- Favorite recipes stored in localStorage
- Recently viewed recipes stored in localStorage
- Toast notifications
- Random recipe discovery
- Responsive layout
- Loading skeletons

## Tech Stack

- Vue 3
- Vue Router
- Composition API
- JavaScript
- TheMealDB API
- CSS
- localStorage
- Clipboard API

## Project Structure

The application was refactored into reusable components and composables.

### Components

- `RecipeSearch`
- `CategoryBrowser`
- `RecipeFilters`
- `RecipeGrid`
- `RecipeCard`
- `RecipePagination`
- `RecentlyViewedRecipes`
- `RecipeSkeleton`
- `ToastMessage`

### Composables

- `useRecipeSearch`
- `useRecipeFilters`
- `usePagination`
- `useIngredients`
- `useNameSuggestions`
- `useRecipeCategories`
- `useFavorites`
- `useRecentlyViewed`
- `useToast`

## What I Learned

While building this project I practiced:

- Vue reactivity with `ref` and `computed`
- component communication using props and emits
- custom `v-model`
- reusable composables
- asynchronous API requests
- Vue Router and URL state synchronization
- watching route changes with `watch`
- working with localStorage
- keyboard-accessible search suggestions
- handling loading and empty states
- refactoring a large view into smaller components and composables

## API

Recipe data is provided by [TheMealDB](https://www.themealdb.com/).

## Project Setup

```bash
npm install
```
