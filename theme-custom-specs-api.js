/** 
* @author william muller <william.muller@chaordicsystems.com>
* @version 1.0
* Default Structure necessary from work correctly of component
	* Constructor custom spec
	*
	* values to config:
	*	scope: {}, -- mandatory --
	*	productView: {}, -- mandatory --
	*	jqItem: {}, -- mandatory --
	*	visibleElements: -1, -- optional --
	*	-- All extras is optional -- 
	*	extras: {
	*		visibleElements: -1,
	*		itemsPerMove: 1,
	*		duration: 1000,
	*		infinitLoop: false,
	*		hideUnavailables: true,
	*		showSolitarySpec: true,
	*		showOnlySpecs: false,
	*		title: true
	*	}
	*
	*	productView.availableSpecs = {
	*		"Color": {
	*			"BLANCO": {
	*			"label": "BLANCO",
	*			"status": "available",
	*			"urlImage": "http://cuerosvelez.vteximg.com.br/arquivos/BLANCO.jpg"
	*			}
	*		},
	*		"Talla": {
	*			"39": {
	*			"label": "39",
	*			"status": "available",
	*			"htmlImage": "<div style=\"width: 100%; height: 100%;\">39</div>",
	*			"dependentOn": {
	*				"Brandy": "Brandy",
	*				"Azul": "Azul"
	*			}
	*		}
	*	}
**/

