import {elements} from './base';
export const getInput = () => elements.searchInput.value;

export const clearInput = () => {
    // clear search box after searches
    elements.searchInput.value = "";
};

export const limitRecipeTitle = (title, limit = 17) => {
    const newTitle = [];
    if (title.length > limit) {
        title.split(' ').reduce((acc,cur) => {
            if (acc + cur.length < limit) {
                newTitle.push(cur);
            }
            return acc + cur.length;
        },0);
        return `${newTitle.join(' ')} ...`;
    }
    return title;
};

export const clearSearch = () => {
    elements.searchList.innerHTML = '';
    elements.searchResPages.innerHTML = '';
};

export const highLightSelected = id => {
    const resultsArr = Array.from(document.querySelectorAll('.results__link'));
    resultsArr.forEach(el => {el.classList.remove('results__link--active')}); 

    document.querySelector(`.results__link[href*="${id}"]`).classList.add('results__link--active');
}



const renderRecipe = recipe => {
    const markup = `
        <li>
            <a class="results__link" href="#${recipe.id}">
                <figure class="results__fig">
                    <img src="https://spoonacular.com/recipeImages/${recipe.id}-240x150.jpg" alt="Test">
                </figure>
                <div class="results__data">
                    <h4 class="results__name">${limitRecipeTitle(recipe.title)}</h4>
                    <p class="results__author">Servings: ${recipe.servings}</p>
                </div>
            </a>
        </li>
    `;
    elements.searchList.insertAdjacentHTML('beforeend', markup);

};

const createButton = (page, type) => `
    <button class="btn-inline results__btn--${type}" data-move="${type === "prev" ? page - 1: page + 1}">
    <span>Page ${type === "prev" ? page - 1: page + 1}</span>
    <svg class="search__icon">
        <use href="img/icons.svg#icon-triangle-${type === "prev" ? 'left':'right'}"></use>
    </svg>
    </button>
`;

const renderButtons = (page, numResults, resPerPage) => {
    const pages = Math.ceil(numResults/resPerPage);
    let button;
    if (page === 1 && pages > 1) {
        // only button to next page
        button = createButton(page, 'next');
    } else if (page < pages) {
        // both buttons
        button = `
            ${createButton(page, 'prev')}
            ${createButton(page, 'next')} 
        `;

    }else if (page === pages && pages > 1) {
        // only button to previous page
        button = createButton(page, 'prev');
    }
    
    elements.searchResPages.insertAdjacentHTML('afterbegin', button);
}


export const renderResults = (recipes, page = 1, resPerPage = 10) => {
    // render number of results in a page
    if (recipes.length !== 0) {
        const start = (page - 1) * resPerPage;
        const end = page * resPerPage;
        recipes.slice(start,end).forEach(renderRecipe);

        // render buttons to navigate results
        renderButtons(page, recipes.length, resPerPage);

    } else {
        throw new Error('no search result found');
    }
    
};

