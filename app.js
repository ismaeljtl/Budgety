// budget controller
var budgetController = (function() {

	var Expense = function(id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
		
		// como esta propiedad no esta definida desde un principio
		// le asignamos el valor de -1
		this.percentage = -1;
	};

	// funcion que estara en el proto del objeto
	Expense.prototype.calcPercentage = function(totalIncome) {
		if(totalIncome > 0) {
			this.percentage = Math.round((this.value / totalIncome) * 100);
		} else {
			this.percentage = -1;
		}
	};

	Expense.prototype.getPercentage = function() {
		return this.percentage;
	};

	var Income = function(id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
	};

	function calculateTotal(type) {
		var sum = 0;
		data.allItems[type].forEach(function(element) {
			sum += element.value;
		});
        
		data.totals[type] = sum;
	}

	var data = {
		allItems: {
			exp: [],
			inc: []
		},
		totals: {
			exp: 0,
			inc: 0
		}, 
		budget: 0, 
		percentage: -1
	};

	return { 
		addItem: function(type, des, val) {
			var newItem, ID;
            
			// create new id
			if (data.allItems[type].length > 0) {
				ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
			} else {
				ID = 0;
			}

			// create new item
			if (type === "exp") {
				newItem = new Expense(ID, des, val);
			} else if (type === "inc") {
				newItem = new Income(ID, des, val);
			}

			// push it to the data structure
			data.allItems[type].push(newItem);
            
			// return the new element
			return newItem;
		}, 

		deleteItem: function(type, id) {
			var ids, index;

			// map returns a new array
			ids = data.allItems[type].map(function(current){
				return current.id;
			});

			// indexOf returns the index of the element passed as argument
			index = ids.indexOf(id);

			if (index !== -1) {
				// splice: to remove elements of an array
				data.allItems[type].splice(index, 1);
			}

		},

		calculateBudget: function() {

			// calculate total income and expenses 
			calculateTotal("exp");
			calculateTotal("inc");

			// calculate the budget: incomes - expenses
			data.budget = data.totals.inc - data.totals.exp;

			// calculate the percentage of income that we spent
			if (data.totals.inc > 0) {
				data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
			} else {
				data.percentage = -1;
			}
            
		},

		getBudget: function() {
			return {
				budget: data.budget, 
				totalInc: data.totals.inc, 
				tatalExp: data.totals.exp, 
				percentage: data.percentage
			};
		},

		calculatePercentages: function() {
			data.allItems.exp.forEach(function(element) {
				element.calcPercentage(data.totals.inc);
			});
		},

		getPercentages: function() {
			// aqui usamos map porque map retorna un array, foreach no lo hace
			var allPercentages = data.allItems.exp.map(function(element) {
				return element.getPercentage();
			});

			return allPercentages;
		}
	};

})();


