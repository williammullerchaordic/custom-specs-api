# custom-specs-api
Implementation component custom-specs-api from onsite-js

# Default Structure necessary from work correctly of component Constructor custom spec

 # values to config:
	scope: {}, -- mandatory --
	productView: {}, -- mandatory --
	jqItem: {}, -- mandatory --
	visibleElements: -1, -- optional --
	-- All extras is optional -- 
	extras: {
		visibleElements: -1,
		itemsPerMove: 1,
		duration: 1000,
		infinitLoop: false,
		hideUnavailables: true,
		showSolitarySpec: true,
		showOnlySpecs: false,
		title: true
	}

# Object created in theme.js insight:
	productView.availableSpecs = {
		"Color": {
			"BLANCO": {
			"label": "BLANCO",
			"status": "available",
			"urlImage": "http://cuerosvelez.vteximg.com.br/arquivos/BLANCO.jpg"
			}
		},
		"Talla": {
			"39": {
			"label": "39",
			"status": "available",
			"htmlImage": "<div style=\"width: 100%; height: 100%;\">39</div>",
			"dependentOn": {
				"Brandy": "Brandy",
				"Azul": "Azul"
			}
		}
	}
