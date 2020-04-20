import axios from 'axios';
import {key} from '../config'

export default class Recipe{
    constructor(id) {
        this.id = id;
    }

    async getRecipe() {
        try {
            const res = await axios(`https://api.spoonacular.com/recipes/${this.id}/information?apiKey=${key}&includeNutrition=false`);
            this.title = res.data.title;
            this.author = res.data.sourceName;
            this.img = res.data.image;
            this.url = res.data.sourceUrl;
            this.ingredients = this.parseIngredients(res.data.extendedIngredients);
            this.time = res.data.readyInMinutes;
            this.servings = res.data.servings;

        } catch(err) {
            console.log(err);
            alert('something went wrong');
        }
    }

    parseIngredients(ingredients) {
        return ingredients.map(result => {
            return {count: Math.round(result.measures.metric.amount),unit: result.measures.metric.unitShort,name: result.name};
        });
    }

    updateServings(type) {
        //Servings
        const newServings = type === 'dec' ? this.servings - 1 : this.servings + 1;

        //ingredients
        this.ingredients.forEach(ing => {
            if (ing.count === 1) {
                ing.count = (ing.count * (newServings / this.servings)) + 0.1;
            } else {
                ing.count *=  (newServings / this.servings);
            }
       
        });

        this.servings = newServings;

    }
}