// ui controller
var uiController = (function() {

	var DOMstrings = {
		inputType: ".add__type", 
		inputDescription: ".add__description",
		inputValue: ".add__value",
		inputBtn: ".add__btn", 
		incomeContainer: ".income__list",
		expensesContainer: ".expenses__list",
		budgetLabel: ".budget__value",
		incomeLabel: ".budget__income--value",
		expensesLabel: ".budget__expenses--value", 
		percentageLabel: ".budget__expenses--percentage",
		container: ".container",
		expensesPercLabel: ".item__percentage",
		dateLabel: ".budget__title--month"
	};

	function formatNumber(number, type) {
		// En el video hacen todo esto

		// var numSplit, int, dec;
		/** Example:
		 * + or - before decimal points
		 * exactly 2 decimal points
		 * comma separating the thousands
		 * 
		 * 2310 = + 2.310,00
		 */

		// number = Math.abs(number);
		// // toFixed es una funcion del objeto Number
		// // sirve para que el numero quede con 2 decimales
		// number = number.toFixed(2);
		
		// numSplit = number.split(".");
		// int = numSplit[0];
		// dec = numSplit[1];
	
		// int = int.toLocaleString();
		// console.log(number.toLocalString());
		//return (type === "exp" ? "-" : "+") + " " + int + "." + dec;



		// Yo logre hacerlo en dos lineas!
		// toFixed() convierte a string el numero con la cantidad de decimales especificados
		// como devuelve un string lo debo parsear a Flotante
		// y ya despues puedo usar el metodo toLocaleString() que formatea el numero de una vez.
		number = parseFloat((number).toFixed(2)).toLocaleString();
		return (type === "exp" ? "-" : "+") + " " + number;
	}

	function nodeListForEach(List, callback) {
		// MINDBLOWING! Analizar el siguiente codigo.
		// creamos una funcion que lo que hace es llamar en un for a 
		// una funcion llamada "callback" pasandole 2 parametros: el valor 
		// actual y el indice. Esto lo usamos abajo para obtener acceso a 
		// los elementos de NodeList pues NodeList no posee foreach!!!
		// Esto es super poderoso!

		for (var i=0; i<List.length; i++) {
			callback(List[i], i);
		}
	}

	return {
		getInput: function() {
			return {
				type: document.querySelector(DOMstrings.inputType).value,
				description: document.querySelector(DOMstrings.inputDescription).value,
				value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
			};
		},

		addListItem: function(obj, type) {
			var html, newHtml, element, div;

			// si no se crea un elemento con document da error.
			div = document.createElement("div");
            
			// create html string with placeholder text
			if (type === "inc") {
				element = DOMstrings.incomeContainer;

				html = "<div class=\"item clearfix\" id=\"inc-%id%\"> <div class=\"item__description\">%description%</div> <div class=\"right clearfix\"> <div class=\"item__value\">%value%</div> <div class=\"item__delete\"> <button class=\"item__delete--btn\"><i class=\"ion-ios-close-outline\"></i></button> </div> </div> </div>";
			} else if (type === "exp"){
				element = DOMstrings.expensesContainer;
                
				html = "<div class=\"item clearfix\" id=\"exp-%id%\"> <div class=\"item__description\">%description%</div> <div class=\"right clearfix\"> <div class=\"item__value\">%value%</div> <div class=\"item__percentage\">21%</div> <div class=\"item__delete\"> <button class=\"item__delete--btn\"><i class=\"ion-ios-close-outline\"></i></button> </div> </div> </div>";
			}

			// replace the placeholder text with data
			newHtml = html.replace("%id%", obj.id);
			newHtml = newHtml.replace("%description%", obj.description);
			newHtml = newHtml.replace("%value%", formatNumber(obj.value, type));            

			// finalmente agrego el html a la variable div
			div.innerHTML = newHtml;
            
			// we insert the html into the dom
			document.querySelector(element).insertAdjacentElement("beforeend", div);

		},

		deleteListItem: function(selectorId) {
			// en JS no se eliminan elementos, se eliminan hijos
			// por lo que para eliminar un elemento debemos movernos 
			// al elemento padre y luego eliminar al hijo

			var element = document.getElementById(selectorId);
			element.parentNode.removeChild(element);
		},

		clearFields: function() {
			var fields, fieldsArray;
            
			fields = document.querySelectorAll(DOMstrings.inputDescription + ", " + DOMstrings.inputValue);
            
			// converting a list (because querySelectorAll returns a list) to an array 
			fieldsArray = Array.prototype.slice.call(fields);
            
			// en el foreach puedo usar tres elementos: .forEach(valorActual, index, array)
			fieldsArray.forEach(function(currentVal, index, array) {
				currentVal.value = "";
			});

			// set focus on first element of array
			fieldsArray[0].focus();
		},

		getDOMStrings: function() {
			return DOMstrings;
		}, 

		// La funcion mas arrecha de todo el codigo!
		displayPercentages: function(percentages) {
			// querySelector solo selecciona el primero.
			// querySelectorAll selecciona a todos los que tengan la clase indicada
			var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);
			
			// // MINDBLOWING! Analizar el siguiente codigo.
			// // creamos una funcion que lo que hace es llamar en un for a 
			// // una funcion llamada "callback" pasandole 2 parametros: el valor 
			// // actual y el indice. Esto lo usamos abajo para obtener acceso a 
			// // los elementos de NodeList pues NodeList no posee foreach!!!
			// // Esto es super poderoso!
			// function nodeListForEach(List, callback) {
			// 	for (var i=0; i<List.length; i++) {
			// 		callback(List[i], i);
			// 	}
			// }

			nodeListForEach(fields, function(element, index) {
				if (percentages[index] > 0) {
					element.textContent = percentages[index] + "%"; 
				} else {
					element.textContent = "---";
				}
			});

		}, 

		displayBudget: function(obj) {
			var type; 

			obj.budget > 0 ? type = "inc" : type = "exp";

			document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
			document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, "inc");
			document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.tatalExp, "exp");
            
			if (obj.percentage > 0) {
				document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + "%";
			} else {
				document.querySelector(DOMstrings.percentageLabel).textContent = "---";                
			}

		},

		displayMonth: function() {
			var now, year, month, months;

			now = new Date();
			year = now.getFullYear();
			month = now.getMonth();
			months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

			document.querySelector(DOMstrings.dateLabel).textContent = months[month] + " of " + year;
		}, 

		changedType: function() {
			var fields;
			
			fields = document.querySelectorAll(
				DOMstrings.inputType + "," + 
				DOMstrings.inputDescription + "," + 
				DOMstrings.inputValue
			);

			nodeListForEach(fields, function(element){ 
				// toggle agrega la clase cuando no esta ahi y la elimina cuando esta ahi.
				element.classList.toggle("red-focus");
			});

			document.querySelector(DOMstrings.inputBtn).classList.toggle("red");
		}
	};

})();


