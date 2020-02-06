var budgetController = (function() {
    
    // COnstructors
    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    
    Expense.prototype.calculatePercentage = function() {
        if (data.totals.inc > 0)
            this.percentage = Math.round(this.value / data.totals.inc * 100);
//        console.log(this.percentage);
    };
    
    Expense.prototype.getPercentage = function() {
        return this.percentage;
    };

    var Income = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    };
    
    var calculateTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function(cur) {
            sum += cur.value;
        });
        data.totals[type] = sum;
    };
    
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
            
            // ID = last item's ID + 1
            if (data.allItems[type].length > 0)
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            else
                ID = 0;
            
            
            // Create the new item
            if (type === 'exp')
                newItem = new Expense(ID,des,val);
            else if (type === 'inc')
                newItem = new Income(ID, des, val);
            
            // push into data
            data.allItems[type].push(newItem);
            
            // return new item
            return newItem;
        },
        
        deleteItem: function(type, ID) {
            var index, Ids;
            
//            Find index of given ID by listing all ids in hand
            Ids = data.allItems[type].map(function(current) {
                return current.id;
            });
            index = Ids.indexOf(ID);
            
            if (index !== -1)
                data.allItems[type].splice(index,1);
//            console.log(data.allItems[type]);
        },
        
        calculateBudget: function() {
            
            // calculate total income and expense
            calculateTotal('exp');
            calculateTotal('inc');
            
            // calculate net 
            data.budget = data.totals.inc - data.totals.exp;
            
            // calculate percentage income spent
            if (data.totals.inc > 0)
                data.percentage = Math.round(data.totals.exp / data.totals.inc * 100);
        },
        
        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },
        
        calculatePercentages: function() {
            data.allItems.exp.forEach(function(cur) {
                cur.calculatePercentage();
//                console.log(cur.percentage);
            });
        },
        
        getPercentages: function() {
            var allPerc = data.allItems.exp.map(function(cur) {
                return cur.getPercentage();
            });
            return allPerc;
        },
        
        testing: function() {
            console.log(data);
        }
    }
    
})();

var UIController = (function() {
    
    var DOMstrings = {
        inputType: '.add__type',
        inputDesc: '.add__description',
        inputValue: '.add__value',
        inputButton: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };
    
    // Private function for formatting number
    var formatNumber = function(num, type) {
        var numSplit, int, dec, sign;
        /*
        +/- sign, 2 decimal, comma separating thousands
        */

        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');
        int = numSplit[0];
        dec= numSplit[1];

        if(int.length > 3) {
            int = int.substr(0,int.length - 3) + ',' + int.substr(int.length - 3, 3);
        }
        console.log(type);
        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
    };
    
    // Following is to iterate through a node (element) array. callback function is described when calling
    var forEachNodes = function(list,callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };
    
    // Make all the following functions public
    return {
        getInput: function() {
            return {
                type : document.querySelector(DOMstrings.inputType).value, // inc or exp
                description : document.querySelector(DOMstrings.inputDesc).value,
                value : parseFloat(document.querySelector(DOMstrings.inputValue).value)            
            };
        },
        
        addListItem: function(obj, type) {
            var html, newHtml, element;
            // Create HTML string with placeholder text
            if (type === 'inc') {
                element = DOMstrings.incomeContainer;
                
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            
            else if (type === 'exp') {
                element = DOMstrings.expenseContainer;
                
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
                
            }
            
            // replace placeholder with data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
            
            // Insert HTML
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },
        
        delListItem: function(itemID) {
            var el = document.getElementById(itemID);
            
            // Do this since you can only remove child (instead of directly remove)
            el.parentNode.removeChild(el);
        },
        
        clearFields: function() {
            var fields, fieldsArr;
            fields = document.querySelectorAll(DOMstrings.inputDesc + ',' + DOMstrings.inputValue);
            // turn into array
            fieldsArr = Array.prototype.slice.call(fields);
            fieldsArr.forEach(function(current, i, arr) {
                current.value = "";
            });
            
            // bring cursor back to description field
            fieldsArr[0].focus()
            
        },
        
        displayBudget: function(obj) {
            var type;
            obj.budget >= 0 ? type = 'inc' : type = 'exp';
        
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expenseLabel).textContent = formatNumber(obj.totalExp, 'exp');
            if (obj.totalInc > 0)
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + "%";
            else 
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
        },
        
        displayPercentages: function(percentages) {
            var fields = document.querySelectorAll(DOMstrings.expPercLabel);
            
            


            
//            callback is described here
            forEachNodes(fields, function(current, index) {
               if (percentages[index] > 0) 
                   current.textContent = percentages[index] + "%";
                else current.textContent = "---"; 
            });
        },
        
        displayMonth: function() {
            var now, year, month, months;
            now = new Date();
            year = now.getFullYear();
            
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            month = months[now.getMonth()];
            document.querySelector(DOMstrings.dateLabel).textContent = month + ' ' + year;
            
        },
        
        changedType: function() {
            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDesc + ',' +
                DOMstrings.inputValue);
            
            forEachNodes(fields, function(cur) {
                cur.classList.toggle('red-focus');
            });
            
            document.querySelector(DOMstrings.inputButton).classList.toggle('red');
            
        },
        
        // make domstrings public
        getDOMstrings : function() {
            return DOMstrings;
        }
    };
    

    
    
})();

var controller = (function(budgetCtrl, UICtrl) {
    
    var setupEventListeners = function() {
        var DOM = UICtrl.getDOMstrings();
        
        document.querySelector(DOM.inputButton).addEventListener('click', function() {
            ctrlAddItem();
        });
        


        document.addEventListener('keypress', function(event) {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });    
        
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
        
        
    }
    
    var updateBudget = function() {
        
        // 1. Calculate budget
        budgetCtrl.calculateBudget();
        
        // 2. Return budget
        var budget = budgetCtrl.getBudget();
        
        // 3. Display budget on UI
        UICtrl.displayBudget(budget);
    }
    
    var updatePercentages = function() {
        
        // 1. Calculate percentages
        budgetCtrl.calculatePercentages();
        
        // 2. Read percentages
        var percentages = budgetCtrl.getPercentages();
        console.log(percentages);
        
        // 3. Display UI
        UICtrl.displayPercentages(percentages);
    }
    
    var ctrlAddItem = function() {
        
        var input, newItem;
        
        // 1. Get input data
        input = UICtrl.getInput();
        
        if(input.description !== "" && !isNaN(input.value) && input.value > 0) {
            // 2. Add to budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // 3. Display UI
            UICtrl.addListItem(newItem, input.type);

            // 4. Clear fields
            UICtrl.clearFields();
            
            // 5. Calculate and update budget
            updateBudget();
            
            // 6. Update percentages
            updatePercentages();
        }
        
    };
    
    var ctrlDeleteItem = function(event) {
        var itemID, splitID, type, index;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if (itemID) {
            console.log(itemID);
            splitID = itemID.split('-');
            type = splitID[0];
            index = splitID[1];
        
            // 1. Delete from data structure
            budgetCtrl.deleteItem(type,parseInt(index));
            
            // 2. Delete from UI
            UICtrl.delListItem(itemID);
            
            // 3. Update new budget
            updateBudget();
            
            // 4. Update percentages
            updatePercentages();
        }
    };
    
    return {
        init: function() {
            console.log('Application has started');
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
        });
            setupEventListeners();
        }
    };
    

})(budgetController, UIController);

controller.init();