(function () {
	var CustomSpecFeature = function (config) {
		var $ = this.$ = chaordic.lib.jQuery;
		config = $.extend(true, {
			scope: {},
			productView: {},
			jqItem: {},
			extras: {
				visibleElements: -1,
				itemsPerMove: 1,
				duration: 1000,
				infinitLoop: false,
				hideUnavailables: true,
				showSolitarySpec: true,
				showOnlySpecs: false,
				title: true,
				disableDynamicHtml: false
			}
		}, config);

		/* elements mandatory */
		if (Object.keys(config.scope).length === 0 || Object.keys(config.productView).length === 0 || Object.keys(config.jqItem).length === 0 || config.jqItem.find('.custom-specs').length === 0 || !config.productView.skuList) {
			return false;
		}
		/*Global variables to this scope */
		var duration = config.extras.duration;
		var element = config.jqItem;
		var jqItemId = config.jqItem.attr("data-productid");
		var itemsPerMoveLastAction =
			(config.scope.CustomSpecObj && config.scope.CustomSpecObj.itemsPerMoveLastAction) || config.extras.itemsPerMove;
		var typeSpecContainer = null;
		var specCarousel,
			listSpec,
			first,
			last,
			widthSpecCarousel,
			widthListSpec,
			arrowPrev,
			arrowNext,
			distance,
			prevProp,
			nextProp,
			widthItem;

		(function initialSetup() {
			if (!config.scope.CustomSpecObj) {
				config.scope.CustomSpecObj = {
					positionActiveSpec: {},
					itemsPerMoveLastAction: config.extras.itemsPerMove
				};
				config.scope.CustomSpecObj.positionActiveSpec["id" + jqItemId] = {};
			} else if (!config.scope.CustomSpecObj.positionActiveSpec["id" + jqItemId]) {
				config.scope.CustomSpecObj.positionActiveSpec["id" + jqItemId] = {};
			}
			
			/* Create dynamicHtml and show specs */
			function dynamicHtml(){
				var availableSpecsExtract = {};
				var dataSpecs = typeof(config.extras.showOnlySpecs) === "object" ? config.extras.showOnlySpecs : config.productView.skuList.skus[0].specs;
				var isFirstDataSpec = true;
				var idDataSpecActive = null;
				var dataSpecUnattached;
				var firstItemPersonalized = config.jqItem.closest('.first-item').find(".refresh");
				if(firstItemPersonalized.length > 0){
					firstItemPersonalized.click(function(){
						config.scope.CustomSpecObj.refreshClicked = true;
					});
				}
				var refsVertical = config.jqItem.closest("#widget").find('.refs-frame.frame.vertical .carousel-item');
				if(refsVertical.length > 0){
					refsVertical.click(function(){
						config.scope.CustomSpecObj.refreshClicked = true;
					});
				}
	
				/* iterate all specs from create html structure */
				for (var dataSpec in dataSpecs) {
					availableSpecsExtract[dataSpec] = (config.productView.availableSpecs && config.productView.availableSpecs[dataSpec]) || config.productView.skuList.groupBy(dataSpec);
					
					if(!availableSpecsExtract[dataSpec]){
						continue;
					}
					
					switch (isFirstDataSpec) {
						case true:
							dataSpecUnattached = dataSpec;
							break;                
						case !true:
							if(!config.productView.availableSpecs){
								for (var specIndex in availableSpecsExtract[dataSpec]){
									var dependentOnObjs = availableSpecsExtract[dataSpec][specIndex].skus.groupBy(dataSpecUnattached);
									availableSpecsExtract[dataSpec][specIndex].dependentOn = dependentOnObjs;
								}
							}
							break;
					}
	
					config.scope.CustomSpecObj.positionActiveSpec["id" + jqItemId][dataSpec] = config.scope.CustomSpecObj.positionActiveSpec["id" + jqItemId][dataSpec] || 0;
					
					var arrowPrevElement = $("<a class='spec-arrow spec-prev prev-" + dataSpec.toLowerCase() + "'></a>");
					var arrowNextElement = $("<a class='spec-arrow spec-next next-" + dataSpec.toLowerCase() + "'></a>");
					var containerElement = $("<div class='spec-container'></div>");
					var carouselElement = $("<div class='spec-carousel'></div>");
					var listElement = $("<div class='list-specs'></div>");
	
					var itemsList = $();
	
					var lengthSpecs = Object.keys(availableSpecsExtract[dataSpec]).length;
					var index = -1;
					for (var j = 0; j < lengthSpecs; j++) {
						index = ++index;
						var availableSppecCurrent = availableSpecsExtract[dataSpec][Object.keys(availableSpecsExtract[dataSpec])[j]];
						if((config.extras.hideUnavailables && availableSppecCurrent.status === "unavailable") || 
						(!isFirstDataSpec && availableSppecCurrent.dependentOn && (!availableSppecCurrent.dependentOn[idDataSpecActive] || (availableSppecCurrent.dependentOn[idDataSpecActive] && availableSppecCurrent.dependentOn[idDataSpecActive].status === "unavailable")))){
							index = --index;
							continue;
						}
						var specId = Object.keys(availableSpecsExtract[dataSpec])[j];
						var specLabel = availableSpecsExtract[dataSpec][Object.keys(availableSpecsExtract[dataSpec])[j]].label;
						var specObj = availableSpecsExtract[dataSpec][Object.keys(availableSpecsExtract[dataSpec])[j]];
						var itemElement = $("<div class='spec-selector item-spec'></div>");
						itemElement.attr("original-index", index);
						itemElement.attr("data-spec-id", specId);
						itemElement.attr("data-spec", dataSpec);
						if(config.extras.title){
							var title = availableSpecsExtract[dataSpec][Object.keys(availableSpecsExtract[dataSpec])[j]].title || specId;
							itemElement.attr("title", title);
						}
						if (config.productView.selectedSpecs[dataSpec] === specId) {
							itemElement.addClass("active");
							idDataSpecActive = isFirstDataSpec ? specId : idDataSpecActive;
							isFirstDataSpec = false;
						}
						if (specObj.status === "unavailable") {
							itemElement.addClass("unavailable");
						}
						
						var linkElement = $("<a class='spec-link' style='width:100%; height:100%;'></a>");
						var colorImg = (availableSpecsExtract[dataSpec][specId].urlImage && "url("+availableSpecsExtract[dataSpec][specId].urlImage+")") || availableSpecsExtract[dataSpec][specId].image || Object.keys(availableSpecsExtract[dataSpec])[j];
						var imgElement = $(availableSpecsExtract[dataSpec][specId].htmlImage || "<div style='background:"+colorImg+" 100% 100% / 100% no-repeat;'></div>");
						imgElement.css("width", "100%");
						imgElement.css("height", "100%");
	
						linkElement.append(imgElement);
						itemElement.append(linkElement);
						itemsList = itemsList.add(itemElement);
					}
	
					if(config.extras.showSolitarySpec === false && itemsList.length < 2){
						continue;
					}
	
					itemsList.last().addClass("last-item");
	
					listElement.append(itemsList);
					carouselElement.append(listElement);
					containerElement.append(carouselElement);
	
					var containerSpec = $("<div class='custom-spec-container custom-spec-" + dataSpec.toLowerCase() + "'></div>");
					containerSpec.append(arrowPrevElement);
					containerSpec.append(containerElement);
					containerSpec.append(arrowNextElement);
					if(listElement.length > 0){
						config.jqItem.find(".custom-specs").append(containerSpec);
					}
				}
			}
			
			function hasActive() {
				var returner = false;
				listSpec.find(".item-spec").each(function (index) {
					if ($(this).hasClass("active") && index <= listSpec.find(".item-spec").length) {
						returner = true;
					}
				});
				return returner;
			}

			function activeIsVisible(dataSpec) {
				var returner = false;
				var correctPosition = config.scope.CustomSpecObj.positionActiveSpec["id" + jqItemId][dataSpec] || "0";
				if (listSpec.children(":first").attr("original-index") === correctPosition) {
					returner = true;
				}
				return returner;
			}

			function checkArrows(listSpec) {
				var itemSpec = listSpec.find(".item-spec");
				var visibleElementsQty = visibleElementQuantity();
				var lengthItems = listSpec.find(".item-spec").length;
				var lastIndexItem = lengthItems-1;
				if(config.infinitLoop && lengthItems <= visibleElementsQty){
					arrowNext.removeClass("disabled");
					arrowPrev.removeClass("disabled");
				}else{
					if (lengthItems <= visibleElementsQty) {
						arrowNext.addClass("disabled");
						arrowPrev.addClass("disabled");
					} else if ($(listSpec.find(".item-spec")[visibleElementsQty-1]).hasClass('last-item')) {
						arrowNext.addClass("disabled");
					} else if ((listSpec.find(".item-spec:first").attr('original-index') === "0" && listSpec.find(".item-spec.active").attr('original-index') <= visibleElementsQty) ||
					(listSpec.find(".item-spec:first").attr('original-index') === "0" && listSpec.find(".item-spec.active").length === 0)) {
						arrowPrev.addClass("disabled");
					}
				}
			}

			function checkIfActiveIsVisible(specCarousel) {
				listSpec = specCarousel.find(".list-specs");
				var dataSpec = listSpec.find('.item-spec').attr('data-spec');
				if (hasActive() && !activeIsVisible(dataSpec)) {
					var correctPosition = config.scope.CustomSpecObj.positionActiveSpec["id" + jqItemId][dataSpec] || 0;
					specCarousel.stop().animate(nextProp, {
						duration: 0,
						complete: function () {
							specCarousel.scrollLeft(0);
							repeatRun(function () {
								listSpec.children(":last").after(listSpec.children(":first"));
							}, correctPosition);
						}
					});
					config.extras.duration = duration;
				}
				checkArrows(listSpec);
			}

			function organizeSpecs(qtyVisibleElements){
				var widthVisibleSpecs = element.find(".item-spec").outerWidth(true)*qtyVisibleElements;
				var marginBetweenSpecs = widthSpecCarousel-widthVisibleSpecs;
				marginBetweenSpecs = marginBetweenSpecs/qtyVisibleElements;
				marginBetweenSpecs = marginBetweenSpecs < 1 ? 1 : marginBetweenSpecs;
				marginBetweenSpecs = "1px "+marginBetweenSpecs+"px 2px 1px";
				element.find(".item-spec").css("margin", marginBetweenSpecs);
				element.find('.spec-container .spec-carousel').each(function (index) {
					listSpec = $(this).find('.list-specs');
					/* adding 10 more pixels to ensure all inline specs */
					widthListSpec = ((listSpec.children().length * listSpec.find('.item-spec').outerWidth(true))+10) + "px";
					listSpec.css("width", widthListSpec);
				});
			}

			function setGlobalVariables(){
				element.find('.spec-container .spec-carousel').each(function (index) {
					specCarousel = $(this);
					listSpec = specCarousel.find('.list-specs');
					first = listSpec.children(":first");
					last = listSpec.children(":last");
					arrowPrev = specCarousel.closest('.custom-spec-container').find(".spec-prev");
					arrowNext = specCarousel.closest('.custom-spec-container').find(".spec-next");
					widthSpecCarousel = specCarousel.outerWidth();
					checkIfActiveIsVisible(specCarousel);
				});
				organizeSpecs(visibleElementQuantity());
			}

			if(!config.extras.disableDynamicHtml){
				dynamicHtml();
			}

			if(config.scope.CustomSpecObj.refreshClicked === true){
				setTimeout(function(){
					setGlobalVariables();
					config.scope.CustomSpecObj.refreshClicked = false;
				},300);
			}else if(!config.scope.CustomSpecObj.onlyResizeNow){
				/* wait 1000ms to resize to ensure there is no misinterpretation of the browser */
				setTimeout(function(){
					setGlobalVariables();
					config.scope.CustomSpecObj.onlyResizeNow = true;
				},1000);
			}else{
				setGlobalVariables();
			}

			var hasClicked = false;
			var handler = chaordic.Function.debounce(function() {
				if(!hasClicked && element.find('.spec-carousel:first-child').outerWidth() !== widthSpecCarousel){
					element.find(".spec-carousel:first-child .item-spec.active").trigger('click');
					hasClicked = true;
					$(window).unbind('resize', handler);
				}
			},300);
		
			$(window).bind('resize', handler);

			arrowPrev = element.find(".spec-prev");
			arrowNext = element.find(".spec-next");
		})();

		function setScope(scope) {
			specCarousel = scope.find('.spec-carousel');
			listSpec = specCarousel.find('.list-specs');
			widthSpecCarousel = specCarousel.outerWidth();
			first = listSpec.children(":first");
			last = listSpec.children(":last");
			arrowPrev = scope.find(".spec-prev");
			arrowNext = scope.find(".spec-next");
			visibleElementQuantity();
			calcDistance(config.extras.itemsPerMove);
		}

		/*Calculate distance of the elements for the animation*/
		function calcDistance(itemsPerMove) {
			distance = Math.max(first.outerWidth(true), last.outerWidth(true)) * itemsPerMove;
			prevProp = {
				'scrollLeft': "-=" + distance
			};
			nextProp = {
				'scrollLeft': '+=' + distance
			};
		}

		function visibleElementQuantity(visibleElements) {
			if (config.extras.visibleElements === -1) {
				widthItem = element.find(".item-spec").outerWidth(true);
				var marginMin = widthSpecCarousel/widthItem;
				config.extras.visibleElements = Math.floor(widthSpecCarousel / (widthItem+marginMin));
			}
			return config.extras.visibleElements;
		}

		function checkPositionLastItem() {
			if (listSpec.children(":first").hasClass("last-item")) {
				return 1;
			} else if (listSpec.children(":last").hasClass("last-item")) {
				return -1;
			} else {
				return 0;
			}
		}

		function checkIfLastItemIsVisible() {
			var qtdVisibleElements = config.extras.visibleElements;
			var returner = false;
			listSpec.find(".item-spec").each(function (index) {
				if ($(this).hasClass("last-item") && index + 1 <= qtdVisibleElements) {
					returner = true;
				}
			});
			return returner;
		}

		function checkIfFirstIsVisible() {
			var returner = false;
			if (listSpec.children(":last").hasClass("last-item")) {
				returner = true;
			}
			return returner;
		}

		function savePositionActive(spec) {
			var dataSpec = spec.attr('data-spec');
			/*Global variable to save active spec position */
			config.scope.CustomSpecObj.positionActiveSpec["id" + jqItemId][dataSpec] = spec.attr("original-index");
		}

		function setItemsPerMoveLastAction(itemsPerMoveLastAction) {
			config.scope.CustomSpecObj.itemsPerMoveLastAction = itemsPerMoveLastAction;
		}

		function move(config, scope) {
			if (config.dir === 'next') {
				specCarousel.stop().animate(nextProp, {
					duration: config.extras.duration,
					complete: function () {
						specCarousel.scrollLeft(0);
						repeatRun(function () {
							listSpec.children(":last").after(listSpec.children(":first"));
							savePositionActive(listSpec.children(":first"));
							setItemsPerMoveLastAction(itemsPerMoveLastAction);
						}, config.extras.itemsPerMove);
					}
				});
			} else if (config.dir === 'prev') {
				for (var i = 0; i < config.extras.itemsPerMove; i++) {
					listSpec.prepend(listSpec.children(":last"));
				}
				specCarousel['scrollLeft'](distance).stop().animate(prevProp, {
					duration: config.extras.duration,
					complete: function () {
						savePositionActive(listSpec.children(":first"));
					}
				});
			}
		}

		function repeatRun(func, times) {
			for (var i = 0; i < times; i++) {
				func();
			}
		}

		function disableClickFunc(arrow) {
			if (arrow === ".spec-prev") {
				arrowPrev.addClass("disabled");
				arrowNext.removeClass("disabled");
			} else if (arrow === ".spec-next") {
				arrowNext.addClass("disabled");
				arrowPrev.removeClass("disabled");
			}
		}
		
		function getLastVisibleElement() {
			/* -1 because the list begin with zero */
			return parseInt($(listSpec.find('.item-spec')[config.extras.visibleElements - 1]).attr("original-index"));
		}        

		arrowPrev.click(function () {
			typeSpecContainer = $(this).parent();
			setScope(typeSpecContainer);
			if (!config.extras.infinitLoop && config.extras.visibleElements < listSpec.children().length) {
				if (config.extras.itemsPerMove > 1 && checkIfLastItemIsVisible()) {
					var itemsPerMove = config.extras.itemsPerMove;
					config.extras.itemsPerMove = itemsPerMoveLastAction;
					calcDistance(config.extras.itemsPerMove);
					move($.extend(config, {
						dir: "prev"
					}), typeSpecContainer);
					arrowNext.removeClass("disabled");
					config.extras.itemsPerMove = itemsPerMove;
					/* reset from rotation number elements default */
					calcDistance(config.extras.itemsPerMove);
				} else if (checkPositionLastItem() !== -1) {
					arrowNext.removeClass("disabled");
					move($.extend(config, {
						dir: "prev"
					}));
				}
				if (checkIfFirstIsVisible()) {
					disableClickFunc(".spec-prev");
				}
			} else if (config.extras.visibleElements < listSpec.children().length) {
				move($.extend(config, {
					dir: "prev"
				}));
			}
		});

		arrowNext.click(function () {
			typeSpecContainer = $(this).parent();
			setScope(typeSpecContainer);
			if (!config.extras.infinitLoop && config.extras.visibleElements < listSpec.children().length) {
				if (!checkIfLastItemIsVisible()) {
					arrowPrev.removeClass("disabled");
					var itemsPerMove = config.extras.itemsPerMove;
					var duration = config.extras.duration;
					var lastItemOriginalIndex = listSpec.children().length - 1;
					var toLastElement = listSpec.find('[original-index="' + lastItemOriginalIndex + '"]');
					toLastElement = parseInt($(toLastElement).attr("original-index")) - (getLastVisibleElement());
					if (itemsPerMove > toLastElement) {
						calcDistance(toLastElement);
						config.extras.duration = config.extras.duration + 150;
						config.extras.itemsPerMove = toLastElement;
						disableClickFunc(".spec-next");
					}
					itemsPerMoveLastAction = config.extras.itemsPerMove;
					move($.extend(config, {
						dir: "next"
					}));

					var timeToCheck = (config.extras.duration === duration) ? config.extras.duration + 10 : config.extras.duration + 160;
					setTimeout(function () {
						config.extras.itemsPerMove = itemsPerMove;
						config.extras.duration = duration;
						if (checkIfLastItemIsVisible()) {
							disableClickFunc(".spec-next");
						}
					}, timeToCheck);
				} else {
					disableClickFunc(".spec-next");
				}
			} else if (config.extras.visibleElements < listSpec.children().length) {
				arrowPrev.removeClass("disabled");
				arrowNext.removeClass("disabled");
				move($.extend(config, {
					dir: "next"
				}));
			}
		});

		return element;
	};

	chaordic.onsite.CustomSpecFeature = CustomSpecFeature;
})();