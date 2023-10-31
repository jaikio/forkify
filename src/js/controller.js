import * as model from './model.js';
import { MODAL_CLOSE_SEC } from './config.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';

import 'core-js/stable';
import 'regenerator-runtime/runtime';

//TODO: hot module loading
if (module.hot) {
  module.hot.accept();
}

// https://forkify-api.herokuapp.com/v2

///////////////////////////////////////

const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);
    //hash is given as #5ed6604591c37cdc054bcd09, so we cut the #

    //no id would cause an endless load animation, so no id returns
    if (!id) return;
    recipeView.renderSpinner();

    //0 update results view to mark selected search results
    resultsView.update(model.getSearchResultsPage());

    //1) updating bookmarks view
    bookmarksView.update(model.state.bookmarks);

    //2) loading recipe from api
    await model.loadRecipe(id);

    //3) rendering recipe
    recipeView.render(model.state.recipe);
  } catch (err) {
    recipeView.renderError();
  }
};

const controlSearchResults = async function () {
  try {
    //1. get search query
    const query = searchView.getQuery();
    if (!query) return;
    resultsView.renderSpinner();

    //2. load search results
    await model.loadSearchResults(query);

    //3 render search results
    resultsView.render(model.getSearchResultsPage());

    //4 render initial pagination buttons
    paginationView.render(model.state.search);
  } catch (err) {
    throw err;
  }
};

const controlPagination = function (goToPage) {
  //1 render NEW results
  resultsView.render(model.getSearchResultsPage(goToPage));

  //2 render NEW pagination buttons
  paginationView.render(model.state.search);
};

const controlServings = function (newServings) {
  //update the recipe servings (in state)
  model.updateServings(newServings);
  //update the recipe view
  recipeView.update(model.state.recipe);
};

const controlAddBookmark = function () {
  //1. add remove bookmark

  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else {
    model.deleteBookmark(model.state.recipe.id);
    console.log(
      '👉this is the id we put in for comparison',
      model.state.recipe.id
    );
  }

  //2. update recipe view
  recipeView.update(model.state.recipe);
  console.warn('👉these are your bookmarks:', model.state.bookmarks);

  //3 render bookmarks
  bookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  try {
    //show loading spinner
    addRecipeView.renderSpinner();

    //upload to API
    await model.uploadRecipe(newRecipe);
    console.log(model.state.recipe);

    //render recipe
    recipeView.render(model.state.recipe);

    //display success message
    addRecipeView.renderMessage();

    //render bookmark view
    bookmarksView.render(model.state.bookmarks);

    //change ID in url
    window.history.pushState(null, '', `${model.state.recipe.id}`);
    // window.history.back();

    //close form
    setTimeout(function () {
      addRecipeView.togglewindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    console.log('🫡🫡🫡🫡 you stupid fuck', err);
    addRecipeView.renderError(err.message);
  }
};

const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
};
init();
