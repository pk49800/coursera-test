$(function () {
  $("#navbarToggle").blur(function (event) {
    var screenWidth = window.innerWidth;
    if (screenWidth < 768) {
      $("#collapsable-nav").collapse("hide");
    }
  });

  $("#navbarToggle").click(function (event) {
    $(event.target).focus();
  });
});

(function (global) {
  var dc = {};

  var homeHtml = "snippets/home-snippet.html";

  var allCategoriesUrl =
    "https://coursera-jhu-default-rtdb.firebaseio.com/categories.json";
  var cagtegoriesTitleHtml = "snippets/categories-title-snippet.html";
  var categoryHtml = "snippets/category-snippet.html";

  var menuItemsUrl =
    "https://coursera-jhu-default-rtdb.firebaseio.com/menu_items/";
  var menuItemsTitleHtml = "snippets/menu-items-title.html";
  var menuItemHtml = "snippets/menu-item.html";

  // insert innerHTML for selected element
  var insertHtml = function (selector, html) {
    var targetHtml = document.querySelector(selector, html);
    targetHtml.innerHTML = html;
  };

  //  Show loading icon inside element identified by 'selector'
  var showLoading = function (selector) {
    var html = "<div class='text-center'>";
    html += "<img src='images/ajax-loader.gif'></div>";
    insertHtml(selector, html);
  };

  // Return substitute of '{{propName}}' with propValue in given 'string'
  var insertProperty = function (string, propName, propValue) {
    var propToReplace = "{{" + propName + "}}";
    string = string.replace(new RegExp(propToReplace, "g"), propValue);
    return string;
  };

	// Remove the class "active" from home and switch to Menu button
	var switchMenuToActive = function () {
		var classes = document.querySelector("#navHomeButton").className;
		classes = classes.replace(new RegExp("active", "g"), "");
		document.querySelector("#navHomeButton").className = classes;

		// Add "active" to menu buttion if not already there
		classes = document.querySelector("#navMenuButton").className;
		if (classes.indexOf("active" == -1)) {
			classes += " active";
			document.querySelector("#navMenuButton").className = classes;
		}
	};

  // On page load before images or css
  document.addEventListener("DOMContentLoaded", function (event) {
    // On first load, show home view
    showLoading("#main-content");
    $ajaxUtils.sendGetRequest(
      homeHtml,
      function (responseText) {
        document.querySelector("#main-content").innerHTML = responseText;
      },
      false
    );
  });

  // Load the menu categories view
  dc.loadMenuCategories = function () {
    showLoading("#main-content");
    $ajaxUtils.sendGetRequest(allCategoriesUrl, buildAndShowCategoriesHTML);
  };

  // Builds HTML for the categories page based on the data from the server
  function buildAndShowCategoriesHTML(categories) {
    // Load title snippets of categories page
    $ajaxUtils.sendGetRequest(
      cagtegoriesTitleHtml,
      function (cagtegoriesTitleHtml) {
        // Retrieve single cagegories snippet
        $ajaxUtils.sendGetRequest(
          categoryHtml,
          function (categoryHtml) {
            var cagtegoriesViewHtml = buildCategoriesViewHtml(
              categories,
              cagtegoriesTitleHtml,
              categoryHtml
            );
            insertHtml("#main-content", cagtegoriesViewHtml);
          },
          false
        );
      },
      false
    );
  }

  function buildCategoriesViewHtml(
    categories,
    cagtegoriesTitleHtml,
    categoryHtml
  ) {
    var finalHtml = cagtegoriesTitleHtml;
    finalHtml += "<section class='row'>";

    // Loop over categories
    for (var i = 0; i < categories.length; i++) {
      // Insert category value
      var html = categoryHtml;
      var name = "" + categories[i].name;
      var short_name = categories[i].short_name;
      html = insertProperty(html, "name", name);
      html = insertProperty(html, "short_name", short_name);
      finalHtml += html;
    }
    finalHtml += "</section>";
    return finalHtml;
  }

  // Load the menu items view
  dc.loadMenuItems = function (categoryShort) {
    showLoading("#main-content");
    $ajaxUtils.sendGetRequest(
      menuItemsUrl + categoryShort + '.json',
      buildAndShowMenuItemsHTML
    );
  };

  // Builds HTML for the menu items page based on the data form the server
  function buildAndShowMenuItemsHTML(categoryMenuItems) {
    // Load title snippet of menu items page
    $ajaxUtils.sendGetRequest(
      menuItemsTitleHtml,
      function (menuItemsTitleHtml) {
				switchMenuToActive();
        // Retrieve single menu snippet∂
        $ajaxUtils.sendGetRequest(
          menuItemHtml,
          function (menuItemHtml) {
            var menuItemViewHtml = buildMenuItemsViewHtml(
              categoryMenuItems,
              menuItemsTitleHtml,
              menuItemHtml
            );
            insertHtml("#main-content", menuItemViewHtml);
          },
          false
        );
      },
      false
    );
  }

  function buildMenuItemsViewHtml(
    categoryMenuItems,
    menuItemsTitleHtml,
    menuItemHtml
  ) {
    menuItemsTitleHtml = insertProperty(
      menuItemsTitleHtml,
      "name",
      categoryMenuItems.category.name
    );
    menuItemsTitleHtml = insertProperty(
      menuItemsTitleHtml,
      "special_instructions",
      categoryMenuItems.category.special_instructions
    );

		var finalHtml = menuItemsTitleHtml;
		finalHtml += "<section class='row'>";

		// Loop over menu items
		var menuItems = categoryMenuItems.menu_items;
		var catShortName = categoryMenuItems.category.short_name;
		for (var i = 0; i < menuItems.length; i++) {
			// Intert menu item values
			var html = menuItemHtml;
			html = insertProperty(html, "short_name", menuItems[i].short_name);
			html = insertProperty(html, "catShortName", catShortName);
			html = intertItemsPrice(html, "price_small", menuItems[i].price_small);
			html = intertItemsPrice(html, "price_large", menuItems[i].price_large);
			html = insertItemPortionName(html, "small_portion_name", menuItems[i].small_portion_name);
			html = insertItemPortionName(html, "large_portion_name", menuItems[i].large_portion_name);
			html = insertProperty(html, "name", menuItems[i].name);
			html = insertProperty(html, "description", menuItems[i].description);
			
			//  Add clearfix after every second menu item
			if (i % 2 != 0) {
				html += "<div class='clearfix visible-md-block visible-lg-block'></div>";
			}

			finalHtml += html;
		}
		finalHtml += "</section>";
		return finalHtml;
  }

	// Appends price with '$' if price exists
	function intertItemsPrice(html, priceProName, priceValue) {
		// If not specified, replace with empty string
		if (!priceValue) {
			return insertProperty(html, priceProName, "");
		}
		priceValue = "$" + priceValue.toFixed(2);
		html = insertProperty(html, priceProName, priceValue);
		return html;
	}
	// Appends portion name in parens if it exists
	function insertItemPortionName(html, portionPropName, portionValue) {
		// If not specified, replace with empty string
		if (!portionValue) {
			return insertProperty(html, portionPropName, "");
		}
		portionValue = "(" + portionValue + ")";
		html = insertProperty(html, portionPropName, portionValue);
		return html;
	}

  global.$dc = dc;
})(window);