// global app controller
var controller = (function(budgetCtrl, uiCtrl) {

	var input, newItem;

	function setupEventListeners() {
		var DOM = uiCtrl.getDOMStrings();
        
		document.querySelector(DOM.inputBtn).addEventListener("click", ctrlAddItem);
        
		document.addEventListener("keypress", function(event) {
			if ( event.key === "Enter" || event.which === 13) {
				ctrlAddItem();
			}
		});

		document.querySelector(DOM.container).addEventListener("click", ctrlDeleteItem);
	
		document.querySelector(DOM.inputType).addEventListener("change", uiCtrl.changedType);
	}

	function updateBudget() {
		var budget;

		// 1. calculate the budget
		budgetCtrl.calculateBudget();

		// 2. Return the budget
		budget = budgetCtrl.getBudget();

		// 3. display the budget on the UI
		uiCtrl.displayBudget(budget);
	}

	function updatePercentages() {
		var percentages;
		
		// 1. calculate percentages
		budgetCtrl.calculatePercentages();

		// 2. read percentages from the budgetController
		percentages = budgetCtrl.getPercentages();

		// 3. update UI with new percentages
		uiCtrl.displayPercentages(percentages);
	}

	// los eventListeners siempre tienen acceso al parametro event
	function ctrlDeleteItem(event) {
		var itemId;
        
		// event.target me da el nodo de elementos padre del elemento. Por lo que podemos ver a sus padres.
		// esto se llama "traversing"
		itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;

		if (itemId) {
			var splitId, type, id;

			// inc-1
			splitId = itemId.split("-");
			type = splitId[0];
			id = parseInt(splitId[1]);

			// 1. delete the item from the data structure
			budgetCtrl.deleteItem(type, id);

			// 2. delete the item from the ui
			uiCtrl.deleteListItem(itemId);
            
			// 3. update and show the new budget
			updateBudget();

			// 4. calculate and update percentages
			updatePercentages();
		}
	}

	function ctrlAddItem() {
		// 1. get the field input fata
		input = uiCtrl.getInput();

		if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
			// 2. add the item to the budget controller
			newItem = budgetCtrl.addItem(input.type, input.description, input.value);

			// 3. add the new item to the UI
			uiController.addListItem(newItem, input.type);

			// 4 Clear the fields
			uiCtrl.clearFields();

			// 5. Calculate and update budget
			updateBudget();

			// 6. calculate and update percentages
			updatePercentages();
		}

	}

	return {
		init: function() {
			setupEventListeners();
			uiCtrl.displayMonth();
			uiCtrl.displayBudget({
				budget: 0, 
				totalInc: 0, 
				tatalExp: 0, 
				percentage: -1
			});
		}
	};

})(budgetController, uiController);

// run the initializer
controller.init();