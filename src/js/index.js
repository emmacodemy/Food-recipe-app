
import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import Likes from './models/Likes';
import {elements,renderLoader, clearLoader} from './views/base';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesView';
/**
 Global state of the app
 *--Search object
 *--Current recipe object
 *--shopping list object
 *--liked object
 **/ 
const state = {};

const controlSearch = async () => {
    //1) Get query from view
    const query = searchView.getInput(); //Todo

    if (query) {
        // clear previous searh
        // 2) new search object and add to state
        state.search = new Search(query);

        // 3) prepare UI for results
        searchView.clearInput();
        searchView.clearSearch();
        renderLoader(elements.searchRes);
        // state.search = {};

        try {
            // 4) search for recipe
            await state.search.getResults();


            //5) render results in the ui
            clearLoader();
            searchView.renderResults(state.search.recipes);
        } catch(err){
            console.log(err);
            clearLoader();
        }
        

    }
};


elements.searchForm.addEventListener('submit', e => {
    e.preventDefault();
    controlSearch();
});

elements.searchResPages.addEventListener('click', e => {
    const btn = e.target.closest('.btn-inline');
    if (btn) {
        const goToPage = parseInt(btn.dataset.move);
        searchView.clearSearch();
        searchView.renderResults(state.search.recipes, goToPage);
        
    }
});

/*
Recipe Controller
*/ 

const controlRecipe = async () => {
    const id = window.location.hash.replace('#','');

    if (id) {
        // prepare ui for changes
        recipeView.clearRecipe();
        renderLoader(elements.recipePage);

        //highlight selected recipe
        if (state.search) searchView.highLightSelected(id);

        // create new recipe
        state.recipe = new Recipe(id);

        try {
            // get recipe data
            await state.recipe.getRecipe();

            //render recipe
            clearLoader();
            recipeView.renderRecipe(state.recipe);
            //if recipe has been liked
            if ( state.likes && state.likes.isLiked(id)) {
                likesView.toggleLikeBtn(true);
            }
        } catch(err) {
            console.log(err);
            clearLoader();
        }

        
    }
};

['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));

/*
**LIST CONTROLLER
*/ 

const controlList = () => {
    //Create a new list IF there is none yet
    if (!state.list) state.list = new List();
    //add ingredient to list and ui
    state.recipe.ingredients.forEach(el => {
        const item = state.list.addItem(el.count, el.unit, el.name);
        listView.renderItem(item);
    });

};

/*
**Likes CONTROLLER
*/ 

const controlLikes = () => {
    // if likes has not been created
    if (!state.likes) state.likes = new Likes();
    const currentId = state.recipe.id;

    if (!state.likes.isLiked(currentId)) {
        //add like to state
        const like = state.likes.addLike(currentId, state.recipe.title,state.recipe.author,state.recipe.img);

        //signify like on ui
        likesView.toggleLikeBtn(true);

        // add like to like ui list
        likesView.renderLike(like);

    } else {
        //remove like from state
        state.likes.deleteLike(currentId);

        //signify removal on ui
        likesView.toggleLikeBtn(false);

        // remove like from like ui list
        likesView.deleteLike(currentId);
    }

    likesView.toggleLikeMenu(state.likes.getNumLikes());

}

//handle delete and update list items 
elements.shopping.addEventListener('click', e => {
    const id = e.target.closest('.shopping__item').dataset.itemid;
    
    if (e.target.matches('.shopping__delete,.shopping__delete *')) {
        //delete from data structure
        state.list.deleteItem(id);
        //delete from ui
        listView.deleteItem(id);
    } else if (e.target.matches('.shopping__count-value')) {
        const value = parseFloat(e.target.value,10);

        state.list.updateCount(id,value);
    }

});

// handle saving of likes on reload
window.addEventListener('load', () => {
    state.likes = new Likes();

    state.likes.readStorage();

    likesView.toggleLikeMenu(state.likes.getNumLikes());

    state.likes.likes.forEach(like => {
        likesView.renderLike(like);
    });
});

//handling recipe button clicks
elements.recipePage.addEventListener('click', e => {
    if (e.target.matches('.btn-decrease, .btn-decrease *')) {
        
        if (state.recipe.servings > 1) {
            //update state of recipe
            state.recipe.updateServings('dec');

            //update recipe ui
            recipeView.updateRecipe(state.recipe);
        }     
    } else if (e.target.matches('.btn-increase, .btn-increase *')) {
        //update state of recipe
        state.recipe.updateServings('inc');

        //update recipe ui
        recipeView.updateRecipe(state.recipe);
    } else if (e.target.matches('.recipe__btn-add, .recipe__btn-add *')) {
        controlList();
    } else if (e.target.matches('.recipe__love, .recipe__love *')) {
        controlLikes();
    }
});










